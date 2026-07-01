import { useEffect, useMemo } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type { Category, OperationType } from '../../../../lib/api';

interface FormData {
  operationDate: string;
  amount: string;
  description: string;
  accountId: number | '';
  categoryId: number | '';
  operationType: OperationType | '';
  isSplit: boolean;
}

export const useCategorySelection = (
  watchedCategoryId: number | '',
  categories: Category[],
  setValue: UseFormSetValue<FormData>
) => {
  // Main categories (parent_id === null)
  const mainCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  );

  // Map: parent_id -> [subcategories]
  const subcategoriesByParent = useMemo(() => {
    const map = new Map<number, Category[]>();
    mainCategories.forEach((main) => {
      map.set(
        main.id,
        categories.filter((c) => c.parent_id === main.id)
      );
    });
    return map;
  }, [mainCategories, categories]);

  // Subcategories with group (format: { id, name, group: mainCat.name })
  const subcategoriesForAutocomplete = useMemo(() => {
    const result: Array<Category & { group: string }> = [];
    mainCategories.forEach((mainCat) => {
      const subs = subcategoriesByParent.get(mainCat.id) || [];
      subs.forEach((sub: Category) => {
        result.push({ ...sub, group: mainCat.name });
      });
    });
    return result;
  }, [mainCategories, subcategoriesByParent]);

  // Auto-set operation type based on selected subcategory
  useEffect(() => {
    if (watchedCategoryId) {
      const selectedCategory = categories.find((c) => c.id === watchedCategoryId);
      if (selectedCategory && selectedCategory.type) {
        setValue('operationType', selectedCategory.type as OperationType);
      }
    }
  }, [watchedCategoryId, categories, setValue]);

  return {
    mainCategories,
    subcategoriesByParent,
    subcategoriesForAutocomplete,
  };
};
