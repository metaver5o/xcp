import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  CheckCircle,
  Info,
  Warning,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const AssetCreation: React.FC = () => {
  const [formData, setFormData] = useState({
    source: '1JXeYvPctZYLsFYcVyhuY2qsM3un7BMQmn',
    asset: '',
    quantity: 10,
    description: '{"p":"brc-20","op":"mint","tick":"ordi","amt":"10"}',
    divisible: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDivisibleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      divisible: event.target.value === 'true'
    }));
  };

  const generateAssetName = (type: 'numeric' | 'named') => {
    const timestamp = Date.now().toString();
    if (type === 'numeric') {
      return `A${timestamp}`;
    } else {
      return `ASSETNAME${timestamp}`;
    }
  };

  const handleCreateAsset = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await apiService.createIssuance({
        source: formData.source,
        asset: formData.asset,
        quantity: formData.quantity,
        description: formData.description,
        divisible: formData.divisible,
      });

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.result);
      }
    } catch (err) {
      setError('Failed to create asset. Please check your inputs and try again.');
      console.error('Asset creation error:', err);
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

  const isNumericAsset = formData.asset.startsWith('A') && /^A\d+$/.test(formData.asset);
  const isNamedAsset = formData.asset.startsWith('ASSETNAME') || (!isNumericAsset && formData.asset.length > 0);

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
        Create New Asset
      </Typography>

      <Grid container spacing={3}>
        {/* Asset Creation Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Add sx={{ mr: 1 }} />
                Asset Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Source Address"
                    value={formData.source}
                    onChange={handleInputChange('source')}
                    helperText="The address that will own the created asset"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Asset Name"
                    value={formData.asset}
                    onChange={handleInputChange('asset')}
                    helperText="Numeric assets start with 'A' followed by numbers. Named assets start with 'ASSETNAME' or any other name."
                    variant="outlined"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setFormData(prev => ({ ...prev, asset: generateAssetName('numeric') }))}
                    >
                      Generate Numeric
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setFormData(prev => ({ ...prev, asset: generateAssetName('named') }))}
                    >
                      Generate Named
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange('quantity')}
                    helperText="Initial supply of the asset"
                    variant="outlined"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (BRC-20 Inscription)"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    helperText="JSON string for BRC-20 inscription"
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Asset Type</FormLabel>
                    <RadioGroup
                      value={formData.divisible.toString()}
                      onChange={handleDivisibleChange}
                      row
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio />}
                        label="Divisible (can be split into smaller units)"
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio />}
                        label="Indivisible (whole units only)"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCreateAsset}
                    disabled={loading || !formData.asset || !formData.source}
                    startIcon={<Add />}
                    fullWidth
                  >
                    {loading ? 'Creating Asset...' : 'Create Asset'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Information Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1 }} />
                Asset Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Asset Type:
                </Typography>
                <Chip
                  label={isNumericAsset ? 'Numeric Asset' : isNamedAsset ? 'Named Asset' : 'Unknown'}
                  color={isNumericAsset ? 'primary' : isNamedAsset ? 'secondary' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Divisibility:
                </Typography>
                <Chip
                  label={formData.divisible ? 'Divisible' : 'Indivisible'}
                  color={formData.divisible ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Numeric Assets:</strong> Free to create, start with 'A' + numbers
                </Typography>
              </Alert>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Named Assets:</strong> Cost 0.5 XCP to create
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>BRC-20:</strong> Your asset will include the specified inscription
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              Transaction Created Successfully
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your asset creation transaction has been generated. The transaction hex is:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
                position: 'relative',
              }}
            >
              {result}
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(result)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Next Steps:</strong> Sign this transaction with your wallet and broadcast it to complete the asset creation.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AssetCreation;
