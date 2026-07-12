import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { appPath } from '../config/app';
import type { Configuracoes } from '../types';
import { useSnackbar } from '../contexts/SnackbarContext';

interface ContribuirModalProps {
  open: boolean;
  onClose: () => void;
  config: Pick<Configuracoes, 'chavePix' | 'mensagemContribuicao' | 'qrCodePix'>;
}

export function ContribuirModal({ open, onClose, config }: ContribuirModalProps) {
  const { showMessage } = useSnackbar();
  const qrCodeUrl = config.qrCodePix
    ? appPath(`/api/uploads/${config.qrCodePix}`)
    : null;

  const handleCopy = async () => {
    if (!config.chavePix) return;
    try {
      await navigator.clipboard.writeText(config.chavePix);
      showMessage('Chave PIX copiada!');
    } catch {
      showMessage('Não foi possível copiar a chave', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Contribuir</DialogTitle>
      <DialogContent>
        {config.mensagemContribuicao && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.mensagemContribuicao}
          </Typography>
        )}

        {qrCodeUrl ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Box
              component="img"
              src={qrCodeUrl}
              alt="QR Code PIX"
              sx={{ maxWidth: 200, width: '100%' }}
            />
          </Box>
        ) : (
          <Typography color="text.secondary" textAlign="center" sx={{ my: 2 }}>
            QR Code não disponível. Use a chave PIX abaixo.
          </Typography>
        )}

        {config.chavePix && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Chave PIX
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ wordBreak: 'break-all', mb: 2 }}
            >
              {config.chavePix}
            </Typography>
          </>
        )}

        <Typography variant="caption" color="text.secondary">
          Escaneie o QR Code ou copie a chave PIX. O valor é livre.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fechar</Button>
        {config.chavePix && (
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
          >
            Copiar chave
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
