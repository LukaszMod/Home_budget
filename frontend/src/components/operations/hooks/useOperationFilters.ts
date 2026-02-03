import React from 'react';
import type { OperationType } from '../../../lib/api';

export type DatePresent =
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'prevYear'
  | 'custom'
  | 'planned';

export type OperationFiltersState = {
  datePreset: DatePresent;
  customDateFrom: string;
  customDateTo: string;
  filterAccountIds: number[];
  filterCategoryIds: number[];
  filterOperationType: OperationType | '';
  filterHashtagIds: number[];
};

const initialState: OperationFiltersState = {
  datePreset: 'thisMonth',
  customDateFrom: '',
  customDateTo: '',
  filterAccountIds: [],
  filterCategoryIds: [],
  filterOperationType: '',
  filterHashtagIds: [],
};

export const useOperationFilters = () => {
  const [state, setState] = React.useState<OperationFiltersState>(initialState);

  // Uniwersalny updater — przyjmuje tylko zmieniane pola
  const update = React.useCallback(
    (patch: Partial<OperationFiltersState>) => setState((prev) => ({ ...prev, ...patch })),
    []
  );

  // Reset do wartości początkowych
  const reset = React.useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    update,
    reset,
  };
};

export type UseOperationFilters = ReturnType<typeof useOperationFilters>;
