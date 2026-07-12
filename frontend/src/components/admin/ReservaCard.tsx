import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import type { Reserva } from '../../types';

interface ReservaCardProps {
  reserva: Reserva;
  onCancel: (id: number) => void;
}

export function ReservaCard({ reserva, onCancel }: ReservaCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {reserva.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {reserva.produtoNome}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Quantidade</Typography>
            <Typography fontWeight={600}>{reserva.quantidade}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Data</Typography>
            <Typography fontWeight={600}>
              {dayjs(reserva.data).format('DD/MM/YYYY HH:mm')}
            </Typography>
          </Box>
        </Box>
        {reserva.mensagem && (
          <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic' }} color="text.secondary">
            "{reserva.mensagem}"
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onCancel(reserva.id)}
        >
          Cancelar
        </Button>
      </CardActions>
    </Card>
  );
}
