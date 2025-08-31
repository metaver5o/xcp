import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MainTabs from './components/MainTabs';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Deep blue
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#059669', // Emerald green
      light: '#10b981',
      dark: '#047857',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1f2937',
    },
    h6: {
      fontWeight: 500,
      color: '#374151',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
          <Toolbar>
            <AccountBalanceIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Counterparty Asset Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Professional Asset Creation & Management Platform
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Asset Management Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create, manage, and track your Counterparty assets with BRC-20 inscriptions
            </Typography>
          </Box>
          
          <MainTabs />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;