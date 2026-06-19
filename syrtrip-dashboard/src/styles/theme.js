import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  direction: 'rtl',
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#4caf50' : '#2e7d32',
      light: mode === 'dark' ? '#81c784' : '#66bb6a',
      dark: mode === 'dark' ? '#388e3c' : '#1b5e20',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#212121',
      secondary: mode === 'dark' ? '#b0b0b0' : '#757575',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Tahoma", "Arial", sans-serif',
    h4: {
      fontWeight: 'bold',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a237e',
          color: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1a237e' : '#2e7d32',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default getTheme;