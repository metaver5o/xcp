import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
  IconButton,
} from '@mui/material';
import {
    TrendingUp,
    AccountBalance,
    MonetizationOn,  // replaced TokenIcon
    Receipt,
    Refresh,
    CheckCircle,
    Error,
  } from '@mui/icons-material';
import { apiService, BlockchainState } from '../services/api';

const Dashboard: React.FC = () => {
  const [state, setState] = useState<BlockchainState | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [healthData, stateData] = await Promise.all([
        apiService.getHealth(),
        apiService.getState(),
      ]);
      
      setHealth(healthData);
      setState(stateData);
    } catch (err) {
      setError('Failed to fetch data. Make sure the API is running.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const totalAssets = state ? Object.keys(state.assets).length : 0;
  const totalAddresses = state ? Object.keys(state.balances).length : 0;
  const totalTransactions = state ? state.transactions : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          System Overview
        </Typography>
        <IconButton onClick={fetchData} color="primary" size="large">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* API Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h3">
                  API Status
                </Typography>
              </Box>
              <Chip 
                label={health?.status || 'Unknown'} 
                color="success" 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Network: {health?.network?.bech32 || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Update: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Assets */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonetizationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h3">
                  Total Assets
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 700 }}>
                {totalAssets}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assets created on the platform
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Addresses */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h3">
                  Active Addresses
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="secondary" sx={{ fontWeight: 700 }}>
                {totalAddresses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Addresses with balances
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h3">
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="info.main" sx={{ fontWeight: 700 }}>
                {totalTransactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transactions processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Assets */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                Recent Assets
              </Typography>
              {state && Object.keys(state.assets).length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.values(state.assets).slice(0, 6).map((asset) => (
                    <Chip
                      key={asset.asset}
                      label={`${asset.asset} (${asset.supply})`}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No assets created yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
