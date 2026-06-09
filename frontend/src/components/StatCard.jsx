function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}) {
  const toneClassMap = {
    default: 'bg-brand-cream/60 text-brand-forest',
    coral: 'bg-brand-coral/10 text-brand-coral',
    forest: 'bg-brand-forest text-brand-sand',
    gold: 'bg-brand-gold/20 text-brand-forest',
  };

  return (
    <article className="admin-panel">
      {Icon ? (
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClassMap[tone] || toneClassMap.default}`}>
          <Icon size={18} />
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-moss">{label}</p>
      <p className="mt-4 font-display text-3xl font-semibold text-brand-forest">{value}</p>
      <p className="mt-2 text-sm text-brand-moss">{hint}</p>
    </article>
  );
}

export default StatCard;
