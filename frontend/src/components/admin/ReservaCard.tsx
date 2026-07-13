import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import type { Reserva } from '../../types';

interface ReservaCardProps {
  reserva: Reserva;
  onConfirmar: (reserva: Reserva) => void;
  onCancel: (id: number) => void;
}

export function ReservaCard({ reserva, onConfirmar, onCancel }: ReservaCardProps) {
  const isAtiva = reserva.status === 'ativa';
  const isConcluida = reserva.status === 'concluida';
  const isCancelada = reserva.status === 'cancelada';

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            {reserva.nome}
          </Typography>
          {isConcluida && <Chip label="Concluída" size="small" color="success" />}
          {isCancelada && <Chip label="Cancelada" size="small" color="default" />}
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {reserva.produtoNome}
        </Typography>

        {isAtiva && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Reservado</Typography>
              <Typography fontWeight={600}>{reserva.quantidadeReservada}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Pendente</Typography>
              <Typography fontWeight={600}>{reserva.quantidade}</Typography>
            </Box>
            {reserva.quantidadeEntregueParcial > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Já entregue</Typography>
                <Typography fontWeight={600} color="success.main">
                  {reserva.quantidadeEntregueParcial}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Data reserva</Typography>
              <Typography fontWeight={600}>
                {dayjs(reserva.data).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </Box>
        )}

        {isConcluida && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Reservou</Typography>
              <Typography fontWeight={600}>{reserva.quantidadeReservada}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Entregou</Typography>
              <Typography fontWeight={600} color="success.main">
                {reserva.quantidadeEntregue ?? reserva.quantidadeEntregueParcial}
              </Typography>
            </Box>
            {reserva.dataEntrega && (
              <Box>
                <Typography variant="caption" color="text.secondary">Data entrega</Typography>
                <Typography fontWeight={600}>
                  {dayjs(reserva.dataEntrega).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {isCancelada && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Reservou</Typography>
              <Typography fontWeight={600}>{reserva.quantidadeReservada}</Typography>
            </Box>
            {reserva.dataCancelamento && (
              <Box>
                <Typography variant="caption" color="text.secondary">Cancelada em</Typography>
                <Typography fontWeight={600}>
                  {dayjs(reserva.dataCancelamento).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {reserva.mensagem && (
          <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic' }} color="text.secondary">
            "{reserva.mensagem}"
          </Typography>
        )}
      </CardContent>

      {isAtiva && (
        <CardActions>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => onConfirmar(reserva)}
          >
            Confirmar entrega
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onCancel(reserva.id)}
          >
            Cancelar
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
