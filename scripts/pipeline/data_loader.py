import pickle
import numpy as np
import os

def load_pkl_wrist_data(pkl_path):
    """
    Fungsi Pusat untuk membaca file PKL Mediapipe yang kompleks.
    Menangani berbagai format (Dict, List), Dimensi 3D, dan Transpose.
    
    Returns:
        numpy.ndarray: Shape (Frames, 3) berisi (x, y, z)
        None: Jika gagal
    """
    try:
        with open(pkl_path, 'rb') as f:
            raw_pkl = pickle.load(f)
        
        data_source = None
        
        # 1. CARI DATA (Prioritas: world > landmarks > data > raw)
        if isinstance(raw_pkl, dict):
            search_order = ['world', 'landmarks', 'data', 'raw']
            for key in search_order:
                if key in raw_pkl and isinstance(raw_pkl[key], (np.ndarray, list)):
                    data_source = raw_pkl[key]
                    break
            
            # Fallback: cari value array apapun yang besar
            if data_source is None:
                for val in raw_pkl.values():
                    if isinstance(val, np.ndarray) and val.size > 100:
                        data_source = val
                        break
        elif isinstance(raw_pkl, (list, np.ndarray)):
            data_source = raw_pkl

        if data_source is None: return None

        # 2. STANDARISASI SHAPE (Ubah ke Numpy)
        if isinstance(data_source, list): data_source = np.array(data_source)
        
        # Handle 3D (Features, Time, Hands) -> Contoh: (63, 3688, 2)
        # Kita ambil tangan pertama saja (index 0 di dimensi terakhir)
        if len(data_source.shape) == 3:
            if data_source.shape[0] in [63, 21]:
                data_source = data_source[:, :, 0] 
            elif data_source.shape[1] in [63, 21]:
                data_source = data_source[:, :, 0]

        # Handle Transpose (Features, Time) -> (Time, Features)
        # Kita ingin format (Time, Features)
        if len(data_source.shape) == 2:
            d0, d1 = data_source.shape
            # Jika barisnya 63 atau 21, dan kolomnya lebih banyak, berarti itu (Channel, Time)
            if (d0 in [63, 21]) and d1 > d0:
                data_source = data_source.T

        # 3. AMBIL XYZ WRIST (Kolom 0, 1, 2)
        if data_source.shape[1] >= 3:
            return data_source[:, :3] 
            
    except Exception as e:
        print(f"Loader Error ({os.path.basename(pkl_path)}): {e}")
        return None
    return None