#!/usr/bin/env node

/**
 * Example script to issue a numeric asset with BRC-20 inscription
 * This demonstrates the same functionality as the curl command in commands.md
 */

const { CounterpartyClient } = require('./cross-chain-inscribe');

async function issueNumericAsset() {
  // Create a Counterparty client
  const client = new CounterpartyClient('https://api.counterparty.io:4000');
  
  // Parameters for asset issuance
  const params = {
    source: 'bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35',
    asset: 'A173829102938475610',
    quantity: 10,
    description: JSON.stringify({
      p: 'brc-20',
      op: 'mint',
      tick: 'ordi',
      amt: '10'
    }),
    divisible: true
  };
  
  console.log('Issuing numeric asset with BRC-20 inscription...');
  console.log('Parameters:', JSON.stringify(params, null, 2));
  
  try {
    const result = await client.createIssuance(params);
    console.log('\nIssuance Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // In a real scenario, you would broadcast the transaction
    console.log('\nTo broadcast the transaction:');
    console.log(`await client.broadcastTx('${result.tx_hex}');`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

issueNumericAsset();