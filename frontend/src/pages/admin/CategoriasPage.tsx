import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoriaApi, getErrorMessage } from '../../api';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNome, setEditingNome] = useState<string | null>(null);
  const [nome, setNome] = useState('');
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

  const handleDelete = async (cat: string) => {
    if (!confirm(`Deseja excluir a categoria "${cat}"?`)) return;
    try {
      await categoriaApi.delete(cat);
      showMessage('Categoria excluída');
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
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

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Carregando..." />
          </ListItem>
        ) : (
          categorias.map((cat) => (
            <ListItem
              key={cat}
              divider
              secondaryAction={
                <Box>
                  <IconButton onClick={() => openEdit(cat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cat)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={cat} />
            </ListItem>
          ))
        )}
      </List>

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
    </Box>
  );
}
