import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#BC8FA3',
      light: '#F2E0E8',
      dark: '#9A7085',
    },
    secondary: {
      main: '#E5C4D0',
      light: '#FAF5F7',
      dark: '#C9A8B8',
    },
    success: {
      main: '#A8C9A0',
    },
    warning: {
      main: '#E8C9A0',
    },
    error: {
      main: '#D4A0A0',
    },
    background: {
      default: '#FDF9FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(188, 143, 163, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(188, 143, 163, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #F2E0E8 0%, #FAF5F7 100%)',
        },
      },
    },
  },
});
