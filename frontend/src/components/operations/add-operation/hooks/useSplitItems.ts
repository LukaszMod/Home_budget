import { useState, useMemo } from 'react';
import type { SplitItem } from '../../../../lib/api';

export const useSplitItems = (totalAmount: string) => {
  const [splitItems, setSplitItems] = useState<SplitItem[]>([
    { category_id: 0, amount: 0, description: '' },
  ]);

  // Calculate split totals
  const allocatedAmount = useMemo(() => {
    return splitItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [splitItems]);

  const remainingAmount = useMemo(() => {
    const total = Number(totalAmount) || 0;
    return total - allocatedAmount;
  }, [totalAmount, allocatedAmount]);

  // Add split item
  const handleAddSplitItem = () => {
    setSplitItems([...splitItems, { category_id: 0, amount: 0, description: '' }]);
  };

  // Remove split item
  const handleRemoveSplitItem = (index: number) => {
    if (splitItems.length > 1) {
      setSplitItems(splitItems.filter((_, i) => i !== index));
    }
  };

  // Update split item
  const handleUpdateSplitItem = (index: number, field: keyof SplitItem, value: any) => {
    const updated = [...splitItems];
    updated[index] = { ...updated[index], [field]: value };
    setSplitItems(updated);
  };

  const reset = () => {
    setSplitItems([{ category_id: 0, amount: 0, description: '' }]);
  };

  return {
    splitItems,
    setSplitItems,
    allocatedAmount,
    remainingAmount,
    handleAddSplitItem,
    handleRemoveSplitItem,
    handleUpdateSplitItem,
    reset,
  };
};
