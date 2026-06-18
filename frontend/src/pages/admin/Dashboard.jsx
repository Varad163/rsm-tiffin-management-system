import Card, { CardHeader } from '../../components/ui/Card';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-500">
          Monitor students, attendance, menus, and orders from a single workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['Students', 'Orders', 'Attendance', 'Menus'].map((item) => (
          <Card key={item} padding="sm">
            <p className="text-sm text-zinc-500">{item}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">—</p>
            <p className="mt-2 text-xs text-zinc-400">Connect API to populate stats</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Getting started"
          subtitle="Your admin modules will appear here as they are connected to the backend."
        />
        <p className="text-sm leading-relaxed text-zinc-500">
          Use the sidebar to navigate between Students, Attendance, Menus, and Orders once those
          pages are implemented.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
