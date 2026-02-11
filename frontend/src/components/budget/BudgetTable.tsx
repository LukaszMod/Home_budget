import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormContext } from 'react-hook-form';
import type { Category } from '../../lib/api';
import type { FullBudget } from './hooks/useBudget';
import BudgetDescriptionModal from './BudgetDescriptionModal';
import EditIcon from '@mui/icons-material/Edit';
import ControlledCalcTextField from '../common/ui/ConrolledCalcTextField';

interface BudgetTableProps {
  categories: Category[];
}

const BudgetTable = ({ categories }: BudgetTableProps) => {
  const { watch } = useFormContext<FullBudget>();

  const [descModal, setDescModal] = React.useState<{ open: boolean; idx: number | null }>({
    open: false,
    idx: null,
  });

  const budgets = watch('budgets');

  const mainCategories = React.useMemo(
  () =>
    categories
      .filter((c) => c.parent_id === null && !c.is_hidden && !c.is_system)
      .sort((a, b) => a.sort_order - b.sort_order),
  [categories]
);


  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const toggle = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  React.useEffect(() => {
    setExpanded(Object.fromEntries(mainCategories.map((c) => [c.id, true])));
  }, [mainCategories]);

  return (
    <Box sx={{ overflow: 'auto', height: 'calc(100vh - 220px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: 12, borderBottom: `2px solid` }}>Kategoria</th>
            <th style={{ padding: 12, borderBottom: `2px solid` }}>Opis</th>
            <th style={{ padding: 12, borderBottom: `2px solid`, width: 120 }}>
              Plan
            </th>
            <th style={{ padding: 12, borderBottom: `2px solid`, width: 120 }}>
              Wydano
            </th>
            <th style={{ padding: 12, borderBottom: `2px solid`, width: 120 }}>
              Pozostało
            </th>
          </tr>
        </thead>

        <tbody>
          {mainCategories.map((parent) => {
            const subCategories = categories.filter((f) => f.parent_id === parent.id).sort((a, b) => a.sort_order - b.sort_order);
            const subBudgets = budgets.filter((b) => b.parent_id === parent.id);

            const planSum = subBudgets.reduce((acc, s) => acc + Number(s.planned), 0);
            const spendingSum = subBudgets.reduce((acc, s) => acc + Number(s.spending), 0);

            return (
              <React.Fragment key={parent.id}>
                <tr style={{  borderBottom: `1px solid` }}>
                  <td
                    style={{
                      padding: 12,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <IconButton size="small" onClick={() => toggle(parent.id)}>
                      {expanded[parent.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    {parent.name}
                  </td>

                  <td></td>

                  <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                    {planSum.toFixed(2)}
                  </td>

                  <td style={{ padding: 12, textAlign: 'center' }}>{spendingSum.toFixed(2)}</td>

                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {(planSum - spendingSum).toFixed(2)}
                  </td>
                </tr>

                {/* SUB-KATEGORIE */}
                {expanded[parent.id] &&
                  subCategories.map((category) => {
                    const idx = budgets.findIndex((f) => f.category_id === category.id);
                    const budget = budgets[idx];

                    return (
                      <tr key={category.id} style={{ borderBottom: `1px solid` }}>
                        <td style={{ padding: 12 }}>{category.name}</td>

                        {/* DESCRIPTION */}
                        <td style={{ padding: 12 }}>
                          <IconButton
                            size="small"
                            onClick={() => setDescModal({ open: true, idx })}
                          >
                            <EditIcon />
                          </IconButton>
                          <span style={{ marginLeft: 8 }}>{budget.description}</span>
                        </td>

                        {/* PLANNED */}
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <ControlledCalcTextField
                            fieldName={`budgets.${idx}.planned`}
                            sx={{ width: 100 }}
                          />
                        </td>

                        {/* SPENDING */}
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {budget.spending.toFixed(2)}
                        </td>

                        {/* REMAINING */}
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {(budget.planned - budget.spending).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <BudgetDescriptionModal descModal={descModal} setDescModal={setDescModal} />
    </Box>
  );
};

export default BudgetTable;
