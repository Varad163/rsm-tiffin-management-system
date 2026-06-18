const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-3 max-w-2xl text-base text-zinc-500">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
