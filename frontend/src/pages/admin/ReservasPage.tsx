import { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { reservaApi, getErrorMessage } from '../../api';
import type { Reserva } from '../../types';
import { ReservaCard } from '../../components/admin/ReservaCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const { showMessage } = useSnackbar();

  const loadData = useCallback(async () => {
    try {
      const res = await reservaApi.getAll();
      setReservas(res.data);
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = (id: number) => {
    setCancelTargetId(id);
  };

  const confirmCancel = async () => {
    if (cancelTargetId === null) return;
    setCanceling(true);
    try {
      await reservaApi.delete(cancelTargetId);
      showMessage('Reserva cancelada');
      setCancelTargetId(null);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setCanceling(false);
    }
  };

  const cancelTarget = reservas.find((r) => r.id === cancelTargetId);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reservas de presentes
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : reservas.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          Nenhuma reserva registrada.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {reservas.map((reserva) => (
            <Grid item xs={12} key={reserva.id}>
              <ReservaCard reserva={reserva} onCancel={handleCancel} />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={cancelTargetId !== null}
        title="Cancelar reserva"
        message={
          cancelTarget
            ? `Deseja cancelar a reserva de ${cancelTarget.nome} para ${cancelTarget.produtoNome}?`
            : 'Deseja cancelar esta reserva?'
        }
        confirmLabel="Cancelar reserva"
        loading={canceling}
        onClose={() => setCancelTargetId(null)}
        onConfirm={confirmCancel}
      />
    </Box>
  );
}
