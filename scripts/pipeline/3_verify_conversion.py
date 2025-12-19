import json
import os
import numpy as np
from data_loader import load_pkl_wrist_data

# --- KONFIGURASI ---
RAW_PKL_FOLDER = 'mp_world'
JSON_RAW_FOLDER = 'mp_world_json_raw'
JSON_CLEAN_FOLDER = 'mp_world_json_clean'

def verify_integrity():
    print("--- LANGKAH 3: VERIFIKASI FINAL ---")
    
    files = [f for f in os.listdir(RAW_PKL_FOLDER) if f.endswith('.pkl')]
    
    print(f"{'FILENAME':<20} | {'RAW CONVERSION':<15} | {'FINAL QUALITY':<15}")
    print("-" * 60)

    for filename in files:
        base_name = os.path.splitext(filename)[0]
        json_name = base_name + '.json'
        
        status_raw = "MISSING"
        status_clean = "MISSING"
        
        # 1. VERIFIKASI KONVERSI (PKL vs JSON RAW)
        # Ini memastikan logika ekstraksi kita benar
        pkl_path = os.path.join(RAW_PKL_FOLDER, filename)
        raw_json_path = os.path.join(JSON_RAW_FOLDER, json_name)
        
        if os.path.exists(raw_json_path):
            wrist_pkl = load_pkl_wrist_data(pkl_path)
            with open(raw_json_path, 'r') as f:
                json_raw_data = json.load(f)
            
            # Convert json list to numpy for comparison
            json_arr = np.array([[r['x'], r['y'], r['z']] for r in json_raw_data])
            
            # Bandingkan (termasuk NaN harus di posisi yang sama)
            # Kita gunakan np.allclose dengan equal_nan=True
            if wrist_pkl is not None and len(wrist_pkl) == len(json_arr):
                if np.allclose(wrist_pkl, json_arr, atol=1e-9, equal_nan=True):
                    status_raw = "✅ MATCH"
                else:
                    status_raw = "❌ DIFF"
            else:
                status_raw = "❌ LEN ERR"
        
        # 2. VERIFIKASI KUALITAS (JSON CLEAN)
        # Ini memastikan file akhir siap pakai (tidak ada NaN)
        clean_json_path = os.path.join(JSON_CLEAN_FOLDER, json_name)
        
        if os.path.exists(clean_json_path):
            with open(clean_json_path, 'r') as f:
                clean_data = json.load(f)
            
            # Cek manual apakah ada NaN tersisa
            has_nan = False
            for r in clean_data:
                if not (np.isfinite(r['x']) and np.isfinite(r['y']) and np.isfinite(r['z'])):
                    has_nan = True
                    break
            
            if len(clean_data) == 0:
                status_clean = "⚠️ EMPTY"
            elif has_nan:
                status_clean = "❌ HAS NAN"
            else:
                status_clean = "✅ READY"
        
        print(f"{filename:<20} | {status_raw:<15} | {status_clean:<15}")

if __name__ == "__main__":
    verify_integrity()