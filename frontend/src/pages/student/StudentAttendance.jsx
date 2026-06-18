import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { getAttendanceByStudent } from '../../services/attendanceService';
import { getProfile } from '../../services/studentService';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      const data = await getAttendanceByStudent(profile.id, {
        page,
        size: 10,
        from: filters.from || undefined,
        to: filters.to || undefined,
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
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Attendance"
        subtitle="View your attendance history and daily status records."
      />

      <Card padding="sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center"><LoadingSpinner size="lg" /></div>
        ) : records.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No attendance records" description="Your attendance history will appear here once marked by admin." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {['Date', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-100">
                    <td className="px-6 py-4 text-sm text-zinc-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{record.present ? 'Present' : 'Absent'}</td>
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

export default StudentAttendance;
