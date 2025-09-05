const fs = require('fs');
const path = require('path');

const inputDir = 'inscription_outputs';
const outputDir = 'inscription_outputs';

// Read all chunk JSON files
const files = fs.readdirSync(inputDir).filter(file => file.startsWith('chunk_') && file.endsWith('.json'));

console.log(`Found ${files.length} chunk files`);

files.forEach(file => {
    try {
        const filePath = path.join(inputDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Extract raw transaction from the nested structure
        let rawTransaction = null;
        
        if (data.response && data.response.result) {
            // Try signed_reveal_rawtransaction first (this is likely the one you need)
            if (data.response.result.signed_reveal_rawtransaction) {
                rawTransaction = data.response.result.signed_reveal_rawtransaction;
                console.log(`✅ Using signed_reveal_rawtransaction for chunk ${data.chunk}`);
            } 
            // Fall back to rawtransaction if available
            else if (data.response.result.rawtransaction) {
                rawTransaction = data.response.result.rawtransaction;
                console.log(`✅ Using rawtransaction for chunk ${data.chunk}`);
            }
        }
        
        if (rawTransaction) {
            const chunkNumber = data.chunk;
            const outputFile = path.join(outputDir, `raw_tx_chunk_${chunkNumber}.txt`);
            
            fs.writeFileSync(outputFile, rawTransaction);
            console.log(`💾 Extracted raw transaction for chunk ${chunkNumber}`);
        } else {
            console.log(`❌ No raw transaction found in ${file}`);
            console.log(`   Available keys in response.result: ${data.response && data.response.result ? Object.keys(data.response.result) : 'N/A'}`);
        }
    } catch (error) {
        console.log(`❌ Error processing ${file}:`, error.message);
    }
});

console.log('Extraction complete!');