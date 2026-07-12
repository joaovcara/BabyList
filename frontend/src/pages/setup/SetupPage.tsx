import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { getErrorMessage } from '../../api';

export function SetupPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const { setup } = useAuth();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) {
      showMessage('As senhas não coincidem', 'error');
      return;
    }
    setLoading(true);
    try {
      await setup(usuario, senha);
      showMessage('Conta criada com sucesso!');
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
                Bem-vindo ao BabyList
              </Typography>
              <Typography color="text.secondary">
                Configure sua conta de administrador para começar
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
              <TextField
                fullWidth
                label="Confirmar senha"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
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
                Criar conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
