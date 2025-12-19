# Tremor Detection dengan Kamera

Sistem ini mendeteksi dan mengklasifikasikan tremor tangan secara real-time menggunakan kamera dan visi komputer tanpa sensor fisik.

## Cara Menjalankan Aplikasi

### Syarat/Requirement

- NodeJS V^20.17.0 / Bun V^1.2.21
- NPM V^10.8.6 (Jika menggunakan NodeJS

### Download repo

Unduh repo ini:

```bash
git clone https://github.com/CrzxaExe/tremor-detection-camera-vision.git
```

Atau unduh kode menjadi folder zip secara manual dan ekstrak folder tersebut pada direktori anda.<br/>

### Instalasi

Menggunakan NPM(NodeJS):

```bash
npm install
```

Menggunakan Bun:

```bash
bun install
```


### Menjalankan

Untuk menjalankan aplikasi gunakan perintah, npm:

```bash
npm run dev
```

Atau menggunakan bun

```bash
bun dev
```

Aplikasi akan berjalan pada localhost:5173, buka web browser dan isi dengan url:

```
http://localhost:5173
```

Kami sudah hosting demo aplikasi ini pada vercel, untuk membuka bisa klik tombol berikut: [Tremor Detection](https://tremor-detection-camera-vision.vercel.app/), atau bisa copas url berikut:

```
https://tremor-detection-camera-vision.vercel.app/
```

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
