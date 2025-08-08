interface Category {
  group_name: string;
  name: string;
}

interface Transaction {
  id: string;
  occurred_at: string;
  type: string;
  category?: Category | null;
  amount: number;
  description?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) return <p>No transactions yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(tx => (
          <tr key={tx.id}>
            <td>{new Date(tx.occurred_at).toLocaleDateString()}</td>
            <td>{tx.type}</td>
            <td>
              {tx.category ? `${tx.category.group_name} - ${tx.category.name}` : 'N/A'}
            </td>
            <td>{tx.amount.toFixed(2)}</td>
            <td>{tx.description ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
