const EmptyState = ({ title, description, action }) => (
  <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-12 text-center">
    <p className="text-base font-medium text-zinc-900">{title}</p>
    {description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
