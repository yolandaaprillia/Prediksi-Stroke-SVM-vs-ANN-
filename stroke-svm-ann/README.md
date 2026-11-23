# Prediksi Stroke dengan SVM & ANN

Case study machine learning pada data stroke yang sangat tidak seimbang (4,9% kasus positif): membandingkan **SVM** dan **ANN (MLP)** dan menunjukkan mengapa *accuracy* saja tidak cukup.

**Demo website:** `https://USERNAME.github.io/stroke-svm-ann/`

## Hasil utama (data uji, 1.022 pasien, 50 kasus stroke)
| Model | Accuracy | Recall | Precision | F2 | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|---|
| SVM baseline | 0,951 | 0,00 | 0,00 | 0,00 | 0,696 | 0,122 |
| **SVM tuned + threshold** | 0,777 | **0,78** | 0,152 | **0,428** | **0,838** | **0,273** |
| ANN baseline | 0,951 | 0,00 | 0,00 | 0,00 | 0,350 | 0,037 |
| ANN tuned + threshold | 0,677 | 0,70 | 0,100 | 0,318 | 0,786 | 0,157 |

SVM lebih baik dan lebih stabil (gap AUC train-test 0,011 vs 0,108). Usia adalah faktor dominan.

## Alur analisis
EDA + uji statistik → cleaning → preprocessing dalam Pipeline (tanpa data leakage) → baseline → GridSearchCV 5-fold → optimasi threshold (F2, out-of-fold) → evaluasi (metrik lengkap, bootstrap CI, McNemar) → permutation importance.

## Struktur repo
```
notebook/   stroke_svm_ann.ipynb (sudah berisi output)
data/       dataset CSV
figures/    grafik hasil analisis (PNG)
results/    tabel evaluasi, best params, CI, data untuk website
models/     model terlatih (.joblib)
docs/       website (index.html, style.css, script.js, data.js), dipublikasikan via GitHub Pages
```

## Menjalankan ulang
```bash
pip install -r requirements.txt
jupyter notebook notebook/stroke_svm_ann.ipynb   # jalankan dari folder yang berisi file CSV, atau di Google Colab (akan meminta upload CSV)
```

## Dataset
Stroke Prediction Dataset (Kaggle, fedesoriano). Periksa lisensi/ketentuan penggunaan di halaman sumber dan cantumkan atribusi sebelum mempublikasikan ulang file CSV.

## Disclaimer
Proyek pembelajaran/portofolio, **bukan** alat diagnosis medis.
