import { Chip } from '@mui/material';
import type { Produto } from '../types';

const statusConfig = {
  completo: { label: 'Completo', color: 'success' as const },
  falta_pouco: { label: 'Falta pouco', color: 'warning' as const },
  falta_bastante: { label: 'Falta bastante', color: 'error' as const },
};

export function StatusChip({ status }: { status: Produto['status'] }) {
  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" />;
}
