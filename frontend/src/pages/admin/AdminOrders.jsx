import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  cancelOrder,
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'DELIVERED'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders({
        page,
        size: 10,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Orders"
        subtitle="Review, update status, cancel, and manage all student orders."
      />

      <Card padding="sm">
        <div className="grid gap-4 md:grid-cols-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => {
              setFilters((p) => ({ ...p, status: e.target.value }));
              setPage(0);
            }}
            options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
          />
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => setFilters({ status: '', from: '', to: '' })}>Clear filters</Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center"><LoadingSpinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="p-6"><EmptyState title="No orders found" description="Orders will appear here once students start placing them." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Order', 'Student', 'Menu Date', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-100">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{order.studentEmail}</div>
                      <div className="text-xs text-zinc-400">{order.collegeName || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(order.menuDate)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                          className="min-w-[140px]"
                        />
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(order.id)}>Cancel</Button>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleDelete(order.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-zinc-200 px-6 py-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
};

export default AdminOrders;
