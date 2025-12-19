import numpy as np
import matplotlib.pyplot as plt

def generate_reference():
    # Setup waktu (10 detik, 30 FPS)
    t = np.linspace(0, 10, 300)
    
    # --- 1. POLA NORMAL (Tangan Diam/Gerak Wajar) ---
    # Gerakan lambat (sengaja) + Noise sangat kecil
    normal_movement = 0.005 * np.sin(2 * np.pi * 0.2 * t) # Gerakan napas/badan
    normal_noise = np.random.normal(0, 0.001, len(t))     # Noise sensor minim
    y_normal = normal_movement + normal_noise

    # --- 2. POLA MILD (Tremor Ringan) ---
    # Amplitude sedang + Frekuensi Cepat (Jitter)
    mild_tremor = 0.02 * np.sin(2 * np.pi * 5 * t)       # Getaran 5Hz
    mild_noise = np.random.normal(0, 0.002, len(t))
    y_mild = mild_tremor + mild_noise

    # --- 3. POLA SEVERE (Tremor Berat) ---
    # Amplitude Besar + Frekuensi Cepat + Kacau
    severe_tremor = 0.06 * np.sin(2 * np.pi * 6 * t)     # Getaran 6Hz (Kuat)
    severe_random = 0.02 * np.sin(2 * np.pi * 3 * t)     # Ketidakteraturan
    severe_noise = np.random.normal(0, 0.005, len(t))
    y_severe = severe_tremor + severe_random + severe_noise

    # --- PLOTTING ---
    fig, axes = plt.subplots(3, 1, figsize=(12, 10), sharex=True)
    
    # Plot Normal
    axes[0].plot(t, y_normal, color='green')
    axes[0].set_title("1. NORMAL (Aman)\nCiri: Garis datar atau gelombang laut yang landai. Simpangan < 0.015m", fontsize=12, fontweight='bold')
    axes[0].set_ylabel("Simpangan (m)")
    axes[0].set_ylim(-0.1, 0.1) # Skala disamakan biar kelihatan bedanya
    axes[0].grid(True, alpha=0.3)

    # Plot Mild
    axes[1].plot(t, y_mild, color='#F59E0B') # Orange
    axes[1].set_title("2. MILD (Ringan)\nCiri: Seperti gergaji halus atau rumput. Simpangan 0.015m - 0.05m", fontsize=12, fontweight='bold')
    axes[1].set_ylabel("Simpangan (m)")
    axes[1].set_ylim(-0.1, 0.1)
    axes[1].grid(True, alpha=0.3)

    # Plot Severe
    axes[2].plot(t, y_severe, color='red')
    axes[2].set_title("3. SEVERE (Berat)\nCiri: Gelombang tinggi, tajam, dan rapat. Simpangan > 0.05m", fontsize=12, fontweight='bold')
    axes[2].set_ylabel("Simpangan (m)")
    axes[2].set_xlabel("Waktu (detik)")
    axes[2].set_ylim(-0.1, 0.1)
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("PANDUAN_BACA_GRAFIK.png")
    print("Gambar panduan berhasil dibuat: 'PANDUAN_BACA_GRAFIK.png'")

if __name__ == "__main__":
    generate_reference()