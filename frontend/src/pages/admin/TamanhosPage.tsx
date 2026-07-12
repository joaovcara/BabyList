import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { tamanhoApi, getErrorMessage } from '../../api';
import { TamanhoCard } from '../../components/admin/TamanhoCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function TamanhosPage() {
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNome, setEditingNome] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showMessage } = useSnackbar();

  const loadData = useCallback(async () => {
    try {
      const res = await tamanhoApi.getAll();
      setTamanhos(res.data);
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingNome(null);
    setNome('');
    setDialogOpen(true);
  };

  const openEdit = (tamanho: string) => {
    setEditingNome(tamanho);
    setNome(tamanho);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingNome) {
        await tamanhoApi.update(editingNome, nome);
        showMessage('Tamanho atualizado');
      } else {
        await tamanhoApi.create(nome);
        showMessage('Tamanho criado');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = (tamanho: string) => {
    setDeleteTarget(tamanho);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tamanhoApi.delete(deleteTarget);
      showMessage('Tamanho excluído');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Tamanhos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : tamanhos.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          Nenhum tamanho cadastrado.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {tamanhos.map((tamanho) => (
            <Grid item xs={12} sm={6} md={4} key={tamanho}>
              <TamanhoCard nome={tamanho} onEdit={openEdit} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingNome ? 'Editar tamanho' : 'Novo tamanho'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir tamanho"
        message={`Deseja excluir o tamanho "${deleteTarget ?? ''}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
