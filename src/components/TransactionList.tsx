interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  transaction_date: string;
  category?: Category | null;
  sub_category?: SubCategory | null;
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
          <th>Category</th>
          <th>Sub-Category</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(tx => (
          <tr key={tx.id}>
            <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
            <td>{tx.category?.name ?? 'N/A'}</td>
            <td>{tx.sub_category?.name ?? '-'}</td>
            <td>{tx.amount.toFixed(2)}</td>
            <td>{tx.description ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
