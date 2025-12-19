import json
import os
import matplotlib.pyplot as plt
import numpy as np

# --- KONFIGURASI ---
INPUT_FOLDER = 'mp_world_json_clean'
OUTPUT_FOLDER = 'plots_final_check'
WINDOW_SIZE = 60
SAMPLE_RATE = 30

# BATAS ZONA WARNA (Sesuai Fisika)
LIMIT_NORMAL = 0.015  # 1.5 cm
LIMIT_MILD   = 0.040  # 4.0 cm

def calculate_smart_metrics(data):
    """
    Hitung metrik Cerdas (98th Percentile) untuk judul grafik.
    Ini konsisten dengan script Audit Smart.
    """
    if len(data) < WINDOW_SIZE: return 0, 0
    
    amps = []
    freqs = []
    
    step = 10 
    for i in range(0, len(data) - WINDOW_SIZE, step):
        window = data[i : i + WINDOW_SIZE]
        
        y_vals = np.array([p['y'] for p in window])
        x_vals = np.array([p['x'] for p in window])
        
        dx = np.max(x_vals) - np.min(x_vals)
        dy = np.max(y_vals) - np.min(y_vals)
        amp = np.sqrt(dx*dx + dy*dy)
        amps.append(amp)

        mean_y = np.mean(y_vals)
        signal_y = y_vals - mean_y
        crossings = 0
        for j in range(1, len(signal_y)):
            if (signal_y[j-1] > 0 and signal_y[j] < 0) or \
               (signal_y[j-1] < 0 and signal_y[j] > 0):
                crossings += 1
        freq = crossings / (2 * (len(window)/SAMPLE_RATE))
        freqs.append(freq)

    if not amps: return 0, 0
    
    # Gunakan 98th Percentile agar kebal terhadap glitch 1 frame
    smart_amp = np.percentile(amps, 98)
    avg_freq = np.mean(freqs)
    
    return smart_amp, avg_freq

def generate_plots():
    if not os.path.exists(INPUT_FOLDER):
        print(f"Folder {INPUT_FOLDER} tidak ditemukan.")
        return
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.json')]
    files.sort()

    print(f"Membuat {len(files)} grafik Skala Tetap (Fixed Scale)...")

    for filename in files:
        file_path = os.path.join(INPUT_FOLDER, filename)
        with open(file_path, 'r') as f:
            data = json.load(f)

        if len(data) < 10: continue

        # Hitung Metrik untuk Judul
        smart_amp, avg_freq = calculate_smart_metrics(data)

        # Plot Y Centered
        y_vals = np.array([d['y'] for d in data])
        y_centered = y_vals - np.mean(y_vals)
        t = np.arange(len(y_centered)) / SAMPLE_RATE

        plt.figure(figsize=(10, 6))
        
        # --- 1. GAMBAR ZONA WARNA (Traffic Light) ---
        # Ini panduan mata Anda.
        
        # Hijau (Aman/Normal)
        plt.axhspan(-LIMIT_NORMAL, LIMIT_NORMAL, color='#dcfce7', alpha=0.6)
        plt.text(0, 0.005, "AREA NORMAL", color='green', fontsize=9, alpha=0.5, fontweight='bold')

        # Kuning (Hati-hati/Mild)
        plt.axhspan(LIMIT_NORMAL, LIMIT_MILD, color='#fef9c3', alpha=0.6)
        plt.axhspan(-LIMIT_MILD, -LIMIT_NORMAL, color='#fef9c3', alpha=0.6)
        
        # Merah (Bahaya/Severe)
        plt.axhspan(LIMIT_MILD, 0.2, color='#fee2e2', alpha=0.6)
        plt.axhspan(-0.2, -LIMIT_MILD, color='#fee2e2', alpha=0.6)

        # --- 2. PLOT GARIS DATA ---
        plt.plot(t, y_centered, color='#1e3a8a', linewidth=1.5, label='Gerakan Tangan')

        # --- 3. KUNCI SKALA (WAJIB) ---
        # Kita kunci di +/- 8 cm. Grafik tidak akan pernah zoom in/out sendiri.
        plt.ylim(-0.08, 0.08)
        
        # Label Saran di Judul
        sugg = "NORMAL"
        col = "green"
        if smart_amp > LIMIT_NORMAL: sugg = "MILD"; col = "#b45309"
        if smart_amp > LIMIT_MILD: sugg = "SEVERE"; col = "red"

        plt.title(f"File: {filename}\nSmart Amp: {smart_amp:.4f} m | Prediksi: {sugg}", 
                  fontsize=14, fontweight='bold', color=col)
        plt.xlabel("Waktu (detik)")
        plt.ylabel("Simpangan (Meter)")
        plt.grid(True, alpha=0.3, linestyle='--')
        
        # Simpan
        output_name = os.path.splitext(filename)[0] + '.png'
        plt.savefig(os.path.join(OUTPUT_FOLDER, output_name))
        plt.close()
        
        print(f"Saved: {output_name} -> {sugg}")

    print(f"\nSelesai! Buka folder '{OUTPUT_FOLDER}'.")
    print("Cara Labeling:")
    print("1. Garis biru di zona HIJAU? -> Normal")
    print("2. Garis biru kena KUNING? -> Mild")
    print("3. Garis biru kena MERAH? -> Severe")

if __name__ == "__main__":
    generate_plots()