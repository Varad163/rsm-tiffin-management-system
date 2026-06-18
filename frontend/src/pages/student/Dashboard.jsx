import Card, { CardHeader } from '../../components/ui/Card';

const StudentDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Student Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-500">
          View today&apos;s menu, track your orders, and manage your profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card padding="sm">
          <p className="text-sm text-zinc-500">Today&apos;s Menu</p>
          <p className="mt-2 text-lg font-medium text-zinc-900">Coming soon</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-zinc-500">Recent Orders</p>
          <p className="mt-2 text-lg font-medium text-zinc-900">Coming soon</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Welcome"
          subtitle="Your student portal is ready. Upcoming modules will connect to the backend APIs."
        />
        <p className="text-sm leading-relaxed text-zinc-500">
          Complete your profile, upload Aadhaar, and start placing orders from the sidebar sections.
        </p>
      </Card>
    </div>
  );
};

export default StudentDashboard;
