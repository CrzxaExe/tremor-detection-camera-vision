# Tremor Detection dengan Kamera

Sistem ini mendeteksi dan mengklasifikasikan tremor tangan secara real-time menggunakan kamera dan visi komputer tanpa sensor fisik.

# cara menjalankan kode

npm install - Instalasi package yang dibutuhkan
npm run dev - menjalankan website secara lokal
atau
https://tremor-detection-camera-vision.vercel.app/

## Alur Sistem
Kamera → MediaPipe Hands (21 landmark tangan) → Penyimpanan lintasan landmark  
→ Ekstraksi fitur (Amplitudo, Frekuensi, Stabilitas)  
→ Inferensi Fuzzy → Klasifikasi Tremor

## Landmark Tangan
MediaPipe Hands digunakan untuk mendeteksi 21 titik landmark tangan pada setiap frame.  
Posisi landmark (x, y, z) disimpan sebagai history untuk membentuk lintasan gerakan tangan yang dianalisis secara temporal.

## Ekstraksi Fitur Tremor
- **Amplitudo** — Menggambarkan kuat atau lemahnya getaran tangan.  
- **Frekuensi** — Menggambarkan seberapa cepat getaran terjadi per detik.  
- **Stabilitas** — Mengukur seberapa konstan gerakan tangan dalam interval tertentu.  

Ketiga fitur ini dihitung dari lintasan landmark yang sama dan saling melengkapi.

## Parameter Sistem
| Parameter | Deskripsi |
|------------|------------|
| **Window** | Kecepatan frame kamera (FPS) |
| **Sample Rate** | Jumlah frame yang digunakan untuk analisis |
| **Tolerance** | Ambang batas deviasi untuk stabilitas |
| **Max History** | Batas maksimum frame yang disimpan |

## Klasifikasi Tremor (Fuzzy Logic)
Nilai **amplitudo**, **frekuensi**, dan **stabilitas** diproses menggunakan **Fuzzy Logic** untuk menangani ketidakpastian gerakan tangan.

### Tahapan:
1. **Fuzzification**  
   - Low / Medium / High (Amplitude & Frequency)  
   - Stable / Unstable (Stability)
2. **Inferensi**  
   - Aturan berbasis kombinasi ketiga fitur (IF–THEN)
3. **Defuzzification**  
   - Weighted average menghasilkan nilai tremor (0–1)

## Output
| Parameter | Deskripsi |
|------------|------------|
| **Value** | Nilai tingkat tremor (0–1) |
| **Label** | Normal \| Mild \| Severe |
| **Confidence** | Tingkat keyakinan tiap kelas |

## Dataset
[TremorComputerVision](https://github.com/JuliusWelzel/TremorComputerVision)

## Batasan Sistem
- Sensitif terhadap noise kamera dan pencahayaan  
- Bergantung pada kualitas deteksi MediaPipe  
- Tidak dimaksudkan untuk menggantikan diagnosis medis
