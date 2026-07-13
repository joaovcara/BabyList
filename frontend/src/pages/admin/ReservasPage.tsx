import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { reservaApi, getErrorMessage } from '../../api';
import type { Reserva, ReservaStatus } from '../../types';
import { ReservaCard } from '../../components/admin/ReservaCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { QuantityInput } from '../../components/QuantityInput';
import { useSnackbar } from '../../contexts/SnackbarContext';

type FiltroStatus = ReservaStatus;

export function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroStatus>('ativa');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Reserva | null>(null);
  const [quantidadeRecebida, setQuantidadeRecebida] = useState(1);
  const [confirming, setConfirming] = useState(false);
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

  const filtered = useMemo(
    () => reservas.filter((r) => r.status === filtro),
    [reservas, filtro]
  );

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

  const openConfirmar = (reserva: Reserva) => {
    setConfirmTarget(reserva);
    setQuantidadeRecebida(reserva.quantidade || 1);
  };

  const handleConfirmar = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      const res = await reservaApi.confirmar(confirmTarget.id, quantidadeRecebida);
      if (res.data.status === 'ativa') {
        showMessage(
          `Entrega parcial registrada — ainda faltam ${res.data.quantidade} pendente(s)`
        );
      } else {
        showMessage(
          `Reserva concluída — total entregue: ${res.data.quantidadeEntregue ?? quantidadeRecebida}`
        );
      }
      setConfirmTarget(null);
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    } finally {
      setConfirming(false);
    }
  };

  const cancelTarget = reservas.find((r) => r.id === cancelTargetId);

  const emptyMessage = {
    ativa: 'Nenhuma reserva ativa.',
    concluida: 'Nenhuma reserva concluída.',
    cancelada: 'Nenhuma reserva cancelada.',
  }[filtro];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reservas de presentes
      </Typography>

      <Tabs
        value={filtro}
        onChange={(_, value: FiltroStatus) => setFiltro(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Ativas" value="ativa" />
        <Tab label="Concluídas" value="concluida" />
        <Tab label="Canceladas" value="cancelada" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          {reservas.length === 0 ? 'Nenhuma reserva registrada.' : emptyMessage}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((reserva) => (
            <Grid item xs={12} key={reserva.id}>
              <ReservaCard
                reserva={reserva}
                onConfirmar={openConfirmar}
                onCancel={handleCancel}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={confirmTarget !== null}
        onClose={() => !confirming && setConfirmTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar entrega</DialogTitle>
        <DialogContent>
          {confirmTarget && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {confirmTarget.nome} — {confirmTarget.produtoNome}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pendente: {confirmTarget.quantidade}
                {confirmTarget.quantidadeEntregueParcial > 0 &&
                  ` · Já entregue: ${confirmTarget.quantidadeEntregueParcial}`}
              </Typography>
              <QuantityInput
                label="Quantidade recebida"
                value={quantidadeRecebida}
                onChange={setQuantidadeRecebida}
                min={1}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Pode entregar mais ou menos que o reservado. Entregas parciais mantêm a reserva
                ativa.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTarget(null)} disabled={confirming}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleConfirmar} disabled={confirming}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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
