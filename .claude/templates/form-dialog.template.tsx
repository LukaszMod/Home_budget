import React from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createEntity, type CreatePayload } from '../../lib/api';
import { useNotifier } from '../common/Notifier';
import ControlledTextField from '../common/ui/ControlledTextField';

interface FormData {
  field1: string;
  field2: number;
}

interface Create{{EntityName}}DialogProps {
  open: boolean;
  onClose: () => void;
}

const Create{{EntityName}}Dialog = ({ open, onClose }: Create{{EntityName}}DialogProps) => {
  const qc = useQueryClient();
  const notifier = useNotifier();
  const { t } = useTranslation();

  const methods = useForm<FormData>({
    defaultValues: {
      field1: '',
      field2: 0,
    },
  });

  const { control, handleSubmit, reset } = methods;

  const mutation = useMutation<void, Error, CreatePayload>({
    mutationFn: createEntity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entities'] });
      notifier.notify(t('common:saved'), 'success');
      reset();
      onClose();
    },
    onError: (error) => {
      notifier.notify(error.message, 'error');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as CreatePayload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('key:create')}</DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Controller
              name="field1"
              control={control}
              render={({ field }) => (
                <ControlledTextField {...field} label={t('key:field1')} />
              )}
            />
          </Stack>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common:cancel')}</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={mutation.isPending}
        >
          {t('common:save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Create{{EntityName}}Dialog;
