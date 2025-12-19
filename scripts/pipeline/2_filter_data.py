import json
import os
import math

# --- KONFIGURASI ---
INPUT_FOLDER = 'mp_world_json_raw'      # Ambil dari hasil langkah 1
OUTPUT_FOLDER = 'mp_world_json_clean'   # Simpan hasil bersih di sini

def is_valid(val):
    return math.isfinite(val) # Cek bukan NaN dan bukan Infinity

def run_filtering():
    if not os.path.exists(INPUT_FOLDER):
        print(f"Error: Folder '{INPUT_FOLDER}' tidak ditemukan. Jalankan 1_convert.py dulu.")
        return
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.json')]
    print(f"--- LANGKAH 2: FILTERING & CLEANING ({len(files)} files) ---")

    for filename in files:
        in_path = os.path.join(INPUT_FOLDER, filename)
        
        with open(in_path, 'r') as f:
            raw_data = json.load(f)
        
        clean_data = []
        removed_count = 0
        
        for frame in raw_data:
            x, y, z = frame['x'], frame['y'], frame['z']
            
            # LOGIKA FILTERING
            if is_valid(x) and is_valid(y) and is_valid(z):
                clean_data.append(frame)
            else:
                removed_count += 1
        
        # Simpan hanya jika ada data tersisa
        if clean_data:
            with open(os.path.join(OUTPUT_FOLDER, filename), 'w') as f:
                json.dump(clean_data, f)
            
            status = f"[OK] {filename}"
            if removed_count > 0:
                status += f" | Dibuang: {removed_count} frame sampah"
            print(status)
        else:
            print(f"[WARN] {filename} kosong setelah filtering!")

    print(f"\nSelesai. Data bersih disimpan di folder '{OUTPUT_FOLDER}/'")

if __name__ == "__main__":
    run_filtering()