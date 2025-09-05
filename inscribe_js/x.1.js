const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

async function inscribeImage() {
    try {
        console.log('Reading image file...');
        
        // Read and convert image to hex
        const imagePath = './degen.jpeg';
        const hexData = execSync(`xxd -p "${imagePath}" | tr -d '\n'`, { 
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 50 // Increased buffer for larger images
        }).trim();

        console.log(`Hex data length: ${hexData.length} characters`);
        console.log(`Image size: ${Math.round(hexData.length / 2)} bytes`);

        // Split into smaller chunks that fit in URL
        const maxChunkSize = 3000; // Reduced for safety with URL limits
        const totalChunks = Math.ceil(hexData.length / maxChunkSize);
        
        console.log(`Total chunks needed: ${totalChunks}`);

        // CHECK FOR EXISTING PROGRESS - RESUME FROM LAST SUCCESSFUL CHUNK
        let startChunk = 0;
        if (fs.existsSync('last_successful_chunk.txt')) {
            startChunk = parseInt(fs.readFileSync('last_successful_chunk.txt', 'utf8'));
            console.log(`🔄 Resuming from chunk ${startChunk + 1}/${totalChunks}`);
        } else {
            console.log(`Starting fresh - ${totalChunks} chunks total`);
        }

        // Your Bitcoin address with sufficient funds
        const sourceAddress = 'bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8';
        
        for (let i = startChunk; i < totalChunks; i++) {
            const start = i * maxChunkSize;
            const end = start + maxChunkSize;
            const chunk = hexData.slice(start, end);
            
            console.log(`\nProcessing chunk ${i + 1}/${totalChunks} (${chunk.length} chars)`);

            const params = new URLSearchParams({
                source: sourceAddress, // CRITICAL: Specify source address
                asset: 'MYIMAGE',
                quantity: '1',
                divisible: 'false',
                description: chunk,
                encoding: 'taproot',
                inscription: 'true',
                fee_rate: '25', // Increased fee rate for better confirmation
                chunk_index: i.toString(),
                total_chunks: totalChunks.toString(),
                allow_unconfirmed_inputs: 'true'
            });

            const url = `https://api.counterparty.io:4000/v2/addresses/${sourceAddress}/compose/issuance?${params}`;

            try {
                console.log('Requesting transaction composition...');
                const response = await axios.get(url, {
                    headers: { 
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000 // Increased timeout
                });

                if (!response.data.raw_transaction) {
                    throw new Error('No raw transaction in response');
                }

                console.log(`✅ Chunk ${i + 1} composed successfully`);
                
                // SAVE THE RAW TRANSACTION TO A FILE
                const txData = {
                    chunk: i + 1,
                    total_chunks: totalChunks,
                    raw_transaction: response.data.raw_transaction,
                    timestamp: new Date().toISOString()
                };
                
                fs.writeFileSync(`chunk_${i + 1}.json`, JSON.stringify(txData, null, 2));
                console.log(`💾 Saved transaction data to chunk_${i + 1}.json`);
                
                // BROADCAST THE TRANSACTION
                console.log('📡 Broadcasting transaction to blockchain...');
                try {
                    const broadcastResponse = await axios.post('https://blockstream.info/api/tx', txData.raw_transaction, {
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        timeout: 60000
                    });
                    
                    console.log(`🚀 Transaction broadcasted! TXID: ${broadcastResponse.data}`);
                    console.log(`🔗 View: https://mempool.space/tx/${broadcastResponse.data}`);
                    
                    // Verify the transaction is in mempool
                    setTimeout(async () => {
                        try {
                            const verifyResponse = await axios.get(`https://blockstream.info/api/tx/${broadcastResponse.data}/status`, {
                                timeout: 30000
                            });
                            console.log(`📊 Transaction status: ${JSON.stringify(verifyResponse.data)}`);
                        } catch (verifyError) {
                            console.log('Could not verify transaction status:', verifyError.message);
                        }
                    }, 10000);
                    
                } catch (broadcastError) {
                    console.log('❌ Broadcast failed, but transaction data saved');
                    console.log('Error details:', broadcastError.message);
                    if (broadcastError.response) {
                        console.log('Response data:', broadcastError.response.data);
                    }
                    console.log('You can broadcast manually later using:');
                    console.log(`curl -X POST https://blockstream.info/api/tx -d "$(cat chunk_${i + 1}.json | jq -r '.raw_transaction')"`);
                    
                    // Don't proceed to next chunk if broadcast failed
                    throw broadcastError;
                }
                
                // SAVE PROGRESS AFTER EACH SUCCESSFUL CHUNK
                fs.writeFileSync('last_successful_chunk.txt', i.toString());
                
            } catch (chunkError) {
                console.error(`❌ Error in chunk ${i + 1}:`, chunkError.message);
                if (chunkError.response) {
                    console.error('Response status:', chunkError.response.status);
                    console.error('Response data:', chunkError.response.data);
                }
                
                // Wait before retrying
                console.log('Waiting 30 seconds before possible retry...');
                await new Promise(resolve => setTimeout(resolve, 30000));
                
                throw chunkError;
            }
            
            // Add a delay between chunks to avoid rate limiting
            if (i < totalChunks - 1) {
                const delay = 10000 + Math.random() * 5000; // 10-15 seconds
                console.log(`Waiting ${Math.round(delay/1000)} seconds before next chunk...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        console.log('🎉 All chunks processed successfully!');
        
        // Clean up progress file when done
        if (fs.existsSync('last_successful_chunk.txt')) {
            fs.unlinkSync('last_successful_chunk.txt');
        }

    } catch (error) {
        console.error('❌ General Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.log('Script paused due to error. You can resume later.');
    }
}

// Run the function
inscribeImage();