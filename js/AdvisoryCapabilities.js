const ADVISORY_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4";

const CAPABILITY_CARDS = [
  {
    icon: "KeyIcon",
    tags: ["Strict Confidentiality", "Off-Market Access", "Family Offices", "Global Sourcing"],
    title: "Private Placements",
    body:
      "Unlocking confidential off-market transactions for high-net-worth clients, avoiding public listings while ensuring absolute privacy.",
  },
  {
    icon: "MovieIcon",
    tags: ["Cinematic 8K Tours", "Staging Curation", "Global Press", "Drone Mapping"],
    title: "Cinematic Marketing",
    body:
      "Transforming estates into cinematic masterworks. We leverage high-end film production and editorial placement to attract global buyers.",
  },
  {
    icon: "ShieldIcon",
    tags: ["Tax Structuring", "Asset Valuation", "Estate Planning", "Portfolio Yield"],
    title: "Wealth Advisory",
    body:
      "Comprehensive estate intelligence and strategic advisory, ensuring luxury acquisitions double as high-yield legacy wealth assets.",
  },
];

const AdvisoryCapabilities = () => {
  const { motion } = window.Motion;
  const FadingVideo = window.FadingVideo;

  const rise = (delay) => ({
    initial: { filter: "blur(10px)", opacity: 0, y: 20 },
    whileInView: { filter: "blur(0px)", opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.8, ease: "easeOut", delay },
  });

  return (
    <section id="advisory" className="relative w-full min-h-screen bg-black overflow-hidden">
      <FadingVideo src={ADVISORY_VIDEO} className="absolute inset-0 w-full h-full object-cover z-0" />

      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="mb-auto">
          <motion.p {...rise(0)} className="text-sm font-body text-white/80 mb-6">
            // Advisory Capabilities
          </motion.p>
          <motion.h2
            {...rise(0.15)}
            className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
          >
            Real Estate <br /> refined.
          </motion.h2>
        </div>

        {/* Capability cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {CAPABILITY_CARDS.map(({ icon, tags, title, body }, i) => {
            const Icon = window[icon];
            return (
              <motion.article
                key={title}
                {...rise(0.3 + i * 0.12)}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="liquid-glass rounded-[0.75rem] flex items-center justify-center shrink-0 text-white"
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-10">
                  <h3 className="font-heading italic text-white text-3xl md:text-4xl leading-none tracking-[-1px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm text-white/90 font-body font-light max-w-[32ch] leading-snug">
                    {body}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

window.AdvisoryCapabilities = AdvisoryCapabilities;
