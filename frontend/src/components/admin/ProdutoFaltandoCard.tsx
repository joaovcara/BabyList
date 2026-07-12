import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import type { Produto } from '../../types';
import { StatusChip } from '../StatusChip';

interface ProdutoFaltandoCardProps {
  produto: Produto;
}

export function ProdutoFaltandoCard({ produto }: ProdutoFaltandoCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {produto.nome}
            </Typography>
            <Chip label={produto.categoria} size="small" sx={{ mt: 0.5, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Faltam {produto.faltam} de {produto.necessario}
            </Typography>
          </Box>
          <StatusChip status={produto.status} />
        </Box>
      </CardContent>
    </Card>
  );
}
