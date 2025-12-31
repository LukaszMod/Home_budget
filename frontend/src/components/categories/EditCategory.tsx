import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StyledModal from '../common/StyledModal';
import StyledIncomeSwitch from '../common/ui/StyledIncomeSwitch';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useCategories } from '../../hooks/useCategories';
import type { Category, CreateCategoryPayload } from '../../lib/api';
import { useNotifier } from '../common/Notifier';
import ControlledSingleSelect from '../common/ui/ControlledSingleSelect';
import ControlledTextField from '../common/ui/ControlledTextField';

interface CategoryForm {
  id: number;
  name: string;
  parentId: number | undefined;
  type: 'income' | 'expense';
}

const defaultCategoryForm: CategoryForm = {
  id: -1,
  name: '',
  parentId: undefined,
  type: 'expense',
};

type EditCategoryProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  editing: Category | null;
}

const EditCategory = ({ modalOpen, setModalOpen, editing }: EditCategoryProps) => {
  const { t } = useTranslation();
  const { categoriesQuery, createMut, updateMut } = useCategories();
  const notifier = useNotifier();
  const methods = useForm<CategoryForm>({
    defaultValues: defaultCategoryForm
  });

  const categories = categoriesQuery.data ?? [];

  const { handleSubmit, reset, getValues, setValue } = methods;

  React.useEffect(() => {
    if (editing) {
      reset({
        id: editing.id,
        name: editing.name,
        parentId: editing.parent_id ?? undefined,
        type: editing.type,
      });
    } else {
      reset(defaultCategoryForm);
    }
  }, [editing, reset]);

  const onSubmit = async (data: CategoryForm) => {
    if (!data.name.trim()) {
      return notifier.notify(
        t('categories.validation.nameRequired', { defaultValue: 'field Name is required' }),
        'error'
      );
    }
    const payload: CreateCategoryPayload = {
      name: data.name.trim(),
      parent_id: data.parentId ?? null,
      type: data.type,
    };
    try {
      if (editing && editing.id > 0) {
        await updateMut.mutateAsync({ id: editing.id, payload });
        notifier.notify(
          t('categories.messages.updated', { defaultValue: 'Category updated' }),
          'success'
        );
      } else {
        await createMut.mutateAsync(payload);
        notifier.notify(
          t('categories.messages.created', { defaultValue: 'Category created' }),
          'success'
        );
      }
      setModalOpen(false);
    } catch (e: any) {
      notifier.notify(String(e), 'error');
    }
  };

  const handleSave = handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing || editing?.id > 0
            ? t('categories.dialog.edit', { defaultValue: 'Edit Category' })
            : t('categories.dialog.new', { defaultValue: 'New Category' })
        }
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>
              {t('actions.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {t('actions.save', { defaultValue: 'Save' })}
            </Button>
          </>
        }
      >
        <ControlledTextField
          fieldName="name"
          fieldLabel={t('categories.fields.name', { defaultValue: 'Name' })}
          validationRules={{ required: t('categories.validation.nameRequired', { defaultValue: 'field Name is required' }) }}
        />
        <StyledIncomeSwitch name='type' />
        <ControlledSingleSelect
          fieldName="parentId"
          fieldLabel={t('categories.fields.parent', { defaultValue: 'Parent' })}
          options={[ { id: -1, value: undefined, label: '\u00A0' }, ...categories
            .filter((c) => c.parent_id === null && !c.is_hidden && !c.is_system)
            .map((c) => ({ id: c.id, value: c.id, label: c.name }))]}
        />
      </StyledModal>
    </FormProvider>
  );
};

export default EditCategory;
