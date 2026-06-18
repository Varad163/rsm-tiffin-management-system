import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiCalendar, FiCoffee, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/students', label: 'Students', icon: FiUsers },
  { to: '/admin/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/admin/menus', label: 'Menus', icon: FiCoffee },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-zinc-200 px-6 py-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              Tiffin System
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              Admin
            </h1>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-zinc-200 p-4">
            <div className="mb-4 rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Signed in as</p>
              <p className="truncate text-sm font-medium text-zinc-900">{user?.email}</p>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleLogout}>
              <FiLogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-4 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 lg:hidden">
                Admin Panel
              </p>
              <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 lg:block">
                {today}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900 lg:hidden">{user?.email}</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden text-sm text-zinc-500 md:inline">{today}</span>
              <span className="hidden rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="lg:hidden">
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
