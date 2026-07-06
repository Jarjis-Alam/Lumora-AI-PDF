export function Logo({ size = 32, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-lg bg-crimson-600 text-paper-50 font-serif font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        L
      </div>
      {withWordmark && (
        <span className="font-serif text-xl font-semibold tracking-editorial text-ink-800">
          Lumora
        </span>
      )}
    </div>
  );
}
