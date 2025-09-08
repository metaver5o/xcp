#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, 'xcp_state.json');

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return initializeState();
  }
  const raw = fs.readFileSync(STATE_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (_) {
    return initializeState();
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function initializeState() {
  const state = {
    balances: {
      '1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn': {
        PEPECASH: 1000,
        XCP: 50
      }
    },
    assets: {
      PEPECASH: {
        asset: 'PEPECASH',
        asset_longname: null,
        owner: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
        divisible: true,
        locked: false,
        supply: 1000000000,
        description: 'Pepe Cash Token'
      },
      XCP: {
        asset: 'XCP',
        asset_longname: null,
        owner: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
        divisible: true,
        locked: false,
        supply: 2600000,
        description: 'Counterparty Protocol Token'
      }
    },
    transactions: [],
    issuances: [],
    nextAssetId: 1000
  };
  writeState(state);
  return state;
}

function generateTxId() {
  return Math.random().toString(36).substr(2, 64);
}

function encodeTxHex(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('hex');
}

function createIssuance(state, {
  source,
  asset,
  quantity,
  description,
  divisible = true,
  encoding = 'default',
  inscription = false,
  mime_type = 'text/plain',
  file_path
}) {
  if (!source) throw new Error('source is required');
  if (!asset) throw new Error('asset is required');
  if (quantity == null || Number.isNaN(Number(quantity))) throw new Error('quantity is required');
  if (state.assets[asset]) throw new Error(`Asset ${asset} already exists`);

  const newAsset = {
    asset,
    asset_longname: null,
    owner: source,
    divisible: Boolean(divisible),
    locked: false,
    supply: Number(quantity),
    description: String(description ?? ''),
    timestamp: new Date().toISOString(),
    encoding,
    mime_type: inscription ? mime_type : null
  };
  state.assets[asset] = newAsset;
  if (!state.balances[source]) state.balances[source] = {};
  state.balances[source][asset] = Number(quantity);

  let result;
  if (encoding === 'taproot') {
    let contentHex = null;
    let contentLength = 0;
    if (inscription && file_path) {
      const abs = path.resolve(process.cwd(), file_path);
      if (!fs.existsSync(abs)) throw new Error(`file not found: ${file_path}`);
      const buf = fs.readFileSync(abs);
      contentHex = buf.toString('hex');
      contentLength = buf.length;
    }
    const commitHex = encodeTxHex({
      type: 'issuance_commit',
      data: { source, asset, quantity: Number(quantity), description },
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 9),
      taproot: true
    });
    const revealHex = encodeTxHex({
      type: 'issuance_reveal',
      data: { source, asset, quantity: Number(quantity), description, inscription, mime_type, content_hex: contentHex, content_length: contentLength },
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 9),
      taproot: true,
      ordinals_compatible: Boolean(inscription),
      mime_type
    });
    result = { commit: commitHex, reveal: revealHex };
  } else {
    const hex = encodeTxHex({
      type: 'issuance',
      data: { source, asset, quantity: Number(quantity), description },
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 9)
    });
    result = { tx: hex };
  }

  state.issuances.push({ asset, source, quantity: Number(quantity), encoding, inscription: Boolean(inscription), created_at: new Date().toISOString() });
  return result;
}

function broadcast(state, txHex, kind = 'broadcast') {
  if (!txHex) throw new Error('tx hex is required');
  const tx = { txid: generateTxId(), hex: txHex, status: kind, timestamp: new Date().toISOString() };
  state.transactions.push(tx);
  return tx.txid;
}

function print(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function help() {
  console.log('xcp-cli - local issuance simulator');
  console.log('');
  console.log('Commands:');
  console.log('  create-issuance --source <addr> --asset <name> --quantity <n> \\');
  console.log('                  [--description <str>] [--divisible true|false] \\');
  console.log('                  [--encoding default|taproot] [--inscription true|false] [--mime <type>] \\');
  console.log('                  [--file <path>]');
  console.log('  broadcast --hex <rawhex>');
  console.log('  broadcast-reveal --hex <rawhex>');
  console.log('  get-state');
  console.log('  reset-state');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') args.source = argv[++i];
    else if (a === '--asset') args.asset = argv[++i];
    else if (a === '--quantity') args.quantity = Number(argv[++i]);
    else if (a === '--description') args.description = argv[++i];
    else if (a === '--divisible') args.divisible = argv[++i] === 'true';
    else if (a === '--encoding') args.encoding = argv[++i];
    else if (a === '--inscription') args.inscription = argv[++i] === 'true';
    else if (a === '--mime') args.mime_type = argv[++i];
    else if (a === '--file') args.file_path = argv[++i];
    else if (a === '--hex') args.hex = argv[++i];
  }
  return args;
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    help();
    process.exit(0);
  }

  const args = parseArgs(rest);
  const state = readState();

  try {
    switch (cmd) {
      case 'create-issuance': {
        if (args.inscription && args.file_path && !args.mime_type) {
          const ext = path.extname(args.file_path || '').toLowerCase();
          if (ext === '.jpg' || ext === '.jpeg') args.mime_type = 'image/jpeg';
          else if (ext === '.png') args.mime_type = 'image/png';
          else if (ext === '.gif') args.mime_type = 'image/gif';
          else if (ext === '.svg') args.mime_type = 'image/svg+xml';
          else if (ext === '.json') args.mime_type = 'application/json';
          else if (ext === '.txt') args.mime_type = 'text/plain';
        }
        const result = createIssuance(state, args);
        writeState(state);
        print(result);
        break;
      }
      case 'broadcast': {
        const txid = broadcast(state, args.hex, 'broadcast');
        writeState(state);
        print({ txid });
        break;
      }
      case 'broadcast-reveal': {
        const txid = broadcast(state, args.hex, 'reveal_broadcast');
        writeState(state);
        print({ txid });
        break;
      }
      case 'get-state': {
        print(state);
        break;
      }
      case 'reset-state': {
        const fresh = initializeState();
        print({ message: 'State reset successfully', assets: Object.keys(fresh.assets).length });
        break;
      }
      default:
        console.error('Unknown command:', cmd);
        help();
        process.exit(1);
    }
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}

main();


