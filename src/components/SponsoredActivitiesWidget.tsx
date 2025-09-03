export type SponsoredActivitiesWidgetProps = {
  className?: string;
  content?: React.ReactNode;
  title?: string;
  ariaLabel?: string;
};

export default function SponsoredActivitiesWidget({
  className = "",
  content,
  title,
  ariaLabel,
}: SponsoredActivitiesWidgetProps) {
  return (
    <div
      className={`relative w-full h-[200px] md:h-[240px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/10 p-4 ${className}`}
      role={ariaLabel ? "button" : undefined}
      aria-label={ariaLabel}
    >
      {/* Optional title badge */}
      {title && (
        <div className="absolute right-3 top-2 z-10 text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
          {title}
        </div>
      )}

      {/* Main content area */}
      <div className="w-full h-full overflow-hidden">
        {content ?? (
          <div className="text-white/80 text-xs leading-snug">
            <div className="font-semibold text-white text-sm mb-1">Attività Sponsorizzate</div>
            <p className="opacity-80">
              Qui verrà visualizzata un&apos;anteprima delle attività sponsorizzate di Civitanova.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}