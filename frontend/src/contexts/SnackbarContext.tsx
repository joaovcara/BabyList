import { useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SnackbarContextValue {
  showMessage: (message: string, severity?: 'success' | 'error' | 'info') => void;
}

import { createContext, useContext } from 'react';

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('success');

  const showMessage = useCallback(
    (msg: string, sev: 'success' | 'error' | 'info' = 'success') => {
      setMessage(msg);
      setSeverity(sev);
      setOpen(true);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={severity} onClose={() => setOpen(false)} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
}
