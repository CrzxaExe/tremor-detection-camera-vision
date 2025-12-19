import csv
import os
import random

# --- KONFIGURASI ---
INPUT_CSV = 'labels.csv' 

OUTPUT_TRAIN = 'dataset_train.csv'
OUTPUT_TEST = 'dataset_test.csv'
SPLIT_RATIO = 0.8  # 80% Train, 20% Test

def split_dataset():
    if not os.path.exists(INPUT_CSV):
        print(f"Error: File '{INPUT_CSV}' tidak ditemukan.")
        print("Pastikan Anda sudah menjalankan '8_auto_label_physics.py' sebelumnya.")
        return

    # 1. BACA DATA
    print(f"Membaca {INPUT_CSV}...")
    all_data = []
    headers = []
    
    with open(INPUT_CSV, 'r') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        for row in reader:
            all_data.append(row)

    # 2. KELOMPOKKAN BERDASARKAN LABEL (Stratified Strategy)
    data_by_label = {}
    for row in all_data:
        label = row['label']
        if label not in data_by_label:
            data_by_label[label] = []
        data_by_label[label].append(row)

    train_set = []
    test_set = []

    print(f"\n--- HASIL SPLIT ({int(SPLIT_RATIO*100)}% Train / {int((1-SPLIT_RATIO)*100)}% Test) ---")
    print(f"{'LABEL':<10} | {'TOTAL':<5} | {'TRAIN':<5} | {'TEST':<5}")
    print("-" * 40)

    # 3. BAGI SETIAP KELOMPOK
    for label, items in data_by_label.items():
        # Acak urutan agar tidak bias urutan waktu/abjad
        random.shuffle(items)
        
        # Hitung titik potong
        n_total = len(items)
        n_train = int(n_total * SPLIT_RATIO)
        
        # Aturan khusus untuk data yang sangat sedikit
        if n_total == 1:
            # Jika cuma 1, masukkan ke Train (biar sistem belajar)
            train_subset = items
            test_subset = []
            n_train = 1
        else:
            train_subset = items[:n_train]
            test_subset = items[n_train:]

        train_set.extend(train_subset)
        test_set.extend(test_subset)
        
        print(f"{label:<10} | {n_total:<5} | {len(train_subset):<5} | {len(test_subset):<5}")

    # 4. SIMPAN KE CSV
    # Tulis Train
    with open(OUTPUT_TRAIN, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(train_set)

    # Tulis Test
    with open(OUTPUT_TEST, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(test_set)

    print("-" * 40)
    print(f"Total Dataset : {len(all_data)}")
    print(f"Total Train   : {len(train_set)} -> Disimpan di '{OUTPUT_TRAIN}'")
    print(f"Total Test    : {len(test_set)}  -> Disimpan di '{OUTPUT_TEST}'")
    print("\n✅ SIAP UNTUK EVALUASI!")

if __name__ == "__main__":
    split_dataset()