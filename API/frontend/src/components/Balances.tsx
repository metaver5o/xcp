import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Refresh,
  AccountBalance,
  TrendingUp,
} from '@mui/icons-material';
import { apiService, Balance } from '../services/api';

const Balances: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAsset, setSearchAsset] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  const fetchBalances = async (assetFilter?: string, addressFilter?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = [];
      if (assetFilter) {
        filters.push({ field: 'asset', op: '==', value: assetFilter });
      }
      if (addressFilter) {
        filters.push({ field: 'address', op: '==', value: addressFilter });
      }

      const response = await apiService.getBalances(filters);
      setBalances(response.result);
    } catch (err) {
      setError('Failed to fetch balances');
      console.error('Balances fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleSearch = () => {
    fetchBalances(searchAsset || undefined, searchAddress || undefined);
  };

  const handleClearFilters = () => {
    setSearchAsset('');
    setSearchAddress('');
    fetchBalances();
  };

  const totalValue = balances.reduce((sum, balance) => sum + balance.quantity, 0);
  const uniqueAssets = new Set(balances.map(b => b.asset)).size;
  const uniqueAddresses = new Set(balances.map(b => b.address)).size;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Balance Overview
        </Typography>
        <IconButton onClick={() => fetchBalances()} color="primary" size="large">
          <Refresh />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Value</Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Unique Assets</Typography>
              </Box>
              <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                {uniqueAssets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Addresses</Typography>
              </Box>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {uniqueAddresses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filter Balances
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Asset"
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={<Search />}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Balances Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Balance Details
          </Typography>
          {loading ? (
            <Typography>Loading balances...</Typography>
          ) : balances.length === 0 ? (
            <Typography color="text.secondary">
              No balances found. Try adjusting your search filters.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Asset</strong></TableCell>
                    <TableCell align="right"><strong>Quantity</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balances.map((balance, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {balance.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={balance.asset}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {balance.quantity.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={balance.asset === 'XCP' ? 'Protocol Token' : 'Custom Asset'}
                          color={balance.asset === 'XCP' ? 'secondary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Balances;
