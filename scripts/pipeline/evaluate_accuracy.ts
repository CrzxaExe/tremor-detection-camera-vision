import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PERUBAHAN PATH IMPORT (CRITICAL) ---
import { inferTremor } from '../../src/utils/fuzzy.ts'; 

// --- KONFIGURASI PATH DATA ---
const JSON_FOLDER = path.join(__dirname, '../../data/mp_world_json_clean'); 

// Ambil argumen terminal
const args = process.argv.slice(2);
// Default file CSV juga ada di root
const LABELS_CSV = args[0] ? path.resolve(args[0]) : path.join(__dirname, '../../dataset_train.csv');

interface EvaluationRow {
    filename: string;
    actual: string; 
    predicted: string; 
    isCorrect: boolean;
    avgCrisp: number;
}

async function runEvaluation() {
    console.log("--- EVALUASI AKURASI MODEL FUZZY ---");
    console.log(`📂 Dataset : ${path.basename(LABELS_CSV)}`);
    console.log(`📂 JSON Dir: ${JSON_FOLDER}`);
    
    if (!fs.existsSync(LABELS_CSV)) {
        console.error(`❌ Error: File CSV tidak ditemukan di: ${LABELS_CSV}`);
        console.error(`   (Pastikan path relatifnya benar: ../../labels_final.csv)`);
        return;
    }

    // 1. BACA LABEL CSV
    const groundTruth = new Map<string, string>();
    
    await new Promise((resolve) => {
        fs.createReadStream(LABELS_CSV)
            .pipe(csvParser())
            .on('data', (row: any) => {
                if (row.filename && row.label && row.label !== '???') {
                    groundTruth.set(row.filename, row.label.trim());
                }
            })
            .on('end', resolve);
    });

    console.log(`✅ Memuat ${groundTruth.size} label valid.\n`);

    const results: EvaluationRow[] = [];
    const confusionMatrix = {
        Normal: { Normal: 0, Mild: 0, Severe: 0 },
        Mild: { Normal: 0, Mild: 0, Severe: 0 },
        Severe: { Normal: 0, Mild: 0, Severe: 0 }
    };

    // 2. LOOP FILE JSON
    if (!fs.existsSync(JSON_FOLDER)) {
        console.error(`❌ Error: Folder JSON tidak ditemukan di: ${JSON_FOLDER}`);
        return;
    }

    const files = fs.readdirSync(JSON_FOLDER).filter(f => f.endsWith('.json'));

    for (const file of files) {
        if (!groundTruth.has(file)) continue;

        const actualLabel = groundTruth.get(file) as "Normal" | "Mild" | "Severe";
        const filePath = path.join(JSON_FOLDER, file);
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (rawData.length < 60) continue;

        // --- SIMULASI REAL-TIME ---
        let sumCrisp = 0;
        let count = 0;
        const windowSize = 60;
        
        for (let i = windowSize; i < rawData.length; i += 10) {
            const window = rawData.slice(i - windowSize, i);
            
            // A. Amplitude
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (const p of window) {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            }
            const amp = Math.sqrt((maxX - minX)**2 + (maxY - minY)**2);

            // B. Frequency
            const meanY = window.reduce((s:number, p:any) => s + p.y, 0) / window.length;
            let crossings = 0;
            for (let j = 1; j < window.length; j++) {
                const prev = window[j-1].y - meanY;
                const curr = window[j].y - meanY;
                if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) crossings++;
            }
            const freq = crossings / (2 * (windowSize/30)); 

            // C. Stability
            const mx = window.reduce((s:number, p:any) => s + p.x, 0) / window.length;
            const my = window.reduce((s:number, p:any) => s + p.y, 0) / window.length;
            const dists = window.map((p:any) => Math.hypot(p.x - mx, p.y - my));
            const meanDist = dists.reduce((s:number,v:number)=>s+v,0)/dists.length;
            const variance = dists.reduce((s:number,v:number)=>s+(v-meanDist)**2,0)/dists.length;
            const stddev = Math.sqrt(variance);
            
            // Toleransi
            let stab = 1 - (stddev / 0.05); 
            if (stab < 0) stab = 0; if (stab > 1) stab = 1;

            // if (file === '008.json' || file === '020.json') {
            //     console.log(`DEBUG [${file}] Window ke-${count}: Amp=${amp.toFixed(4)}, Freq=${freq.toFixed(2)}, Stab=${stab.toFixed(2)}`);
            // }
            
            // D. Inferensi
            const res = inferTremor(amp, freq, stab);
            sumCrisp += res.value;
            count++;
        }

        const avgCrisp = count > 0 ? sumCrisp / count : 0;
        
        let predictedLabel = "Normal";
        if (avgCrisp >= 0.28) predictedLabel = "Mild";
        if (avgCrisp >= 0.60) predictedLabel = "Severe";

        const isCorrect = predictedLabel === actualLabel;
        results.push({ filename: file, actual: actualLabel, predicted: predictedLabel, isCorrect, avgCrisp });

        // @ts-ignore
        if (confusionMatrix[actualLabel]) confusionMatrix[actualLabel][predictedLabel]++;
    }

    // 3. CETAK LAPORAN
    console.log("FILENAME             | ACTUAL | PREDICT | CRISP | STATUS");
    console.log("-".repeat(65));
    results.forEach(r => {
        const mark = r.isCorrect ? "✅" : "❌";
        console.log(`${r.filename.padEnd(20)} | ${r.actual.padEnd(6)} | ${r.predicted.padEnd(7)} | ${r.avgCrisp.toFixed(2)}  | ${mark}`);
    });

    console.log("\n--- CONFUSION MATRIX ---");
    console.table(confusionMatrix);

    const correctCount = results.filter(r => r.isCorrect).length;
    const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;
    
    console.log(`\nTOTAL FILES : ${results.length}`);
    console.log(`AKURASI     : ${accuracy.toFixed(2)}%`);
}

runEvaluation();