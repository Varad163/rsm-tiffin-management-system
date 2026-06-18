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
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  updateAttendance,
} from '../../services/attendanceService';
import { getStudents } from '../../services/studentService';
import { formatDate, toInputDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const emptyForm = {
  studentId: '',
  date: toInputDate(),
  present: 'true',
};

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ studentId: '', from: '', to: '', present: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const data = await getStudents({ page: 0, size: 100 });
      setStudents(data.content || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttendance({
        page,
        size: 10,
        studentId: filters.studentId || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        present: filters.present === '' ? undefined : filters.present === 'true',
      });
      setRecords(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const studentOptions = students.map((s) => ({
    value: String(s.id),
    label: `${s.email} (${s.collegeName || 'No college'})`,
  }));

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      studentId: String(record.studentId),
      date: record.date,
      present: String(record.present),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        studentId: Number(form.studentId),
        date: form.date,
        present: form.present === 'true',
      };
      if (editingRecord) {
        await updateAttendance(editingRecord.id, payload);
        toast.success('Attendance updated');
      } else {
        await createAttendance(payload);
        toast.success('Attendance marked');
      }
      setModalOpen(false);
      fetchAttendance();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      toast.success('Attendance deleted');
      fetchAttendance();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Attendance"
        subtitle="Mark, review, and manage daily student attendance."
        action={<Button onClick={openCreateModal}>Mark Attendance</Button>}
      />

      <Card padding="sm">
        <div className="grid gap-4 md:grid-cols-4">
          <Select
            label="Student"
            name="studentId"
            value={filters.studentId}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, studentId: e.target.value }));
              setPage(0);
            }}
            options={studentOptions}
          />
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
          <Select
            label="Status"
            value={filters.present}
            onChange={(e) => setFilters((p) => ({ ...p, present: e.target.value }))}
            options={[
              { value: 'true', label: 'Present' },
              { value: 'false', label: 'Absent' },
            ]}
          />
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No attendance records" description="Mark attendance to get started." action={<Button onClick={openCreateModal}>Mark Attendance</Button>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Student', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-100">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{record.studentEmail}</div>
                      <div className="text-xs text-zinc-400">{record.collegeName || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm">{record.present ? 'Present' : 'Absent'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(record)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(record.id)}>Delete</Button>
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
        title={editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>{editingRecord ? 'Save' : 'Mark'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select label="Student" name="studentId" value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} options={studentOptions} required />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
          <Select label="Status" value={form.present} onChange={(e) => setForm((p) => ({ ...p, present: e.target.value }))} options={[{ value: 'true', label: 'Present' }, { value: 'false', label: 'Absent' }]} />
        </form>
      </Modal>
    </div>
  );
};

export default AdminAttendance;
