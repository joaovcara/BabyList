import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LoginIcon from '@mui/icons-material/Login';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { produtoApi, configApi, reservaApi, tamanhoApi, getErrorMessage } from '../../api';
import { ContribuirModal } from '../../components/ContribuirModal';
import { QuantityInput } from '../../components/QuantityInput';
import type { Produto, Configuracoes } from '../../types';
import { formatProdutoLabel, sortProdutosByTamanho } from '../../utils/produto';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function PublicPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [config, setConfig] = useState<Configuracoes>({ tituloLista: '', nomeBebe: '' });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contribuirOpen, setContribuirOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState('');
  const [search, setSearch] = useState('');
  const { showMessage } = useSnackbar();

  const loadData = useCallback(async () => {
    try {
      const [prodRes, configRes, tamRes] = await Promise.all([
        produtoApi.getAll(),
        configApi.get(),
        tamanhoApi.getAll(),
      ]);
      setProdutos(prodRes.data);
      setConfig(configRes.data);
      setTamanhos(tamRes.data);
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const progressoGeral = useMemo(() => {
    const totalNecessario = produtos.reduce((s, p) => s + p.necessario, 0);
    if (totalNecessario === 0) return 0;
    const totalPossui = produtos.reduce((s, p) => s + p.possui, 0);
    return Math.round((totalPossui / totalNecessario) * 100);
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return produtos;
    return produtos.filter((p) => {
      const label = formatProdutoLabel(p.nome, p.tamanho).toLowerCase();
      return (
        label.includes(term) ||
        p.nome.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        (p.tamanho?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [produtos, search]);

  const produtosPorCategoria = useMemo(() => {
    const map = new Map<string, Produto[]>();
    produtosFiltrados.forEach((p) => {
      const list = map.get(p.categoria) || [];
      list.push(p);
      map.set(p.categoria, list);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoria, items]) => [categoria, sortProdutosByTamanho(items, tamanhos)] as const);
  }, [produtosFiltrados, tamanhos]);

  const openReserva = (produto: Produto) => {
    if (produto.disponivel <= 0) {
      showMessage('Este item não está disponível para reserva', 'info');
      return;
    }
    setSelectedProduto(produto);
    setNome('');
    setQuantidade(1);
    setMensagem('');
    setDialogOpen(true);
  };

  const handleReserva = async () => {
    if (!selectedProduto) return;
    try {
      await reservaApi.create({
        produtoId: selectedProduto.id,
        nome,
        quantidade,
        mensagem: mensagem || undefined,
      });
      showMessage('Reserva realizada com sucesso!');
      setDialogOpen(false);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const showContribuir = Boolean(config.chavePix?.trim() || config.qrCodePix?.trim());

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #E5C4D0 0%, #F2E0E8 100%)',
          color: 'primary.dark',
          py: { xs: 4, md: 6 },
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ position: 'relative', px: { xs: 5, sm: 0 } }}>
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <ChildCareIcon sx={{ fontSize: { xs: 40, md: 48 }, mb: 1 }} />
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
              >
                {config.tituloLista}
              </Typography>
              {config.nomeBebe && (
                <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  {config.nomeBebe}
                </Typography>
              )}
            </Box>
            {showContribuir && (
              isMobile ? (
                <IconButton
                  onClick={() => setContribuirOpen(true)}
                  aria-label="Contribuir"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'primary.dark',
                    border: '1px solid',
                    borderColor: 'primary.dark',
                  }}
                >
                  <VolunteerActivismIcon />
                </IconButton>
              ) : (
                <Button
                  onClick={() => setContribuirOpen(true)}
                  startIcon={<VolunteerActivismIcon />}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'primary.dark',
                    borderColor: 'primary.dark',
                  }}
                  variant="outlined"
                  size="small"
                >
                  Contribuir
                </Button>
              )
            )}
            {isMobile ? (
              <IconButton
                component={RouterLink}
                to="/login"
                aria-label="Admin"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  color: 'primary.dark',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <LoginIcon />
              </IconButton>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  color: 'primary.dark',
                  borderColor: 'primary.dark',
                }}
                variant="outlined"
                size="small"
              >
                Admin
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight={600}>
                Progresso do enxoval
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {progressoGeral}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, progressoGeral)}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </CardContent>
        </Card>

        <TextField
          fullWidth
          size="small"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        {produtosPorCategoria.map(([categoria, items]) => (
          <Box key={categoria} sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              {categoria}
            </Typography>
            {items.map((produto) => (
              <Card key={produto.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">
                        {formatProdutoLabel(produto.nome, produto.tamanho)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {produto.possui} / {produto.necessario}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Restam ${produto.faltam}`}
                          size="small"
                          color={produto.faltam === 0 ? 'success' : 'default'}
                        />
                        {produto.reservado > 0 && (
                          <Chip
                            label={`${produto.reservado} reservado(s)`}
                            size="small"
                            color="info"
                          />
                        )}
                        <Chip
                          label={`${produto.disponivel} disponível(is)`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<CardGiftcardIcon />}
                      onClick={() => openReserva(produto)}
                      disabled={produto.disponivel <= 0}
                      sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, whiteSpace: 'nowrap' }}
                    >
                      Vou Presentear
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))}

        {produtosPorCategoria.length === 0 && (
          <Typography color="text.secondary" textAlign="center">
            {produtos.length === 0
              ? 'Nenhum produto cadastrado ainda.'
              : 'Nenhum produto encontrado.'}
          </Typography>
        )}
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reservar presente — {selectedProduto ? formatProdutoLabel(selectedProduto.nome, selectedProduto.tamanho) : ''}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta reserva é só um controle para os pais. Você precisa comprar o presente e entregar.
            A plataforma não realiza compra nem envio.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Disponível para reservar: {selectedProduto?.disponivel ?? 0}
          </Typography>
          <TextField
            fullWidth
            label="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
          />
          <QuantityInput
            label="Quantidade"
            value={quantidade}
            onChange={setQuantidade}
            min={1}
            max={selectedProduto?.disponivel ?? 1}
          />
          <TextField
            fullWidth
            label="Mensagem (opcional)"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleReserva}
            disabled={!nome.trim() || quantidade < 1}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <ContribuirModal
        open={contribuirOpen}
        onClose={() => setContribuirOpen(false)}
        config={config}
      />
    </Box>
  );
}
