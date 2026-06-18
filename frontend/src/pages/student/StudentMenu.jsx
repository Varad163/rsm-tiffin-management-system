import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import { getMenus, getTodayMenu } from '../../services/menuService';
import { formatDateLong, getWeekRange } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorHandler';

const MealBlock = ({ title, items }) => (
  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{title}</p>
    <p className="mt-2 text-sm leading-relaxed text-zinc-800">{items}</p>
  </div>
);

const MenuDayCard = ({ menu }) => (
  <Card padding="sm">
    <p className="text-sm font-semibold text-zinc-900">{formatDateLong(menu.menuDate)}</p>
    <div className="mt-4 space-y-3">
      <MealBlock title="Breakfast" items={menu.breakfast} />
      <MealBlock title="Lunch" items={menu.lunch} />
      <MealBlock title="Dinner" items={menu.dinner} />
    </div>
  </Card>
);

const StudentMenu = () => {
  const [loading, setLoading] = useState(true);
  const [todayMenu, setTodayMenu] = useState(null);
  const [weeklyMenus, setWeeklyMenus] = useState([]);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getWeekRange();
      const [todayResult, weekResult] = await Promise.allSettled([
        getTodayMenu(),
        getMenus({ from, to, page: 0, size: 7 }),
      ]);

      if (todayResult.status === 'fulfilled') {
        setTodayMenu(todayResult.value);
      } else {
        setTodayMenu(null);
      }

      if (weekResult.status === 'fulfilled') {
        setWeeklyMenus(weekResult.value.content || []);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

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
        title="Menus"
        subtitle="View today's menu and the weekly meal plan."
      />

      <Card>
        <CardHeader title="Today's Menu" subtitle="What is being served today." className="mb-6" />
        {!todayMenu ? (
          <EmptyState title="No menu for today" description="Today's menu has not been published yet." />
        ) : (
          <div className="space-y-3">
            <MealBlock title="Breakfast" items={todayMenu.breakfast} />
            <MealBlock title="Lunch" items={todayMenu.lunch} />
            <MealBlock title="Dinner" items={todayMenu.dinner} />
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-zinc-900">Weekly Menu</h2>
        {weeklyMenus.length === 0 ? (
          <EmptyState title="No weekly menus" description="Menus for this week are not available yet." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {weeklyMenus.map((menu) => (
              <MenuDayCard key={menu.id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMenu;
