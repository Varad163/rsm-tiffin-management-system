import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';

const RecentOrdersTable = ({ orders = [] }) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">No recent orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-zinc-200">
            {['Order', 'Student', 'Menu Date', 'Amount', 'Status', 'Ordered'].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400 first:pl-0 last:pr-0"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-4 text-sm font-medium text-zinc-900 first:pl-0">
                #{order.id}
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-zinc-900">{order.studentEmail}</div>
                <div className="text-xs text-zinc-400">{order.collegeName || '—'}</div>
              </td>
              <td className="px-4 py-4 text-sm text-zinc-600">{formatDate(order.menuDate)}</td>
              <td className="px-4 py-4 text-sm font-medium text-zinc-900">
                {formatCurrency(order.totalAmount)}
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-4 text-sm text-zinc-600 last:pr-0">
                {formatDate(order.orderDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
