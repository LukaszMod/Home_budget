import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import { useFormContext, type FieldArrayWithId, type UseFieldArrayUpdate } from 'react-hook-form';
import type { FullBudget } from './hooks/useBudget';
import CloseIcon from '@mui/icons-material/Close';
import ControlledTextField from '../common/ui/ControlledTextField';

type BudgtDescriptionModalProps = {
  descModal: { open: boolean; idx: number | null };
  setDescModal: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      idx: number | null;
    }>
  >;
};

const BudgetDescriptionModal = ({ descModal, setDescModal }: BudgtDescriptionModalProps) => {
  const { getValues, setValue } = useFormContext<FullBudget>();

  return (
    <Dialog
      open={descModal.open}
      onClose={() => setDescModal({ open: false, idx: null })}
      fullWidth
      maxWidth="sm"
    >
      {' '}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
        }}
      >
        Edytuj opis
        <IconButton onClick={() => setDescModal({ open: false, idx: null })} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {descModal.idx !== null && (
          <ControlledTextField
            fieldName={`budgets.${descModal.idx}.description`}
            fieldLabel="Opis"
            sx={{
              width: '100%',
              minHeight: '120px',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '4px',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDescriptionModal;
