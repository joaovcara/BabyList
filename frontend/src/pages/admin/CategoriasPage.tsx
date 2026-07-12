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
import { categoriaApi, getErrorMessage } from '../../api';
import { CategoriaCard } from '../../components/admin/CategoriaCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNome, setEditingNome] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showMessage } = useSnackbar();

  const loadData = useCallback(async () => {
    try {
      const res = await categoriaApi.getAll();
      setCategorias(res.data);
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

  const openEdit = (cat: string) => {
    setEditingNome(cat);
    setNome(cat);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingNome) {
        await categoriaApi.update(editingNome, nome);
        showMessage('Categoria atualizada');
      } else {
        await categoriaApi.create(nome);
        showMessage('Categoria criada');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = (cat: string) => {
    setDeleteTarget(cat);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriaApi.delete(deleteTarget);
      showMessage('Categoria excluída');
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
        <Typography variant="h5">Categorias</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : categorias.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          Nenhuma categoria cadastrada.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {categorias.map((cat) => (
            <Grid item xs={12} sm={6} md={4} key={cat}>
              <CategoriaCard nome={cat} onEdit={openEdit} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingNome ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
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
        title="Excluir categoria"
        message={`Deseja excluir a categoria "${deleteTarget ?? ''}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
