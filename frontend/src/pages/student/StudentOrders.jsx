import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';
import { getMenus } from '../../services/menuService';
import { cancelOrder, createOrder, getOrdersByStudent } from '../../services/orderService';
import { getProfile } from '../../services/studentService';
import { formatCurrency, formatDate, toInputDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const MEAL_PRICE = 50;

const StudentOrders = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    menuId: '',
    orderDate: toInputDate(),
    quantity: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();
      setProfile(profileData);

      const [ordersData, menusData] = await Promise.all([
        getOrdersByStudent(profileData.id, { page, size: 10 }),
        getMenus({ from: toInputDate(), page: 0, size: 20 }),
      ]);

      setOrders(ordersData.content || []);
      setTotalPages(ordersData.totalPages || 0);
      setMenus(menusData.content || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const menuOptions = menus.map((menu) => ({
    value: String(menu.id),
    label: `${formatDate(menu.menuDate)} — Lunch available`,
  }));

  const totalAmount = Number(form.quantity) * MEAL_PRICE;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    try {
      await createOrder({
        studentId: profile.id,
        menuId: Number(form.menuId),
        orderDate: form.orderDate,
        quantity: Number(form.quantity),
        totalAmount,
      });
      toast.success('Order placed successfully');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Orders"
        subtitle="Place new orders, review history, and cancel pending orders."
        action={<Button onClick={() => setModalOpen(true)}>Place Order</Button>}
      />

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center"><LoadingSpinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No orders yet"
              description="Place your first meal order to get started."
              action={<Button onClick={() => setModalOpen(true)}>Place Order</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Order', 'Menu Date', 'Quantity', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-100">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(order.menuDate)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{order.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4">
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(order.id)}>Cancel</Button>
                      )}
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

      <Modal
        open={modalOpen}
        title="Place Order"
        subtitle={`Meal price: ${formatCurrency(MEAL_PRICE)} per item`}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} isLoading={submitting}>Place Order</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handlePlaceOrder}>
          <Select
            label="Menu"
            value={form.menuId}
            onChange={(e) => setForm((p) => ({ ...p, menuId: e.target.value }))}
            options={menuOptions}
            required
          />
          <Input label="Order Date" type="date" value={form.orderDate} onChange={(e) => setForm((p) => ({ ...p, orderDate: e.target.value }))} required />
          <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} required />
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Total Amount</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">{formatCurrency(totalAmount)}</p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentOrders;
