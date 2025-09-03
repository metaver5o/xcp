#!/usr/bin/env node

/**
 * Cross-Chain Ordinals Inscription Script
 * 
 * This script allows for inscribing ordinals on both Counterparty and Bitcoin chains
 * using the Taproot Envelope encoding method.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const program = new Command();

// Configuration
const DEFAULT_CONFIG = {
  counterparty: {
    apiUrl: 'https://api.counterparty.io:4000',
    sourceAddress: 'bc1qd0nzd63c8qxzgq8649qwd5w8dfcrl8w8fk9x35',
  },
  bitcoin: {
    rpcUrl: 'http://localhost:8332',
    rpcUser: 'bitcoin',
    rpcPass: 'bitcoin',
    network: 'testnet'
  },
  general: {
    waitConfirmations: 1,
    outputDir: './inscriptions'
  }
};

// Command line options
program
  .name('cross-chain-inscribe')
  .description('Inscribe ordinals on both Counterparty and Bitcoin chains')
  .version('1.0.0')
  .option('-c, --config <path>', 'Path to config file')
  .option('--chain <chain>', 'Target blockchain (counterparty or bitcoin)', 'counterparty')
  .option('--asset-name <name>', 'Asset name for Counterparty issuance')
  .option('--quantity <amount>', 'Quantity to issue', '1')
  .option('--description <json>', 'Description or inscription content')
  .option('--divisible', 'Whether the asset is divisible', false)
  .option('--encoding <type>', 'Encoding type (default or taproot)', 'taproot')
  .option('--inscription', 'Whether to make it Ordinals compatible', true)
  .option('--mime-type <type>', 'MIME type for the inscription (auto-detected if file provided)', 'text/plain')
  .option('--file <path>', 'Path to file for inscription content')
  .option('--recipient <address>', 'Recipient address for Bitcoin inscription')
  .option('--inscription-type <type>', 'Inscription type (text, image, audio, video, pdf, json, html, svg, other)', 'text')
  .option('--check-balance', 'Check balance instead of creating issuance')
  .option('--wait-confirm', 'Wait for transaction confirmation', false)
  .option('--output-dir <path>', 'Directory to save transaction files')
  .option('--verbose', 'Enable verbose output', false)
  .parse(process.argv);

const options = program.opts();

// Load configuration
let config = { ...DEFAULT_CONFIG };
if (options.config) {
  try {
    const userConfig = JSON.parse(fs.readFileSync(options.config, 'utf8'));
    config = {
      counterparty: { ...config.counterparty, ...userConfig.counterparty },
      bitcoin: { ...config.bitcoin, ...userConfig.bitcoin },
      general: { ...config.general, ...userConfig.general }
    };
  } catch (error) {
    console.error(`Error loading config file: ${error.message}`);
    process.exit(1);
  }
}

// Override config with command line options
if (options.outputDir) {
  config.general.outputDir = options.outputDir;
}

// Ensure output directory exists
if (!fs.existsSync(config.general.outputDir)) {
  fs.mkdirSync(config.general.outputDir, { recursive: true });
}

// Helper functions
function saveToFile(filename, data) {
  const filePath = path.join(config.general.outputDir, filename);
  fs.writeFileSync(filePath, data);
  console.log(`Saved to ${filePath}`);
  return filePath;
}

// API client for Counterparty
class CounterpartyClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.id = 0;
  }

  async call(method, params = {}) {
    try {
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        id: this.id++,
        method: method,
        params: params
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || JSON.stringify(response.data.error));
      }

      return response.data;
    } catch (error) {
      throw new Error(`Counterparty API error: ${error.message}`);
    }
  }

  async createIssuance(params) {
    try {
      const result = await this.call('create_issuance', params);
      return result.result;
    } catch (error) {
      console.error('Error creating issuance:', error.message);
      throw error;
    }
  }

  async broadcastTx(txHex) {
    try {
      const result = await this.call('broadcast_tx', { tx_hex: txHex });
      return result.result;
    } catch (error) {
      console.error('Error broadcasting transaction:', error.message);
      throw error;
    }
  }

  async broadcastRevealTx(txHex) {
    try {
      const result = await this.call('broadcast_reveal_tx', { tx_hex: txHex });
      return result.result;
    } catch (error) {
      console.error('Error broadcasting reveal transaction:', error.message);
      throw error;
    }
  }
  
  async getBalances(address, asset = null) {
    try {
      const filters = [
        { field: 'address', op: '==', value: address }
      ];
      
      if (asset) {
        filters.push({ field: 'asset', op: '==', value: asset });
      }
      
      const result = await this.call('get_balances', { filters });
      return result.result;
    } catch (error) {
      console.error('Error getting balances:', error.message);
      throw error;
    }
  }
}

// Bitcoin RPC client
class BitcoinClient {
  constructor(rpcUrl, rpcUser, rpcPass, network = 'testnet') {
    this.rpcUrl = rpcUrl;
    this.auth = Buffer.from(`${rpcUser}:${rpcPass}`).toString('base64');
    this.network = network;
  }

  async rpcCall(method, params = []) {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '1.0',
        id: 'btc-rpc',
        method,
        params
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.auth}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || JSON.stringify(response.data.error));
      }

      return response.data.result;
    } catch (error) {
      console.error(`Error calling ${method}:`, error.message);
      throw error;
    }
  }
}

// Main function for Counterparty inscriptions
async function inscribeOnCounterparty() {
  console.log('=== Inscribing on Counterparty Chain ===');
  
  const client = new CounterpartyClient(config.counterparty.apiUrl);
  
  try {
    // Handle balance check
    if (options.checkBalance) {
      if (!config.counterparty.sourceAddress) {
        throw new Error('Source address required for balance check');
      }

      const balances = await client.getBalances(config.counterparty.sourceAddress, options.assetName);
      
      if (options.verbose) {
        console.log('Balance check result:', JSON.stringify(balances, null, 2));
      } else {
        const assetBalance = options.assetName 
          ? balances.find(b => b.asset === options.assetName)
          : balances;
        
        console.log('Balance:', assetBalance ? `${assetBalance.quantity} ${assetBalance.asset}` : '0');
      }
      
      return;
    }

    // Validate required parameters for issuance
    if (!options.assetName) {
      throw new Error('Asset name is required for Counterparty issuance');
    }

    if (!options.quantity) {
      throw new Error('Quantity is required for Counterparty issuance');
    }

    // Get description from file if provided
    let description = options.description;
    let mimeType = options.mimeType || 'text/plain';
    let fileContent = null;
    
    if (options.file) {
      try {
        const filePath = path.resolve(options.file);
        const fileExtension = path.extname(filePath).toLowerCase();
        
        // Determine if this is a binary file
        const isBinary = [
          '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', 
          '.mp3', '.mp4', '.webm', '.pdf'
        ].includes(fileExtension);
        
        if (isBinary) {
          // For binary files, read as base64
          fileContent = fs.readFileSync(filePath);
          description = fileContent.toString('base64');
          
          // Auto-detect MIME type if not specified
          if (!options.mimeType) {
            switch (fileExtension) {
              case '.png': mimeType = 'image/png'; break;
              case '.jpg': case '.jpeg': mimeType = 'image/jpeg'; break;
              case '.gif': mimeType = 'image/gif'; break;
              case '.webp': mimeType = 'image/webp'; break;
              case '.svg': mimeType = 'image/svg+xml'; break;
              case '.mp3': mimeType = 'audio/mpeg'; break;
              case '.mp4': mimeType = 'video/mp4'; break;
              case '.webm': mimeType = 'video/webm'; break;
              case '.pdf': mimeType = 'application/pdf'; break;
              default: mimeType = 'application/octet-stream';
            }
          }
        } else {
          // For text files, read as UTF-8
          description = fs.readFileSync(filePath, 'utf8');
          
          // Auto-detect MIME type for text files if not specified
          if (!options.mimeType) {
            switch (fileExtension) {
              case '.json': mimeType = 'application/json'; break;
              case '.html': case '.htm': mimeType = 'text/html'; break;
              case '.css': mimeType = 'text/css'; break;
              case '.js': mimeType = 'text/javascript'; break;
              case '.md': mimeType = 'text/markdown'; break;
              case '.txt': default: mimeType = 'text/plain';
            }
          }
        }
        
        console.log(`File loaded: ${filePath}`);
        console.log(`MIME type: ${mimeType}`);
      } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        process.exit(1);
      }
    }
    
    if (!description) {
      throw new Error('Description or file content is required for issuance');
    }

    // Create ordinal inscription description (not BRC-20)
    const inscriptionData = {
      p: 'insc', // Protocol identifier for inscriptions (not brc-20)
      op: 'deploy', // Operation type
      name: options.assetName,
      mime: mimeType,
      content: description
    };

    // Create issuance
    console.log('Creating asset issuance transaction...');
    
    // Prepare issuance parameters
    const issuanceParams = {
      source: config.counterparty.sourceAddress,
      asset: options.assetName,
      quantity: parseInt(options.quantity),
      description: JSON.stringify(inscriptionData),
      divisible: options.divisible,
      encoding: options.encoding,
      inscription: options.inscription // This enables the inscription flag
    };
    
    console.log('Issuance parameters:');
    console.log(JSON.stringify(issuanceParams, null, 2));
    
    const issuanceResult = await client.createIssuance(issuanceParams);
    
    // Save transaction hex
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const assetPrefix = options.assetName.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (typeof issuanceResult === 'string') {
      // Standard encoding
      const txHex = issuanceResult;
      const txFilename = `${assetPrefix}_issuance_tx_${timestamp}.txt`;
      saveToFile(txFilename, txHex);
      console.log(`Transaction hex saved to ${txFilename}`);
      
      // Broadcast transaction
      console.log('\nBroadcasting transaction...');
      const txid = await client.broadcastTx(txHex);
      console.log(`Transaction broadcast with TXID: ${txid}`);
      
      // Save transaction ID
      const txidFilename = `${assetPrefix}_txid_${timestamp}.json`;
      const txidData = {
        asset: options.assetName,
        txid: txid,
        timestamp: new Date().toISOString(),
        encoding: options.encoding,
        inscription: options.inscription,
        mime_type: mimeType
      };
      
      saveToFile(txidFilename, JSON.stringify(txidData, null, 2));
      
      console.log('\n=== Asset Creation Complete ===');
      console.log(`Asset: ${options.assetName}`);
      console.log(`Encoding: Standard`);
      console.log(`Inscription: ${options.inscription ? 'Yes' : 'No'}`);
      console.log(`MIME Type: ${mimeType}`);
      console.log(`TXID: ${txid}`);
      
      return {
        asset: options.assetName,
        txid,
        mimeType,
        encoding: options.encoding,
        inscription: options.inscription
      };
    } else {
      // Taproot encoding (not implemented in this example)
      console.error('Taproot encoding not implemented in this example');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error inscribing on Counterparty: ${error.message}`);
    process.exit(1);
  }
}

// Main function for Bitcoin inscriptions
async function inscribeOnBitcoin() {
  console.log('=== Inscribing on Bitcoin Chain ===');
  console.log('Bitcoin inscriptions require additional setup and are not implemented in this example.');
  console.log('For Bitcoin inscriptions, consider using dedicated tools like ord or others.');
  process.exit(1);
}

// Helper function to read file content
async function readFileContent(filePath) {
  try {
    const resolvedPath = path.resolve(filePath);
    const fileExtension = path.extname(resolvedPath).toLowerCase();
    
    // Determine if this is a binary file
    const isBinary = [
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', 
      '.mp3', '.mp4', '.webm', '.pdf', '.avif', '.ico',
      '.zip', '.tar', '.gz', '.bmp', '.tiff', '.webp'
    ].includes(fileExtension);
    
    let content;
    let mimeType;
    
    if (isBinary) {
      // For binary files, read as base64
      const fileContent = fs.readFileSync(resolvedPath);
      content = fileContent.toString('base64');
      
      // Auto-detect MIME type
      switch (fileExtension) {
        case '.png': mimeType = 'image/png'; break;
        case '.jpg': case '.jpeg': mimeType = 'image/jpeg'; break;
        case '.gif': mimeType = 'image/gif'; break;
        case '.webp': mimeType = 'image/webp'; break;
        case '.svg': mimeType = 'image/svg+xml'; break;
        case '.mp3': mimeType = 'audio/mpeg'; break;
        case '.mp4': mimeType = 'video/mp4'; break;
        case '.webm': mimeType = 'video/webm'; break;
        case '.pdf': mimeType = 'application/pdf'; break;
        case '.avif': mimeType = 'image/avif'; break;
        case '.ico': mimeType = 'image/x-icon'; break;
        case '.zip': mimeType = 'application/zip'; break;
        case '.tar': mimeType = 'application/x-tar'; break;
        case '.gz': mimeType = 'application/gzip'; break;
        case '.bmp': mimeType = 'image/bmp'; break;
        case '.tiff': mimeType = 'image/tiff'; break;
        default: mimeType = 'application/octet-stream';
      }
    } else {
      // For text files, read as UTF-8
      content = fs.readFileSync(resolvedPath, 'utf8');
      
      // Auto-detect MIME type for text files
      switch (fileExtension) {
        case '.json': mimeType = 'application/json'; break;
        case '.html': case '.htm': mimeType = 'text/html'; break;
        case '.css': mimeType = 'text/css'; break;
        case '.js': mimeType = 'text/javascript'; break;
        case '.md': mimeType = 'text/markdown'; break;
        case '.xml': mimeType = 'application/xml'; break;
        case '.csv': mimeType = 'text/csv'; break;
        case '.yaml': case '.yml': mimeType = 'application/yaml'; break;
        case '.txt': default: mimeType = 'text/plain';
      }
    }
    
    return { content, mimeType, isBinary };
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    throw error;
  }
}

// Export classes for use in other scripts
module.exports = {
  CounterpartyClient,
  BitcoinClient
};

// Main execution
async function main() {
  try {
    // Enable verbose logging if requested
    const verbose = options.verbose;
    
    if (verbose) {
      console.log('Running in verbose mode');
      console.log('Command options:', options);
    }
    
    // Determine which chain to use
    if (options.chain === 'counterparty') {
      await inscribeOnCounterparty();
    } else if (options.chain === 'bitcoin') {
      await inscribeOnBitcoin();
    } else {
      console.error(`Error: Unsupported chain '${options.chain}'. Use 'counterparty' or 'bitcoin'.`);
      process.exit(1);
    }
    
    console.log('\nProcess completed successfully!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});