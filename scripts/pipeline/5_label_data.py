import os
import csv
import json
import numpy as np
import math

# --- KONFIGURASI ---
JSON_FOLDER = 'mp_world_json_clean'
OUTPUT_CSV = 'labels.csv'
WINDOW_SIZE = 60  # 2 detik @ 30 FPS
SAMPLE_RATE = 30
TOLERANCE_STABILITY = 0.05 # Sesuaikan dengan tuning landmarkVariable.ts Anda

def calculate_file_metrics(file_path):
    """
    Menghitung statistik fisik dari file JSON menggunakan Sliding Window.
    Kita cari nilai 'puncak' (Max Amp, Max Freq, Min Stab) karena 
    tremor dinilai dari momen terburuknya.
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        if len(data) < WINDOW_SIZE:
            return 0, 0, 1 # Data terlalu pendek

        # Array untuk menyimpan hasil tiap window
        amps = []
        freqs = []
        stabs = []

        # Sliding Window Loop
        step = 30 # Geser setiap 1 detik
        for i in range(0, len(data) - WINDOW_SIZE, step):
            window = data[i : i + WINDOW_SIZE]
            
            # Extract X, Y
            x_vals = np.array([p['x'] for p in window])
            y_vals = np.array([p['y'] for p in window])
            
            # 1. Amplitude (Diagonal Max-Min)
            dx = np.max(x_vals) - np.min(x_vals)
            dy = np.max(y_vals) - np.min(y_vals)
            amp = np.sqrt(dx*dx + dy*dy)
            amps.append(amp)

            # 2. Frequency (Zero Crossing Y)
            mean_y = np.mean(y_vals)
            signal_y = y_vals - mean_y
            crossings = 0
            for j in range(1, len(signal_y)):
                if (signal_y[j-1] > 0 and signal_y[j] < 0) or \
                   (signal_y[j-1] < 0 and signal_y[j] > 0):
                    crossings += 1
            duration = len(window) / SAMPLE_RATE
            freq = crossings / (2 * duration) if duration > 0 else 0
            freqs.append(freq)

            # 3. Stability
            mx = np.mean(x_vals)
            my = np.mean(y_vals)
            dists = np.sqrt((x_vals - mx)**2 + (y_vals - my)**2)
            # StdDev of distances
            stddev = np.std(dists)
            
            stab = 1 - (stddev / TOLERANCE_STABILITY)
            if stab < 0: stab = 0
            if stab > 1: stab = 1
            stabs.append(stab)

        if not amps: return 0, 0, 1

        # KEMBALIKAN NILAI WORST CASE (Paling Tremor)
        # Amp diambil Max, Freq diambil rata-rata dari window yang Amp-nya tinggi, Stab diambil Min
        max_amp = np.max(amps)
        min_stab = np.min(stabs)
        
        # Untuk frekuensi, kita ambil rata-rata saja karena max freq bisa noise
        avg_freq = np.mean(freqs)

        return max_amp, avg_freq, min_stab

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0, 0, 0

def generate_smart_labels():
    if not os.path.exists(JSON_FOLDER):
        print(f"Folder {JSON_FOLDER} tidak ditemukan.")
        return

    files = [f for f in os.listdir(JSON_FOLDER) if f.endswith('.json')]
    files.sort()

    print(f"Menganalisis {len(files)} file untuk menghasilkan Smart Labels...")

    # Cek apakah file CSV sudah ada biar label lama tidak hilang
    existing_labels = {}
    if os.path.exists(OUTPUT_CSV):
        print("⚠️  Membaca label yang sudah ada...")
        try:
            with open(OUTPUT_CSV, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing_labels[row['filename']] = row['label']
        except: pass

    # Header CSV Baru
    headers = ['filename', 'label', 'calc_amp', 'calc_freq', 'calc_stab', 'auto_suggestion']

    with open(OUTPUT_CSV, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for idx, filename in enumerate(files):
            # 1. Hitung Metrik
            file_path = os.path.join(JSON_FOLDER, filename)
            amp, freq, stab = calculate_file_metrics(file_path)

            # 2. Auto Suggestion (Saran Label Otomatis)
            # Ini logika kasar untuk membantu Anda, bukan kebenaran mutlak
            suggestion = "???"
            if amp < 0.02: suggestion = "Normal"
            elif amp < 0.05: suggestion = "Mild"
            else: suggestion = "Severe"

            # 3. Ambil Label Lama jika ada
            current_label = existing_labels.get(filename, suggestion) # Default ke suggestion jika belum ada

            # 4. Tulis ke CSV
            # Format angka biar rapi (4 desimal)
            writer.writerow([
                filename, 
                current_label, 
                f"{amp:.5f}", 
                f"{freq:.2f}", 
                f"{stab:.3f}", 
                suggestion
            ])
            
            if idx % 10 == 0:
                print(f"Processed {idx}/{len(files)}...")

    print(f"\nSelesai! File '{OUTPUT_CSV}' telah dibuat.")
    print("Kolom 'auto_suggestion' adalah saran berdasarkan Amplitude.")
    print("Silakan review kolom 'calc_amp', 'calc_freq', 'calc_stab' untuk menentukan label final.")

if __name__ == "__main__":
    generate_smart_labels()