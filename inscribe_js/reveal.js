// reveal.js
const fs = require('fs');

const envelopeScriptHex = '0063036f726401070378637001010a746578742f706c61696e01050f86161b00000099c9ce3bbf01f4f4f400124f7264696e616c20646567656e2e6a7065676820b54e34963d3ff18393172a6f2e2d224c7a2e02a3eb3e8897214282ee90b482d4ac';
const fs = require('fs');
const bitcoin = require('bitcoinjs-lib');

const txHex = '02000000063036f726401070378637001010a746578742f706c61696e01050f86161b00000099c9ce3bbf01f4f4f400124f7264696e616c20646567656e2e6a7065676820b54e34963d3ff18393172a6f2e2d224c7a2e02a3eb3e8897214282ee90b482d4ac0000101e0315a2a7c5eaa95'; // signed_reveal_rawtransaction
const tx = bitcoin.Transaction.fromHex(txHex);

// Assuming only 1 input and 1 witness
const witness = tx.ins[0].witness;
const lastPush = witness[witness.length - 1]; // Buffer
fs.writeFileSync('preview.jpeg', lastPush);
console.log('✅ JPEG extracted to preview.jpeg');
