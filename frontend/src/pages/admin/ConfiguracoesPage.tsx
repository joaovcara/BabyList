import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { configApi, getErrorMessage } from '../../api';
import { appPath } from '../../config/app';
import type { Configuracoes } from '../../types';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracoes>({
    tituloLista: '',
    nomeBebe: '',
    chavePix: '',
    mensagemContribuicao: '',
    qrCodePix: '',
  });
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSavePixConfig = async () => {
    setSaving(true);
    try {
      const res = await configApi.update({
        chavePix: config.chavePix,
        mensagemContribuicao: config.mensagemContribuicao,
      });
      setConfig(res.data);
      showMessage('Configurações PIX salvas');
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQrCode = async () => {
    if (!selectedFile) {
      showMessage('Selecione uma imagem do QR Code', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await configApi.uploadQrCode(selectedFile);
      setConfig(res.data);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showMessage('QR Code enviado com sucesso');
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQrCode = async () => {
    setSaving(true);
    try {
      const res = await configApi.deleteQrCode();
      setConfig(res.data);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showMessage('QR Code removido');
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

  const qrCodeUrl = config.qrCodePix
    ? appPath(`/api/uploads/${config.qrCodePix}`)
    : null;

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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contribuição PIX
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sem chave PIX ou QR Code, o botão Contribuir não aparece na página pública.
            Gere o QR Code no app do seu banco e envie a imagem aqui.
          </Typography>
          <TextField
            fullWidth
            label="Chave PIX"
            value={config.chavePix ?? ''}
            onChange={(e) => setConfig({ ...config, chavePix: e.target.value })}
            margin="normal"
            helperText="E-mail, CPF, telefone ou chave aleatória"
          />
          <TextField
            fullWidth
            label="Mensagem no modal"
            value={config.mensagemContribuicao ?? ''}
            onChange={(e) => setConfig({ ...config, mensagemContribuicao: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            helperText="Texto opcional exibido no modal de contribuição"
          />

          {qrCodeUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code PIX atual"
                sx={{ maxWidth: 200, width: '100%', borderRadius: 2 }}
              />
            </Box>
          )}

          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Selecionar imagem
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Arquivo selecionado: {selectedFile.name}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSavePixConfig}
              disabled={saving}
            >
              Salvar PIX
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadQrCode}
              disabled={saving || !selectedFile}
            >
              Enviar QR Code
            </Button>
            {config.qrCodePix && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteQrCode}
                disabled={saving}
              >
                Remover QR Code
              </Button>
            )}
          </Box>
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
