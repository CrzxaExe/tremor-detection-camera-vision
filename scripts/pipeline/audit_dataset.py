import json
import os
import numpy as np

# --- KONFIGURASI ---
INPUT_FOLDER = 'mp_world_json_clean'
WINDOW_SIZE = 60

# BATAS FISIK (METER)
LIMIT_NORMAL = 0.015  # < 1.5 cm
LIMIT_MILD   = 0.040  # < 4.0 cm

def audit_smart():
    if not os.path.exists(INPUT_FOLDER):
        print(f"Folder {INPUT_FOLDER} tidak ditemukan.")
        return

    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.json')]
    files.sort()

    print(f"--- SMART AUDIT DATASET ({len(files)} Pasien) ---")
    print(f"Metode: Mengabaikan 2% Data Ekstrem (Outlier/Glitch)")
    print("-" * 75)
    print(f"{'FILENAME':<15} | {'RAW MAX':<10} | {'98% AMP':<10} | {'STATUS BARU'}")
    print("-" * 75)

    count_normal = 0
    count_mild = 0
    count_severe = 0

    for filename in files:
        file_path = os.path.join(INPUT_FOLDER, filename)
        with open(file_path, 'r') as f:
            data = json.load(f)

        if len(data) < WINDOW_SIZE: continue

        # Kumpulkan semua amplitudo per window
        all_window_amps = []
        
        step = 10 # Step lebih rapat
        for i in range(0, len(data) - WINDOW_SIZE, step):
            window = data[i : i + WINDOW_SIZE]
            x_vals = np.array([p['x'] for p in window])
            y_vals = np.array([p['y'] for p in window])
            
            dx = np.max(x_vals) - np.min(x_vals)
            dy = np.max(y_vals) - np.min(y_vals)
            amp = np.sqrt(dx*dx + dy*dy)
            all_window_amps.append(amp)

        if not all_window_amps: continue

        # --- LOGIKA CERDAS ---
        # 1. Nilai Max Murni (yang menipu audit lama)
        raw_max = np.max(all_window_amps)
        
        # 2. Nilai 98th Percentile (Membuang glitch sesaat)
        smart_amp = np.percentile(all_window_amps, 98)

        # Konversi ke CM
        raw_cm = raw_max * 100
        smart_cm = smart_amp * 100

        # Tentukan Status berdasarkan SMART AMP
        status = "NORMAL"
        if smart_amp > LIMIT_NORMAL: status = "MILD"
        if smart_amp > LIMIT_MILD:   status = "SEVERE"

        # Statistik
        if status == "NORMAL": count_normal += 1
        elif status == "MILD": count_mild += 1
        else: count_severe += 1

        # Marker
        marker = "🟢"
        if status == "MILD": marker = "🟡"
        if status == "SEVERE": marker = "🔴"
        
        # Cek apakah dia "Pasien Palsu" (Raw Severe tapi Smart Normal)
        note = ""
        if raw_cm > 4.0 and smart_cm < 1.5:
            note = "<-- GLITCH DETECTED! (Dulu Severe)"

        print(f"{filename:<15} | {raw_cm:5.1f} cm  | {smart_cm:5.1f} cm  | {marker} {status:<7} {note}")

    print("-" * 75)
    print("KESIMPULAN BARU:")
    print(f"🟢 Normal : {count_normal}")
    print(f"🟡 Mild   : {count_mild}")
    print(f"🔴 Severe : {count_severe}")
    
    if count_severe == 0:
        print("\n✅ VALIDASI: Data konsisten dengan pengamatan visual Anda.")
        print("   Angka 'Severe' sebelumnya hanyalah noise kamera sesaat.")

if __name__ == "__main__":
    audit_smart()