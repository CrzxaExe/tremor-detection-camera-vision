import json
import os
import numpy as np
from data_loader import load_pkl_wrist_data

# --- KONFIGURASI ---
INPUT_FOLDER = 'mp_world'      # Folder berisi .pkl
OUTPUT_FOLDER = 'mp_world_json_raw'     # Folder hasil json mentah (bisa ada NaN)

def run_conversion():
    if not os.path.exists(INPUT_FOLDER):
        print(f"Error: Folder '{INPUT_FOLDER}' tidak ditemukan.")
        return
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.pkl')]
    print(f"--- LANGKAH 1: KONVERSI RAW ({len(files)} files) ---")

    success_count = 0

    for filename in files:
        pkl_path = os.path.join(INPUT_FOLDER, filename)
        
        # Gunakan library loader kita
        wrist_data = load_pkl_wrist_data(pkl_path)
        
        if wrist_data is not None:
            # Konversi numpy ke list of dicts
            json_output = []
            for row in wrist_data:
                # Kita simpan nilainya apa adanya (termasuk NaN)
                json_output.append({
                    'x': float(row[0]),
                    'y': float(row[1]),
                    'z': float(row[2])
                })
            
            # Simpan
            out_name = os.path.splitext(filename)[0] + '.json'
            with open(os.path.join(OUTPUT_FOLDER, out_name), 'w') as f:
                json.dump(json_output, f)
            
            print(f"[OK] {filename} -> {len(json_output)} frames")
            success_count += 1
        else:
            print(f"[FAIL] {filename} (Gagal load data)")

    print(f"\nSelesai. Berhasil: {success_count}/{len(files)}")
    print(f"File JSON mentah disimpan di folder '{OUTPUT_FOLDER}/'")

if __name__ == "__main__":
    run_conversion()