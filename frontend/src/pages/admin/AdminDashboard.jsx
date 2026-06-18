import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import TodaysMenuCard from '../../components/admin/TodaysMenuCard';
import Card, { CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import { getDashboardStats } from '../../services/dashboardService';
import { getErrorMessage } from '../../utils/errorHandler';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setDashboard(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const attendance = dashboard?.todayAttendance;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-500">
          Live snapshot of students, orders, attendance, and today&apos;s menu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={dashboard?.totalStudents ?? 0}
          hint="All registered student accounts"
        />
        <StatCard
          label="Active Students"
          value={dashboard?.activeStudents ?? 0}
          hint="Currently active profiles"
        />
        <StatCard
          label="Total Orders"
          value={dashboard?.totalOrders ?? 0}
          hint="All-time order volume"
        />
        <StatCard
          label="Today's Attendance"
          value={attendance?.presentCount ?? 0}
          hint={`${attendance?.totalMarked ?? 0} marked · ${attendance?.absentCount ?? 0} absent`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" padding="default">
          <CardHeader
            title="Recent Orders"
            subtitle="Latest activity across the tiffin system."
            className="mb-6"
          />
          <RecentOrdersTable orders={dashboard?.recentOrders ?? []} />
        </Card>

        <div className="xl:col-span-1">
          <TodaysMenuCard menu={dashboard?.todayMenu} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
