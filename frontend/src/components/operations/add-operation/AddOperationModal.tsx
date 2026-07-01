import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Grid, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StyledModal from '../../common/StyledModal';
import ConfirmDialog from '../../common/ConfirmDialog';
import { useHashtags } from '../../../hooks/useHashtags';
import type { Account, Category, Operation as APIOperation } from '../../../lib/api';
import type { OperationType } from '../../../lib/api';

// Import components
import { SwitchToTransferButton, OperationFormFields, SplitItemsPanel } from './components';

// Import hooks
import {
  useOperationMutations,
  useCategorySelection,
  useSplitItems,
  useOperationForm,
} from './hooks';

// Import utils
import { validateBasicOperation, validateSplitOperation, buildOperationPayload } from './utils';

interface AddOperationModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSwitchToTransfer?: () => void;
  editing?: APIOperation | null;
}

interface FormData {
  operationDate: string;
  amount: string;
  description: string;
  accountId: number | '';
  categoryId: number | '';
  operationType: OperationType | '';
  isSplit: boolean;
}

const AddOperationModal = ({
  open,
  onClose,
  accounts,
  categories,
  editing,
  onSwitchToTransfer,
}: AddOperationModalProps) => {
  const { t } = useTranslation();
  const { hashtags } = useHashtags();
  const { createMut, updateMut, unsplitMut, notifier } = useOperationMutations();
  const [unsplitConfirmOpen, setUnsplitConfirmOpen] = React.useState(false);

  const methods = useForm<FormData>({
    defaultValues: {
      operationDate: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      accountId: '',
      categoryId: '',
      operationType: '',
      isSplit: false,
    },
  });
  const { control, handleSubmit, reset, watch, setValue } = methods;

  // Split items logic
  const isSplit = watch('isSplit');
  const totalAmount = watch('amount');
  const {
    splitItems,
    setSplitItems,
    allocatedAmount,
    remainingAmount,
    handleAddSplitItem,
    handleRemoveSplitItem,
    handleUpdateSplitItem,
    reset: resetSplitItems,
  } = useSplitItems(totalAmount);

  // Form logic
  const { isPlanned } = useOperationForm(open, editing, reset, watch, setSplitItems);

  // Category selection logic
  const watchedCategoryId = watch('categoryId');
  const { subcategoriesForAutocomplete } = useCategorySelection(
    watchedCategoryId,
    categories,
    setValue
  );

  const handleSave = async (data: FormData, keepOpen = false) => {
    // Basic validation
    const basicValidation = validateBasicOperation(data.accountId, data.amount);
    if (!basicValidation.valid) {
      return notifier.notify(
        t(basicValidation.message as string) ??
          t('operations.messages.fillRequired') ??
          'Uzupełnij wymagane pola',
        'error'
      );
    }

    // Split validation
    if (data.isSplit) {
      const splitValidation = validateSplitOperation(splitItems, remainingAmount);
      if (!splitValidation.valid) {
        return notifier.notify(
          t(splitValidation.message as string) ?? splitValidation.message ?? 'Błąd',
          'error'
        );
      }
    }

    // Build payload
    const payload = buildOperationPayload(data, data.isSplit ? splitItems : undefined);

    try {
      if (editing) {
        // Editing existing operation
        if (editing.is_split && !data.isSplit) {
          // Was split, now regular - unsplit first
          await unsplitMut.mutateAsync(editing.id);
        }

        // Then update the operation
        await updateMut.mutateAsync({ id: editing.id, payload });
        notifier.notify(t('operations.messages.updated') ?? 'Operacja zaktualizowana', 'success');
        onClose();
      } else {
        // Creating new operation
        await createMut.mutateAsync(payload);
        notifier.notify(t('operations.messages.saved') ?? 'Operacja zapisana', 'success');
        if (!keepOpen) {
          onClose();
        } else {
          reset({
            operationDate: data.operationDate,
            amount: '',
            description: '',
            accountId: data.accountId,
            categoryId: data.categoryId,
            operationType: data.operationType,
            isSplit: false,
          });
          resetSplitItems();
        }
      }
    } catch (e: any) {
      notifier.notify(String(e), 'error');
    }
  };

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={editing ? t('operations.edit') : t('operations.add')}
    >
      <FormProvider {...methods}>
        <Grid container spacing={2}>
          {/* Switch to Transfer */}
          {onSwitchToTransfer && !editing && (
            <Grid item xs={12}>
              <SwitchToTransferButton
                onSwitch={() => {
                  onClose();
                  onSwitchToTransfer();
                }}
              />
            </Grid>
          )}

          {/* Left Column: Main Form */}
          <Grid item xs={12} md={isSplit || (editing && editing.is_split) ? 6 : 12}>
            <OperationFormFields
              control={control}
              setValue={setValue}
              isSplit={isSplit}
              isPlanned={isPlanned}
              accounts={accounts}
              categories={categories}
              hashtags={hashtags}
            />
          </Grid>

          {/* Right Column: Split Items (only when enabled) */}
          {(isSplit || (editing && editing.is_split)) && (
            <Grid item xs={12} md={6}>
              <SplitItemsPanel
                splitItems={splitItems}
                totalAmount={totalAmount}
                allocatedAmount={allocatedAmount}
                remainingAmount={remainingAmount}
                subcategoriesForAutocomplete={subcategoriesForAutocomplete}
                loadingChildren={false}
                onAddItem={handleAddSplitItem}
                onRemoveItem={handleRemoveSplitItem}
                onUpdateItem={handleUpdateSplitItem}
              />
            </Grid>
          )}

          {/* Buttons Section */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" onClick={handleSubmit((data) => handleSave(data, false))}>
                {t('common.save')}
              </Button>
              {editing && isSplit && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setUnsplitConfirmOpen(true)}
                >
                  {t('operations.unsplit') ?? 'Cofnij podział'}
                </Button>
              )}
              {!editing && (
                <Button variant="outlined" onClick={handleSubmit((data) => handleSave(data, true))}>
                  {t('operations.addAnother') ?? 'Dodaj kolejną'}
                </Button>
              )}
              <Button onClick={onClose}>{t('common.cancel')}</Button>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

      <ConfirmDialog
        open={unsplitConfirmOpen}
        message={
          t('operations.confirmUnsplit') ??
          'Czy na pewno chcesz cofnąć podział? Dzieci zostaną usunięte.'
        }
        confirmText={t('operations.unsplit') ?? 'Cofnij podział'}
        confirmColor="warning"
        onConfirm={async () => {
          if (editing) {
            try {
              await unsplitMut.mutateAsync(editing.id);
              onClose();
            } catch (e: any) {
              notifier.notify(String(e), 'error');
            }
          }
          setUnsplitConfirmOpen(false);
        }}
        onCancel={() => setUnsplitConfirmOpen(false)}
      />
    </StyledModal>
  );
};

export default AddOperationModal;
