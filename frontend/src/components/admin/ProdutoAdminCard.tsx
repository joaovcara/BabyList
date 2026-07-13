import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import type { Produto } from '../../types';
import { StatusChip } from '../StatusChip';
import { formatProdutoLabel } from '../../utils/produto';

interface ProdutoAdminCardProps {
  produto: Produto;
  onReceber: (produto: Produto) => void;
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
}

export function ProdutoAdminCard({
  produto,
  onReceber,
  onEdit,
  onDelete,
}: ProdutoAdminCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            {formatProdutoLabel(produto.nome, produto.tamanho)}
          </Typography>
          <StatusChip status={produto.status} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={produto.categoria} size="small" />
          {produto.tamanho && (
            <Chip label={produto.tamanho} size="small" variant="outlined" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Necessário</Typography>
            <Typography fontWeight={600}>{produto.necessario}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Possui</Typography>
            <Typography fontWeight={600}>{produto.possui}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Faltam</Typography>
            <Typography fontWeight={600} color={produto.faltam > 0 ? 'error.main' : 'success.main'}>
              {produto.faltam}
            </Typography>
          </Box>
          {produto.possui > produto.necessario && (
            <Box>
              <Typography variant="caption" color="text.secondary">Excedente</Typography>
              <Typography fontWeight={600} color="info.main">
                {produto.possui - produto.necessario}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => onReceber(produto)} title="Recebi" color="primary">
          <CardGiftcardIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(produto)} title="Editar">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(produto.id)} title="Excluir" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}
