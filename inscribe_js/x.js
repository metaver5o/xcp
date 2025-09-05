// filename: inscribe.js
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { execSync } = require('child_process');

const ADDRESS = 'bc1p865lxyp372lg0nhkze7kkd6u38vpaglrv5cdfjs3r83nk7jaqalqxzxhq8';

async function inscribeOrdinal(filePath, assetName) {
  try {
    if (!fs.existsSync(filePath)) throw new Error('File not found');

    console.log(`📂 Reading file: ${filePath}`);
    const absPath = path.resolve(filePath);

    // convert file -> hex string
    const hexData = execSync(`xxd -p "${absPath}" | tr -d '\\n'`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 500
    }).trim();
    console.log('Hex length:', hexData.length);

    const params = new URLSearchParams({
      asset: assetName,
      quantity: '1',
      divisible: 'false',
      encoding: 'taproot',
      inscription: 'true',
      fee_rate: '2'
    });

    const url = `https://api.counterparty.io:4000/v2/addresses/${ADDRESS}/compose/issuance?${params}`;

    // JPEG hex goes into description
    const body = {
      description: hexData,
      mime_type: 'image/jpeg'
    };

    const { data } = await axios.post(url, body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 180000
    });

    console.log('✅ Inscription submitted');
    console.log(JSON.stringify(data, null, 2));

    const reveal = data?.result?.signed_reveal_rawtransaction || '';
    if (reveal.length < 10000) {
      console.warn('⚠️ Reveal tx looks small. Check mime_type/description and size limits.');
    } else {
      console.log('🧩 Reveal size looks plausible for embedded JPEG.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
}

// CLI entrypoint
if (require.main === module) {
  const filePath = process.argv[2];
  const assetName = process.argv[3] || `IMG${Math.floor(Math.random() * 1e6)}`;
  if (!filePath) {
    console.error('Usage: node inscribe.js <file.jpeg> [asset_name]');
    process.exit(1);
  }
  inscribeOrdinal(filePath, assetName);
}
