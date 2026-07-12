import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { configApi, getErrorMessage } from '../../api';
import type { Configuracoes } from '../../types';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracoes>({ tituloLista: '', nomeBebe: '' });
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    configApi
      .get()
      .then((res) => setConfig(res.data))
      .catch((err) => showMessage(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [showMessage]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await configApi.update({
        tituloLista: config.tituloLista,
        nomeBebe: config.nomeBebe,
      });
      setConfig(res.data);
      showMessage('Configurações salvas');
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (senhaNova !== confirmarSenha) {
      showMessage('As senhas não coincidem', 'error');
      return;
    }
    setSaving(true);
    try {
      await configApi.update({ senhaAtual, senhaNova });
      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');
      showMessage('Senha alterada com sucesso');
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Configurações
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Página pública
          </Typography>
          <TextField
            fullWidth
            label="Título da lista"
            value={config.tituloLista}
            onChange={(e) => setConfig({ ...config, tituloLista: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nome do bebê"
            value={config.nomeBebe}
            onChange={(e) => setConfig({ ...config, nomeBebe: e.target.value })}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alterar senha
          </Typography>
          <TextField
            fullWidth
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nova senha"
            type="password"
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmar nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving || !senhaAtual || !senhaNova}
            sx={{ mt: 2 }}
          >
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
