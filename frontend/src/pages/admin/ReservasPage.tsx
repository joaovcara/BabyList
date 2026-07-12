import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { reservaApi, getErrorMessage } from '../../api';
import type { Reserva } from '../../types';
import { useSnackbar } from '../../contexts/SnackbarContext';

export function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleCancel = async (id: number) => {
    if (!confirm('Deseja cancelar esta reserva?')) return;
    try {
      await reservaApi.delete(id);
      showMessage('Reserva cancelada');
      loadData();
    } catch (err) {
      showMessage(getErrorMessage(err), 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 120 },
    { field: 'produtoNome', headerName: 'Produto', flex: 1, minWidth: 150 },
    { field: 'quantidade', headerName: 'Qtd', width: 80, type: 'number' },
    {
      field: 'data',
      headerName: 'Data',
      width: 150,
      valueFormatter: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
    { field: 'mensagem', headerName: 'Mensagem', flex: 1, minWidth: 150 },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleCancel(params.row.id)}
          title="Cancelar"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reservas de presentes
      </Typography>
      <DataGrid
        rows={reservas}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
    </Box>
  );
}
