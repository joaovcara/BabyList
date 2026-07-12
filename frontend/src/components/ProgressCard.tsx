import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressCardProps {
  value: number;
  label?: string;
}

export function ProgressCard({ value, label = 'Progresso do enxoval' }: ProgressCardProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, value)}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: 'primary.light',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
          },
        }}
      />
    </Box>
  );
}
