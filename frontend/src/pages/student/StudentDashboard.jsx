import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import TodaysMenuCard from '../../components/admin/TodaysMenuCard';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { getAttendanceByStudent } from '../../services/attendanceService';
import { getTodayMenu } from '../../services/menuService';
import { getOrdersByStudent } from '../../services/orderService';
import { getProfile } from '../../services/studentService';
import { getErrorMessage } from '../../utils/errorHandler';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();
      setProfile(profileData);

      const [menuResult, ordersResult, attendanceResult] = await Promise.allSettled([
        getTodayMenu(),
        getOrdersByStudent(profileData.id, { page: 0, size: 5 }),
        getAttendanceByStudent(profileData.id, { page: 0, size: 100 }),
      ]);

      if (menuResult.status === 'fulfilled') {
        setTodayMenu(menuResult.value);
      } else {
        setTodayMenu(null);
      }

      if (ordersResult.status === 'fulfilled') {
        setRecentOrders(ordersResult.value.content || []);
      }

      if (attendanceResult.status === 'fulfilled') {
        const records = attendanceResult.value.content || [];
        const present = records.filter((r) => r.present).length;
        setAttendanceSummary({
          present,
          absent: records.length - present,
          total: records.length,
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Dashboard"
        subtitle="Your profile summary, attendance, orders, and today's menu at a glance."
        action={
          <Link to="/student/profile">
            <Button variant="secondary">View Profile</Button>
          </Link>
        }
      />

      <Card padding="sm">
        <CardHeader
          title="Profile Summary"
          subtitle="Your registered details in the tiffin system."
          className="mb-4"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Email</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">College</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{profile?.collegeName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Phone</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{profile?.phone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Status</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{profile?.active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Attendance Present" value={attendanceSummary.present} hint={`${attendanceSummary.total} total records`} />
        <StatCard label="Attendance Absent" value={attendanceSummary.absent} hint="Based on your records" />
        <StatCard label="Recent Orders" value={recentOrders.length} hint="Latest order activity" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" padding="default">
          <CardHeader title="Recent Orders" subtitle="Your latest meal orders." className="mb-6" />
          <RecentOrdersTable orders={recentOrders} />
        </Card>
        <div className="xl:col-span-1">
          <TodaysMenuCard menu={todayMenu} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
