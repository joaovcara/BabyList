import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { produtoApi, categoriaApi, getErrorMessage } from '../../api';
import type { Produto } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface ProdutoForm {
  nome: string;
  categoria: string;
  necessario: number;
  possui: number;
}

const emptyForm: ProdutoForm = { nome: '', categoria: '', necessario: 0, possui: 0 };

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [receberOpen, setReceberOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoForm>(emptyForm);
  const [quantidadeRecebida, setQuantidadeRecebida] = useState(1);
  const { showMessage } = useSnackbar();

  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        produtoApi.getAll(),
        categoriaApi.getAll(),
      ]);
      setProdutos(prodRes.data);
      setCategorias(catRes.data);
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filtroCategoria || p.categoria === filtroCategoria;
      return matchSearch && matchCat;
    });
  }, [produtos, search, filtroCategoria]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoria: categorias[0] || '' });
    setDialogOpen(true);
  };

  const openEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria,
      necessario: produto.necessario,
      possui: produto.possui,
    });
    setDialogOpen(true);
  };

  const openReceber = (produto: Produto) => {
    setEditingId(produto.id);
    setQuantidadeRecebida(1);
    setReceberOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await produtoApi.update(editingId, form);
        showMessage('Produto atualizado');
      } else {
        await produtoApi.create(form);
        showMessage('Produto cadastrado');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      await produtoApi.delete(id);
      showMessage('Produto excluído');
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const handleReceber = async () => {
    if (!editingId) return;
    try {
      await produtoApi.receber(editingId, quantidadeRecebida);
      showMessage('Presente registrado');
      setReceberOpen(false);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 150 },
    { field: 'categoria', headerName: 'Categoria', width: 130 },
    { field: 'necessario', headerName: 'Necessário', width: 100, type: 'number' },
    { field: 'possui', headerName: 'Possui', width: 90, type: 'number' },
    { field: 'faltam', headerName: 'Faltam', width: 90, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => openReceber(params.row)} title="Recebi">
            <CardGiftcardIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={() => openEdit(params.row)} title="Editar">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} title="Excluir">
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Produtos
        </Typography>
        <TextField
          size="small"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={filtroCategoria}
            label="Categoria"
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {categorias.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo
        </Button>
      </Box>

      <DataGrid
        rows={filtered}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar produto' : 'Novo produto'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={form.categoria}
              label="Categoria"
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {categorias.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Necessário"
            type="number"
            value={form.necessario}
            onChange={(e) => setForm({ ...form, necessario: parseInt(e.target.value) || 0 })}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            label="Possui"
            type="number"
            value={form.possui}
            onChange={(e) => setForm({ ...form, possui: parseInt(e.target.value) || 0 })}
            margin="normal"
            inputProps={{ min: 0, max: form.necessario }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={receberOpen} onClose={() => setReceberOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Recebi presente</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Quantidade recebida"
            type="number"
            value={quantidadeRecebida}
            onChange={(e) => setQuantidadeRecebida(parseInt(e.target.value) || 1)}
            margin="normal"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceberOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleReceber}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
