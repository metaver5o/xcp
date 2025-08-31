import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_USER = 'local';
const API_PASSWORD = 'localpass';

// Create axios instance with basic auth
const api = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: API_USER,
    password: API_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Balance {
  address: string;
  asset: string;
  quantity: number;
}

export interface Asset {
  asset: string;
  asset_longname: string | null;
  owner: string;
  divisible: boolean;
  locked: boolean;
  supply: number;
  description: string;
  timestamp?: string;
}

export interface Transaction {
  txid: string;
  hex: string;
  status: string;
  timestamp: string;
}

export interface BlockchainState {
  balances: Record<string, Record<string, number>>;
  assets: Record<string, Asset>;
  transactions: number;
  issuances: number;
}

export interface ApiResponse<T> {
  result: T;
  jsonrpc: string;
  id: number;
}

export interface ApiError {
  error: string;
  jsonrpc: string;
  id: number;
}

// API Methods
export const apiService = {
  // Health check
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  // Get balances with optional filters
  async getBalances(filters: Array<{field: string; op: string; value: string}> = []) {
    const response = await api.post('/api/', {
      jsonrpc: '2.0',
      id: 0,
      method: 'get_balances',
      params: { filters }
    });
    return response.data as ApiResponse<Balance[]>;
  },

  // Get asset info
  async getAssetInfo(asset: string) {
    const response = await api.post('/api/', {
      jsonrpc: '2.0',
      id: 1,
      method: 'get_asset_info',
      params: { asset }
    });
    return response.data as ApiResponse<Asset>;
  },

  // Create issuance
  async createIssuance(params: {
    source: string;
    asset: string;
    quantity: number;
    description: string;
    divisible: boolean;
  }) {
    const response = await api.post('/api/', {
      jsonrpc: '2.0',
      id: 2,
      method: 'create_issuance',
      params
    });
    return response.data as ApiResponse<string>;
  },

  // Broadcast transaction
  async broadcastTx(txHex: string) {
    const response = await api.post('/api/', {
      jsonrpc: '2.0',
      id: 3,
      method: 'broadcast_tx',
      params: { tx_hex: txHex }
    });
    return response.data as ApiResponse<string>;
  },

  // Get running info
  async getRunningInfo() {
    const response = await api.post('/api/', {
      jsonrpc: '2.0',
      id: 4,
      method: 'get_running_info',
      params: {}
    });
    return response.data as ApiResponse<any>;
  },

  // Get complete state
  async getState() {
    const response = await api.get('/state');
    return response.data as BlockchainState;
  },

  // Reset state
  async resetState() {
    const response = await api.post('/reset');
    return response.data as { message: string };
  },
};

export default apiService;
