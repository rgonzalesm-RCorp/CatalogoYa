function LoadingScreen({ label = 'Cargando experiencia...' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="hero-surface flex items-center gap-4 px-6 py-4">
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand-coral" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
