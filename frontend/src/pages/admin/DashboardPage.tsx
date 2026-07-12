import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { dashboardApi, getErrorMessage } from '../../api';
import type { DashboardData } from '../../types';
import { ProgressCard } from '../../components/ProgressCard';
import { ProdutoFaltandoCard } from '../../components/admin/ProdutoFaltandoCard';
import { useSnackbar } from '../../contexts/SnackbarContext';

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}20`,
              color,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch((err) => showMessage(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [showMessage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de produtos"
            value={data.totalProdutos}
            icon={<InventoryIcon />}
            color="#BC8FA3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categorias"
            value={data.totalCategorias}
            icon={<CategoryIcon />}
            color="#E5C4D0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Itens completos"
            value={data.itensCompletos}
            icon={<CheckCircleIcon />}
            color="#81C784"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Itens pendentes"
            value={data.itensPendentes}
            icon={<PendingIcon />}
            color="#FFD54F"
          />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progresso do enxoval
          </Typography>
          <ProgressCard value={data.progressoGeral} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Produtos que ainda faltam
          </Typography>
          {data.produtosFaltando.length === 0 ? (
            <Typography color="text.secondary">
              Parabéns! Todos os itens estão completos.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {data.produtosFaltando.map((p) => (
                <Grid item xs={12} key={p.id}>
                  <ProdutoFaltandoCard produto={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
