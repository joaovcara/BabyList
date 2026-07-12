import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PublicIcon from '@mui/icons-material/Public';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { getErrorMessage } from '../../api';

export function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(usuario, senha);
      navigate('/admin');
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ChildCareIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                BabyList
              </Typography>
              <Typography color="text.secondary">
                Acesse a área administrativa
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                margin="normal"
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                Entrar
              </Button>
              <Button
                fullWidth
                component={RouterLink}
                to="/"
                variant="outlined"
                size="large"
                startIcon={<PublicIcon />}
                sx={{ mt: 2 }}
              >
                Lista pública
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
