import { Button, TextField } from "@mui/material"  
import { useTranslation } from "react-i18next"
import StyledModal from "../common/StyledModal"
import StyledIncomeSwitch from "../common/ui/StyledIncomeSwitch"
import React from "react";
import { useForm } from "react-hook-form";
import { useCategories } from "../../hooks/useCategories";
import type { Category, CreateCategoryPayload } from "../../lib/api";
import { useNotifier } from "../common/Notifier";
import ControlledTextFieldComponent from "../common/ui/ControlledTextField";
import ControlledSingleSelect from "../common/ui/ControlledSingleSelect";


interface CategoryForm{
    name: string,
    parentId: number | null,
    type: 'income' | 'expense',
};

const defaultCategoryForm: CategoryForm = {
    name: '',
    parentId: null,
    type: 'expense',
};

interface NewEditCategoryProps {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    editing: Category | null;
}

const NewEditCategory: React.FC<NewEditCategoryProps> = ({modalOpen,setModalOpen, editing}) => {
    const { t } = useTranslation()
    const { categoriesQuery, createMut, updateMut } = useCategories();
    const notifier = useNotifier()
    const methods = useForm<CategoryForm>({
        defaultValues: defaultCategoryForm,
    });

    const categories = categoriesQuery.data ?? [];

    const { handleSubmit, reset, getValues, setValue, control } = methods;

    React.useEffect(() => {
        if (editing) {
            reset({
                name: editing.name,
                parentId: editing.parent_id ?? null,
                type: editing.type,
            });
        } else {
            reset(defaultCategoryForm);
        }
    }, [editing, reset]);

    const onSubmit = async (data: CategoryForm) => {
      if (!data.name.trim()) {
        return notifier.notify(
          t('categories.validation.nameRequired') ?? 'Pole Nazwa jest wymagane',
          'error'
      )
      }
    const payload: CreateCategoryPayload = { name: data.name.trim(), parent_id: data.parentId ?? null, type: data.type }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload })
        notifier.notify(
          t('categories.messages.updated') ?? 'Kategoria zaktualizowana',
          'success'
        )
      } else {
        await createMut.mutateAsync(payload)
        notifier.notify(
          t('categories.messages.created') ?? 'Kategoria utworzona',
          'success'
        )
      }
      setModalOpen(false)
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
    };

    const handleSave = handleSubmit(onSubmit);

    return (<StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('categories.dialog.edit') : t('categories.dialog.new')}
        footer={(<><Button onClick={() => setModalOpen(false)}>{t('actions.cancel')}</Button><Button variant="contained" onClick={handleSave}>{t('actions.save')}</Button></>)}
      >
        <ControlledTextFieldComponent
          fieldName="name"
          fieldLabel={t('categories.fields.name')}
        />
        <StyledIncomeSwitch value={getValues('type')} onChange={(value) => setValue('type', value)} />
        <ControlledTextFieldComponent
          fieldName="parentId"
          fieldLabel={t('categories.fields.parent')}
        /> 
        <ControlledSingleSelect fieldName="parentId" fieldLabel={t('categories.fields.parent')} options={categories.filter(c => c.parent_id !== null).map((c) => ({id: c.id, value: c.id, label: c.name}))} />
      </StyledModal>
    )
}

export default NewEditCategory