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
  if (transactions.length === 0)
    return (
      <p className="text-center text-gray-500 py-6">No transactions yet.</p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-md divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Category', 'Sub-Category', 'Amount', 'Description'].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {transactions.map(tx => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {new Date(tx.transaction_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {tx.category?.name ?? 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {tx.sub_category?.name ?? '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {tx.amount.toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {tx.description ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
