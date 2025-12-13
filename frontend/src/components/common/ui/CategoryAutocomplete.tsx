import React, { useMemo } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Category } from '../../../lib/api'

interface CategoryAutocompleteProps {
  categories: Category[]
  value: number | ''
  onChange: (categoryId: number | '') => void
  label?: string
  disabled?: boolean
  required?: boolean
}

type CategoryWithGroup = Category & { group: string }

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  categories,
  value,
  onChange,
  label,
  disabled = false,
  required = false,
}) => {
  const { t } = useTranslation()

  // Filter main categories and subcategories
  const mainCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null || c.parent_id === undefined),
    [categories]
  )

  const subcategoriesByParent = useMemo(() => {
    const map = new Map<number, Category[]>()
    mainCategories.forEach((main) => {
      map.set(
        main.id,
        categories.filter((c) => c.parent_id === main.id)
      )
    })
    return map
  }, [mainCategories, categories])

  // Subcategories with group (format: { id, name, group: mainCat.name })
  const subcategoriesForAutocomplete = useMemo(() => {
    const result: CategoryWithGroup[] = []
    mainCategories.forEach((mainCat) => {
      const subs = subcategoriesByParent.get(mainCat.id) || []
      subs.forEach((sub) => {
        result.push({ ...sub, group: mainCat.name })
      })
    })
    return result
  }, [mainCategories, subcategoriesByParent])

  const selectedCategory = value
    ? subcategoriesForAutocomplete.find((c) => c.id === value)
    : null

  return (
    <Autocomplete
      options={subcategoriesForAutocomplete}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.name}
      value={selectedCategory || null}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.id : '')
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t('operations.fields.category') || 'Kategoria'}
          required={required}
        />
      )}
      noOptionsText={t('operations.filters.none') ?? 'Brak'}
      fullWidth
      disableClearable={false}
      disabled={disabled}
    />
  )
}

export default CategoryAutocomplete
