const express = require('express');
const auth = require('basic-auth');
const cors = require('cors');
const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair');
const tinysecp = require('tiny-secp256k1');
require('dotenv').config();

// Configuração
const PORT = process.env.API_PORT || 4000;
const API_USER = process.env.API_USER || 'local';
const API_PASSWORD = process.env.API_PASSWORD || 'localpass';
const NETWORK = bitcoin.networks[process.env.NETWORK || 'regtest'];

// Inicializar ECPair com tinysecp (versão 2.x)
const ECPairFactory = ECPair.ECPairFactory(tinysecp);

const app = express();
app.use(cors());
app.use(express.json());

// Autenticação
const authenticate = (req, res, next) => {
  const credentials = auth(req);
  if (!credentials || credentials.name !== API_USER || credentials.pass !== API_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Counterparty Local API"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Banco de dados em memória (simulando blockchain)
const blockchain = {
  balances: {},
  assets: {},
  transactions: [],
  issuances: [],
  nextAssetId: 1000,
  addresses: {
    '1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn': {
      privateKey: 'cVqF5jD2sRrYgH8kL3mN6pB9tW1xZ4yC7vJ0dA2eS5fG8hK3nM',
      wif: 'cVqF5jD2sRrYgH8kL3mN6pB9tW1xZ4yC7vJ0dA2eS5fG8hK3nM'
    }
  }
};

// Inicializar com alguns dados de teste
function initializeTestData() {
  // PEPECASH balance
  blockchain.balances['1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn'] = {
    PEPECASH: 1000,
    XCP: 50
  };

  // Assets existentes
  blockchain.assets['PEPECASH'] = {
    asset: 'PEPECASH',
    asset_longname: null,
    owner: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
    divisible: true,
    locked: false,
    supply: 1000000000,
    description: 'Pepe Cash Token'
  };

  blockchain.assets['XCP'] = {
    asset: 'XCP',
    asset_longname: null,
    owner: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
    divisible: true,
    locked: false,
    supply: 2600000,
    description: 'Counterparty Protocol Token'
  };
}

// Implementação dos métodos da API
class CounterpartyLocalAPI {
  // get_balances
  static getBalances(filters = []) {
    let balances = [];

    Object.entries(blockchain.balances).forEach(([address, assets]) => {
      Object.entries(assets).forEach(([asset, quantity]) => {
        const balance = { address, asset, quantity };
        
        // Aplicar filtros
        const matches = filters.every(filter => {
          switch (filter.op) {
            case '==': return balance[filter.field] === filter.value;
            case '!=': return balance[filter.field] !== filter.value;
            default: return true;
          }
        });

        if (matches) balances.push(balance);
      });
    });

    return balances;
  }

  // get_asset_info
  static getAssetInfo(asset) {
    return blockchain.assets[asset] || null;
  }

  // create_issuance
  static createIssuance(source, asset, quantity, description, divisible = true) {
    // Verificar se asset já existe
    if (blockchain.assets[asset]) {
      throw new Error(`Asset ${asset} already exists`);
    }

    // Criar novo asset
    const newAsset = {
      asset,
      asset_longname: null,
      owner: source,
      divisible,
      locked: false,
      supply: quantity,
      description,
      timestamp: new Date().toISOString()
    };

    blockchain.assets[asset] = newAsset;

    // Adicionar balance
    if (!blockchain.balances[source]) {
      blockchain.balances[source] = {};
    }
    blockchain.balances[source][asset] = quantity;

    // Gerar transaction hex (simulado)
    const txHex = this.generateMockTransactionHex('issuance', {
      source,
      asset,
      quantity,
      description
    });

    return txHex;
  }

  // broadcast_tx
  static broadcastTx(txHex) {
    // Simular broadcast - apenas armazenar a transação
    const tx = {
      txid: this.generateTxId(),
      hex: txHex,
      status: 'broadcast',
      timestamp: new Date().toISOString()
    };

    blockchain.transactions.push(tx);
    return tx.txid;
  }

  // Métodos auxiliares
  static generateMockTransactionHex(type, data) {
    // Gerar um hex de transação simulado
    const randomHex = Buffer.from(JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 9)
    })).toString('hex');

    return randomHex;
  }

  static generateTxId() {
    return Math.random().toString(36).substr(2, 64);
  }
}

// Rotas da API
app.post('/api/', authenticate, (req, res) => {
  try {
    const { method, params, jsonrpc, id } = req.body;

    console.log('Local API Call:', method, params);

    let result;
    switch (method) {
      case 'get_balances':
        result = CounterpartyLocalAPI.getBalances(params?.filters || []);
        break;

      case 'get_asset_info':
        result = CounterpartyLocalAPI.getAssetInfo(params?.asset);
        break;

      case 'create_issuance':
        result = CounterpartyLocalAPI.createIssuance(
          params.source,
          params.asset,
          params.quantity,
          params.description,
          params.divisible
        );
        break;

      case 'broadcast_tx':
        result = CounterpartyLocalAPI.broadcastTx(params.tx_hex);
        break;

      case 'get_running_info':
        result = {
          counterparty_version: '9.56.0',
          db_caught_up: true,
          bitcoind_version: '240000',
          running_testnet: false,
          running_regtest: true,
          last_block: {
            block_index: 1000,
            block_hash: 'mock_hash_12345'
          }
        };
        break;

      default:
        return res.status(404).json({
          error: `Method ${method} not found`,
          jsonrpc: jsonrpc || '2.0',
          id: id || null
        });
    }

    res.json({
      result,
      jsonrpc: jsonrpc || '2.0',
      id: id || 0
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message,
      jsonrpc: '2.0',
      id: req.body.id || null
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    network: NETWORK,
    timestamp: new Date().toISOString(),
    assets_count: Object.keys(blockchain.assets).length,
    addresses_count: Object.keys(blockchain.balances).length
  });
});

// Rota para visualizar estado atual
app.get('/state', authenticate, (req, res) => {
  res.json({
    balances: blockchain.balances,
    assets: blockchain.assets,
    transactions: blockchain.transactions.length,
    issuances: blockchain.issuances.length
  });
});

// Reset do estado (apenas desenvolvimento)
app.post('/reset', authenticate, (req, res) => {
  Object.keys(blockchain).forEach(key => {
    if (key !== 'addresses') {
      blockchain[key] = {};
    }
  });
  initializeTestData();
  res.json({ message: 'State reset successfully' });
});

// Inicializar servidor
function startServer() {
  initializeTestData();
  
  app.listen(PORT, () => {
    console.log(`🚀 Counterparty Local API running on port ${PORT}`);
    console.log(`🔐 Authentication: ${API_USER}:${API_PASSWORD}`);
    console.log(`🌐 Network: ${process.env.NETWORK || 'regtest'}`);
    console.log(`📊 Initial data loaded:`);
    console.log(`   - ${Object.keys(blockchain.assets).length} assets`);
    console.log(`   - ${Object.keys(blockchain.balances).length} addresses with balances`);
  });
}

startServer();

module.exports = app;