import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, needsSetup } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (needsSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export function SetupRoute({ children }: { children: React.ReactNode }) {
  const { loading, needsSetup, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!needsSetup) {
    return <Navigate to={isAuthenticated ? '/admin' : '/login'} replace />;
  }

  return <>{children}</>;
}
