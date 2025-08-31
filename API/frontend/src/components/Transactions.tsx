import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send,
  ContentCopy,
  CheckCircle,
  Refresh,
  Receipt,
} from '@mui/icons-material';
import { apiService, BlockchainState } from '../services/api';

const Transactions: React.FC = () => {
  const [txHex, setTxHex] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<BlockchainState | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchState = async () => {
    try {
      const stateData = await apiService.getState();
      setState(stateData);
    } catch (err) {
      console.error('Failed to fetch state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleBroadcast = async () => {
    if (!txHex.trim()) {
      setError('Please enter a transaction hex');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await apiService.broadcastTx(txHex.trim());
      
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.result);
        setTxHex(''); // Clear the input
        fetchState(); // Refresh state to show new transaction
      }
    } catch (err) {
      setError('Failed to broadcast transaction. Please check the transaction hex and try again.');
      console.error('Broadcast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTxHex(text);
    } catch (err) {
      console.error('Failed to read from clipboard:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Transaction Broadcasting
        </Typography>
        <IconButton onClick={fetchState} color="primary" size="large">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Broadcast Transaction */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Send sx={{ mr: 1 }} />
                Broadcast Transaction
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Transaction Hex"
                  value={txHex}
                  onChange={(e) => setTxHex(e.target.value)}
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Paste your signed transaction hex here..."
                  helperText="Enter the complete transaction hex from your wallet or the asset creation process"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleBroadcast}
                  disabled={loading || !txHex.trim()}
                  startIcon={<Send />}
                >
                  {loading ? 'Broadcasting...' : 'Broadcast Transaction'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={pasteFromClipboard}
                  startIcon={<ContentCopy />}
                >
                  Paste from Clipboard
                </Button>
              </Box>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Success Result */}
              {result && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Transaction broadcast successfully!
                  </Typography>
                  <Typography variant="body2">
                    Transaction ID: {result}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ mr: 1 }} />
                Transaction Info
              </Typography>

              {state && (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Transactions:
                    </Typography>
                    <Chip
                      label={state.transactions}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Issuances:
                    </Typography>
                    <Chip
                      label={state.issuances}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> Make sure your transaction is properly signed before broadcasting.
                    </Typography>
                  </Alert>

                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Warning:</strong> Broadcasting an invalid transaction will result in an error.
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              {state && state.transactions > 0 ? (
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    {state.transactions} transaction{state.transactions !== 1 ? 's' : ''} processed
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {state.issuances} asset issuance{state.issuances !== 1 ? 's' : ''} completed
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No transactions yet. Create and broadcast your first asset!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Transactions;
