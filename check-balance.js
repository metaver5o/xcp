#!/usr/bin/env node

/**
 * Example script to check PEPECASH balance using CounterpartyClient
 * This demonstrates the same functionality as the curl command in commands.md
 */

// Import the CounterpartyClient class from our script
// Note: In a real implementation, you would need to export this class
const { CounterpartyClient } = require('./cross-chain-inscribe');

async function checkBalance() {
  // Create a Counterparty client
  const client = new CounterpartyClient('https://api.counterparty.io:4000');
  
  // Check PEPECASH balance for the address
  const address = 'bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35';
  const asset = 'PEPECASH';
  
  console.log(`Checking ${asset} balance for ${address}...`);
  
  try {
    const balances = await client.getBalances(address, asset);
    console.log('\nPEPECASH Balance:');
    console.log(JSON.stringify(balances, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBalance();