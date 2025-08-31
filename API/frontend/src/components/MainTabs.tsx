import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import Dashboard from './Dashboard';
import Balances from './Balances';
import AssetCreation from './AssetCreation';
import Transactions from './Transactions';
import Settings from './Settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const MainTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="main navigation tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<DashboardIcon />}
            label="Dashboard"
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            icon={<AccountBalanceWalletIcon />}
            label="Balances"
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            icon={<AddIcon />}
            label="Create Asset"
            iconPosition="start"
            {...a11yProps(2)}
          />
          <Tab
            icon={<SendIcon />}
            label="Transactions"
            iconPosition="start"
            {...a11yProps(3)}
          />
          <Tab
            icon={<SettingsIcon />}
            label="Settings"
            iconPosition="start"
            {...a11yProps(4)}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Dashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Balances />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AssetCreation />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Transactions />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Settings />
      </TabPanel>
    </Paper>
  );
};

export default MainTabs;
