const { useState } = React;

/* Drop the portrait in at any of these paths — the first one that loads wins. */
const PORTRAIT_SOURCES = [
  "assets/eliza-reed.png",
  "assets/eliza-reed.jpg",
  "assets/eliza-reed.jpeg",
  "assets/eliza-reed.webp",
];

/**
 * Lead advisor profile card. The portrait is masked at its edges so it dissolves
 * into the black ground rather than sitting in a visible crop box.
 */
const ProfileCard = () => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const exhausted = sourceIndex >= PORTRAIT_SOURCES.length;

  return (
    <div className="liquid-glass rounded-[1.5rem] px-6 py-5 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
        {/* Portrait */}
        <div className="order-1 sm:order-2 shrink-0 relative w-full h-[190px] sm:w-[280px] sm:h-[180px]">
          {exhausted ? (
            <div className="w-full h-full flex items-center justify-center profile-blend">
              <span className="font-heading italic text-white/70 text-5xl leading-none select-none">
                ER
              </span>
            </div>
          ) : (
            <img
              src={PORTRAIT_SOURCES[sourceIndex]}
              onError={() => setSourceIndex((i) => i + 1)}
              alt="Eliza Reed, Senior Luxury Property Advisor"
              className="w-full h-full object-cover object-center profile-blend"
            />
          )}
        </div>

        {/* Copy */}
        <div className="order-2 sm:order-1 flex-1 text-center sm:text-left">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/70 font-body font-medium">
            Lead Advisor
          </p>
          <h3 className="mt-2 font-heading italic text-white text-3xl md:text-4xl leading-none tracking-[-1px]">
            Eliza Reed
          </h3>
          <p className="mt-2 text-sm text-white font-body font-light leading-snug">
            Senior Luxury Property Advisor
            <span className="text-white/60"> | </span>
            Aura Advisory &amp; Estates
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {["Coastal Estates", "Aspen Portfolio", "Private Clients"].map((tag) => (
              <span
                key={tag}
                className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.ProfileCard = ProfileCard;
