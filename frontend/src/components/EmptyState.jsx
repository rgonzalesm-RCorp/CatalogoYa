function EmptyState({ title, description }) {
  return (
    <div className="panel text-center">
      <p className="font-display text-xl font-semibold text-brand-forest">{title}</p>
      <p className="mt-3 text-sm leading-6 text-brand-moss">{description}</p>
    </div>
  );
}

export default EmptyState;
