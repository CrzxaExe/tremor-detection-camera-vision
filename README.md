# Tremor Detection dengan Kamera

## Latar Belakang
Tremor tangan merupakan salah satu indikasi gangguan motorik yang umumnya dianalisis menggunakan sensor fisik. Proyek ini bertujuan menghadirkan pendekatan alternatif berbasis visi komputer menggunakan kamera, sehingga bersifat non-intrusif dan mudah diimplementasikan.

## Tujuan
Mengembangkan sistem pendeteksian tremor tangan secara real-time menggunakan kamera dengan mengekstraksi fitur amplitudo, frekuensi, dan stabilitas dari pergerakan landmark tangan.

## Dataset
Dataset yang digunakan berasal dari:
[TremorComputerVision](https://github.com/JuliusWelzel/TremorComputerVision)

## Arsitektur Sistem
Kamera → MediaPipe Hands → Landmark Tangan (21 titik) → Penyimpanan History  
→ Ekstraksi Fitur (Amplitudo, Frekuensi, Stabilitas) → Output Nilai Tremor

## Landmark Tangan
MediaPipe Hands mendeteksi 21 titik landmark tangan pada setiap frame kamera. Posisi landmark (x, y) disimpan secara temporal untuk membentuk lintasan gerakan yang dianalisis lebih lanjut.

## Ekstraksi Fitur

### Amplitudo
Mengukur jarak perpindahan terjauh landmark tangan dalam window tertentu sebagai representasi kuat-lemahnya getaran.

### Frekuensi
Menghitung jumlah osilasi gerakan landmark berdasarkan perubahan arah lintasan terhadap posisi rata-rata (zero-crossing) untuk memperoleh frekuensi tremor (Hz).

### Stabilitas
Mengukur konsistensi posisi landmark terhadap titik pusat (centroid). Nilai stabilitas mendekati 1 menunjukkan gerakan yang stabil.

## Parameter Sistem
- **Window**: Jumlah frame yang digunakan untuk analisis
- **Sample Rate**: Kecepatan frame kamera (FPS)
- **Tolerance**: Ambang batas deviasi untuk stabilitas
- **Max History**: Batas maksimum frame yang disimpan

## Output
- **Amplitudo**: Intensitas tremor
- **Frekuensi**: Kecepatan tremor (Hz)
- **Stabilitas**: Tingkat kestabilan gerakan (0–1)

## Batasan Sistem
- Sensitif terhadap noise kamera dan pencahayaan
- Bergantung pada kualitas deteksi MediaPipe
- Tidak menggantikan diagnosis medis

## Teknologi
- MediaPipe Hands
- Vue + TypeScript
- Kamera RGB

## Referensi
- MediaPipe Hands
- TremorComputerVision Dataset
