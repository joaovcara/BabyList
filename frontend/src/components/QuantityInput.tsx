import { Box, IconButton, Typography } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

interface QuantityInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityInput({
  label,
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantityInputProps) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <IconButton
          onClick={() => onChange(value - 1)}
          disabled={disabled || !canDecrement}
          aria-label="Diminuir quantidade"
          sx={{
            borderRadius: 0,
            flex: 1,
            py: 1.25,
          }}
        >
          <RemoveIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="span"
          sx={{
            minWidth: 48,
            textAlign: 'center',
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          {value}
        </Typography>
        <IconButton
          onClick={() => onChange(value + 1)}
          disabled={disabled || !canIncrement}
          aria-label="Aumentar quantidade"
          sx={{
            borderRadius: 0,
            flex: 1,
            py: 1.25,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
