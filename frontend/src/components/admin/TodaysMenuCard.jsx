import Card, { CardHeader } from '../ui/Card';

const MealSection = ({ title, items }) => (
  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{title}</p>
    <p className="mt-2 text-sm leading-relaxed text-zinc-800">{items || 'Not available'}</p>
  </div>
);

const TodaysMenuCard = ({ menu }) => {
  if (!menu) {
    return (
      <Card className="h-full">
        <CardHeader title="Today's Menu" subtitle="No menu published for today yet." />
        <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-10 text-center">
          <p className="text-sm text-zinc-500">
            Publish today&apos;s menu from the Menus section.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader
        title="Today's Menu"
        subtitle={`Published for ${new Intl.DateTimeFormat('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date(menu.menuDate))}`}
      />
      <div className="space-y-3">
        <MealSection title="Breakfast" items={menu.breakfast} />
        <MealSection title="Lunch" items={menu.lunch} />
        <MealSection title="Dinner" items={menu.dinner} />
      </div>
    </Card>
  );
};

export default TodaysMenuCard;
