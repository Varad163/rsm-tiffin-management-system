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
import Textarea from '../../components/ui/Textarea';
import { createMenu, deleteMenu, getMenus, updateMenu } from '../../services/menuService';
import { formatDate, toInputDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const emptyForm = {
  menuDate: toInputDate(),
  breakfast: '',
  lunch: '',
  dinner: '',
};

const AdminMenus = () => {
  const [menus, setMenus] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenus({
        page,
        size: 10,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setMenus(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const openCreateModal = () => {
    setEditingMenu(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (menu) => {
    setEditingMenu(menu);
    setForm({
      menuDate: menu.menuDate,
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      dinner: menu.dinner,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMenu) {
        await updateMenu(editingMenu.id, form);
        toast.success('Menu updated');
      } else {
        await createMenu(form);
        toast.success('Menu created');
      }
      setModalOpen(false);
      fetchMenus();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu?')) return;
    try {
      await deleteMenu(id);
      toast.success('Menu deleted');
      fetchMenus();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Menus"
        subtitle="Publish and manage daily breakfast, lunch, and dinner menus."
        action={<Button onClick={openCreateModal}>Add Menu</Button>}
      />

      <Card padding="sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => setFilters({ from: '', to: '' })}>Clear filters</Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center"><LoadingSpinner size="lg" /></div>
        ) : menus.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No menus found" description="Create a menu for today or upcoming days." action={<Button onClick={openCreateModal}>Add Menu</Button>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Date', 'Breakfast', 'Lunch', 'Dinner', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.id} className="border-b border-zinc-100 align-top">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{formatDate(menu.menuDate)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{menu.breakfast}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{menu.lunch}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{menu.dinner}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(menu)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(menu.id)}>Delete</Button>
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

      <Modal
        open={modalOpen}
        title={editingMenu ? 'Edit Menu' : 'Add Menu'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>{editingMenu ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Menu Date" name="menuDate" type="date" value={form.menuDate} onChange={handleChange} required />
          <Textarea label="Breakfast" name="breakfast" value={form.breakfast} onChange={handleChange} required />
          <Textarea label="Lunch" name="lunch" value={form.lunch} onChange={handleChange} required />
          <Textarea label="Dinner" name="dinner" value={form.dinner} onChange={handleChange} required />
        </form>
      </Modal>
    </div>
  );
};

export default AdminMenus;
