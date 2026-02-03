import React from 'react';
import { type OperationType } from '../lib/api';
import type { Operation as APIOperation } from '../lib/api';
import { useOperations } from '../hooks/useOperations';
import { useAccountsData } from '../hooks/useAccountsData';
import { useCategories } from '../hooks/useCategories';
import { useHashtags } from '../hooks/useHashtags';
import { useTransfer } from '../hooks/useTransfer';
import {
  AddOperationModal,
  TransferDialog,
  OperationsTable,
  OperationDetailsDrawer,
} from '../components';
import ImportCSVDialog from '../components/operations/ImportCSVDialog';
import type { TransferData } from '../components/operations/TransferDialog';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useNotifier } from '../components/common/Notifier';
import { createOperation, getUsers, classifyUncategorizedOperations } from '../lib/api';
import PageHeader from '../components/common/ui/PageHeader';
import OperationFilters from '../components/operations/OperationFilters';
import { useOperationFilters, type DatePresent } from '../components/operations/hooks/useOperationFilters';
import OperationsSummary from '../components/operations/OperationsSummary';


function computeStartDate(preset: DatePresent): Date | null {
  const now = new Date();
  switch (preset) {
    case 'last7':
      return new Date(new Date().setDate(now.getDate() - 7));
    case 'last30':
      return new Date(new Date().setDate(now.getDate() - 30));
    case 'thisMonth':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'thisQuarter':
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    case 'thisYear':
      return new Date(now.getFullYear(), 0, 1);
    case 'prevYear':
      return new Date(now.getFullYear() - 1, 0, 1);
    default:
      return null;
  }
}

const Operations: React.FC = () => {
  const { t } = useTranslation();
  const { operationsQuery, deleteMutation } = useOperations();
  const { accountsQuery } = useAccountsData();
  const { categoriesQuery } = useCategories();
  const { hashtags } = useHashtags();
  const transferMutation = useTransfer();
  const notifier = useNotifier();
  const { state: filters, update: setFilters } = useOperationFilters();

  const operations = operationsQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  // Get first available user ID
  const [userId, setUserId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    getUsers()
      .then((users) => {
        if (users.length > 0) {
          setUserId(users[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to get users:', err);
      });
  }, []);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<APIOperation | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [selectedOperation, setSelectedOperation] = React.useState<APIOperation | null>(null);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (op: APIOperation) => {
    setEditing(op);
    setModalOpen(true);
  };
  const openTransfer = () => {
    setTransferDialogOpen(true);
  };
  const openImport = () => {
    setImportDialogOpen(true);
  };

  const handleTransfer = async (data: TransferData) => {
    await transferMutation.mutateAsync(data);
    setTransferDialogOpen(false);
  };

  const handleImport = async (operations: any[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const op of operations) {
        try {
          await createOperation(op);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error importing operation:', error);
        }
      }

      // Classify uncategorized operations as transfers
      try {
        const result = await classifyUncategorizedOperations();
        if (result.classified_count > 0) {
          notifier.notify(t('import.classified', { count: result.classified_count }), 'info');
        }
      } catch (error) {
        console.error('Error classifying operations:', error);
      }

      notifier.notify(t('import.success', { count: successCount }), 'success');

      if (errorCount > 0) {
        notifier.notify(t('import.partialError', { count: errorCount }), 'warning');
      }

      // Refresh the operations list
      await operationsQuery.refetch();
      setImportDialogOpen(false);
    } catch (error: any) {
      notifier.notify(error.message || t('import.error'), 'error');
      throw error;
    }
  };

  const filteredRows = React.useMemo(() => {
    let filtered = [...operations];
    let start: Date | null = null,
      end: Date | null = null;

    if (filters.datePreset === 'planned') {
      // Show only future operations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((r) => {
        if (!r.operation_date) return false;
        const d = new Date(r.operation_date);
        d.setHours(0, 0, 0, 0);
        return d > today;
      });
    } else if (filters.datePreset === 'custom') {
      if (filters.customDateFrom) start = new Date(filters.customDateFrom);
      if (filters.customDateTo) end = new Date(filters.customDateTo);
    } else {
      start = computeStartDate(filters.datePreset);
      end = new Date();
      if (filters.datePreset === 'prevYear') {
        const y = new Date().getFullYear() - 1;
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
    }

    if ((start || end) && filters.datePreset !== 'planned') {
      filtered = filtered.filter((r) => {
        if (!r.operation_date) return false;
        const d = new Date(r.operation_date).getTime();
        if (start && d < start.getTime()) return false;
        if (end && d > end.getTime()) return false;
        return true;
      });
    }
    if (filters.filterAccountIds.length > 0)
      filtered = filtered.filter((r) => filters.filterAccountIds.includes(r.asset_id));
    if (filters.filterCategoryIds.length > 0)
      filtered = filtered.filter(
        (r) => r.category_id && filters.filterCategoryIds.includes(r.category_id)
      );
    if (filters.filterOperationType !== '')
      filtered = filtered.filter((r) => r.operation_type === filters.filterOperationType);
    if (filters.filterHashtagIds.length > 0) {
      const selectedHashtagNames = hashtags
        .filter((h) => filters.filterHashtagIds.includes(h.id))
        .map((h) => h.name);
      filtered = filtered.filter((r) => {
        const description = r.description?.toLowerCase() || '';
        return selectedHashtagNames.some((tag) => description.includes(`#${tag.toLowerCase()}`));
      });
    }
    return filtered;
  }, [operations, filters, hashtags]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <PageHeader
        title={t('operations.title')}
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={openImport}>
              {t('operations.import')}
            </Button>
            <Button variant="outlined" startIcon={<SwapHorizIcon />} onClick={openTransfer}>
              {t('operations.transfer')}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
              {t('operations.add')}
            </Button>
          </Box>
        }
      />
      <OperationFilters filters={filters} setFilters={setFilters} />

      <OperationsTable
        operations={filteredRows.map((r) => operations.find((o) => o.id === r.id)!).filter(Boolean)}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        onSelect={(op) => setSelectedOperation(op)}
        selectedOperationId={selectedOperation?.id || null}
      />

      <OperationsSummary operations={filteredRows} />

      <AddOperationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        accounts={accounts}
        categories={categories}
        editing={editing}
        onSwitchToTransfer={() => {
          setModalOpen(false);
          setTransferDialogOpen(true);
        }}
      />
      <TransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onTransfer={handleTransfer}
        onSwitchToOperation={() => {
          setTransferDialogOpen(false);
          setModalOpen(true);
        }}
      />
      <ImportCSVDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
        accounts={accounts}
        categories={categories}
        userId={userId}
      />
      <OperationDetailsDrawer
        open={!!selectedOperation}
        operation={selectedOperation}
        onClose={() => setSelectedOperation(null)}
      />
    </Box>
  );
};

export default Operations;
