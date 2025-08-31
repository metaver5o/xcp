import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  RestartAlt,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);

  const fetchHealth = async () => {
    try {
      const healthData = await apiService.getHealth();
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleResetState = async () => {
    if (!window.confirm('Are you sure you want to reset the blockchain state? This will delete all assets and transactions!')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.resetState();
      setSuccess('Blockchain state has been reset successfully!');
      
      // Refresh health data
      setTimeout(() => {
        fetchHealth();
      }, 1000);
    } catch (err) {
      setError('Failed to reset blockchain state');
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
        System Settings
      </Typography>

      <Grid container spacing={3}>
        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                System Status
              </Typography>

              {health ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      API Status:
                    </Typography>
                    <Chip
                      label={health.status}
                      color="success"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Network:
                    </Typography>
                    <Chip
                      label={health.network?.bech32 || 'Unknown'}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Assets Count:
                    </Typography>
                    <Chip
                      label={health.assets_count}
                      color="info"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Addresses Count:
                    </Typography>
                    <Chip
                      label={health.addresses_count}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Update:
                    </Typography>
                    <Typography variant="body2">
                      {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchHealth}
                    size="small"
                  >
                    Refresh Status
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Loading system status...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* API Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1 }} />
                API Configuration
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API URL:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    backgroundColor: 'grey.50',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  http://localhost:4000/api/
                </Paper>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Authentication:
                </Typography>
                <Chip
                  label="Basic Auth (local:localpass)"
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Network Mode:
                </Typography>
                <Chip
                  label="Regtest"
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This is a local development environment. All data is stored in memory and will be lost when the server restarts.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'error.main' }}>
                <Warning sx={{ mr: 1 }} />
                Danger Zone
              </Typography>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> The following actions are irreversible and will delete all blockchain data.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleResetState}
                  disabled={loading}
                  startIcon={<RestartAlt />}
                >
                  {loading ? 'Resetting...' : 'Reset Blockchain State'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  This will delete all assets, balances, and transactions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Messages */}
        {error && (
          <Grid item xs={12}>
            <Alert 
              severity="error" 
              action={
                <IconButton color="inherit" size="small" onClick={clearMessages}>
                  ×
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Alert 
              severity="success" 
              action={
                <IconButton color="inherit" size="small" onClick={clearMessages}>
                  ×
                </IconButton>
              }
            >
              {success}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Settings;
