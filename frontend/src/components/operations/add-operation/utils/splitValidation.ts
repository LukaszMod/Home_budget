import type { SplitItem } from '../../../../lib/api';

export interface ValidationError {
  valid: boolean;
  message?: string;
}

export const validateSplitOperation = (
  splitItems: SplitItem[],
  remainingAmount: number,
  tolerance = 0.01
): ValidationError => {
  // Check if all fields are filled
  const hasEmptyFields = splitItems.some(
    (item) => !item.category_id || !item.amount || item.amount <= 0
  );
  if (hasEmptyFields) {
    return {
      valid: false,
      message: 'operations.fillAllFields',
    };
  }

  // Check if sum matches
  if (Math.abs(remainingAmount) > tolerance) {
    return {
      valid: false,
      message: 'operations.sumMustMatch',
    };
  }

  // Minimum 2 items
  if (splitItems.length < 2) {
    return {
      valid: false,
      message: 'Podział wymaga minimum 2 pozycji',
    };
  }

  return { valid: true };
};

export const validateBasicOperation = (accountId: number | '', amount: string): ValidationError => {
  if (!accountId || !amount) {
    return {
      valid: false,
      message: 'operations.messages.fillRequired',
    };
  }

  return { valid: true };
};
