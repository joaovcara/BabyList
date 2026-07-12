import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface TamanhoCardProps {
  nome: string;
  onEdit: (nome: string) => void;
  onDelete: (nome: string) => void;
}

export function TamanhoCard({ nome, onEdit, onDelete }: TamanhoCardProps) {
  return (
    <Card>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {nome}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => onEdit(nome)} title="Editar">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(nome)} title="Excluir" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}
