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
import StatusBadge from '../../components/ui/StatusBadge';
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from '../../services/studentService';
import { getErrorMessage } from '../../utils/errorHandler';

const emptyForm = {
  email: '',
  password: '',
  phone: '',
  address: '',
  collegeName: '',
  active: true,
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents({
        page,
        size: 10,
        name: searchName || undefined,
        email: searchEmail || undefined,
      });
      setStudents(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, searchName, searchEmail]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      email: student.email,
      password: '',
      phone: student.phone || '',
      address: student.address || '',
      collegeName: student.collegeName || '',
      active: student.active,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          phone: form.phone,
          address: form.address,
          collegeName: form.collegeName,
          active: form.active,
        });
        toast.success('Student updated successfully');
      } else {
        await createStudent(form);
        toast.success('Student created successfully');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deactivated');
      fetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleActive = async (student) => {
    try {
      await updateStudent(student.id, { active: !student.active });
      toast.success(student.active ? 'Student deactivated' : 'Student activated');
      fetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Students"
        subtitle="Manage student accounts, profiles, and activation status."
        action={
          <Button onClick={openCreateModal}>Add Student</Button>
        }
      />

      <Card padding="sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search by college"
            name="searchName"
            placeholder="College name"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setPage(0);
            }}
          />
          <Input
            label="Search by email"
            name="searchEmail"
            placeholder="student@example.com"
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              setPage(0);
            }}
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSearchName('');
                setSearchEmail('');
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No students found"
              description="Try adjusting your search or add a new student."
              action={<Button onClick={openCreateModal}>Add Student</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Email', 'College', 'Phone', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{student.collegeName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{student.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.active ? 'CONFIRMED' : 'CANCELLED'} />
                      <span className="ml-2 text-xs text-zinc-500">
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(student)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(student)}>
                          {student.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(student.id)}>
                          Delete
                        </Button>
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
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        subtitle={editingStudent ? 'Update student profile details.' : 'Create a new student account.'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting}>
              {editingStudent ? 'Save changes' : 'Create student'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!editingStudent && (
            <>
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </>
          )}
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
          <Input label="College Name" name="collegeName" value={form.collegeName} onChange={handleChange} required />
          <label className="flex items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 rounded border-zinc-300" />
            Active student
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudents;
