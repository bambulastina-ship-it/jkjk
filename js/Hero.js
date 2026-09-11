const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";

const PARTNERS = [
  "Sotheby's",
  "Christie's",
  "Architectural Digest",
  "Knight Frank",
  "Residence",
];

const STATS = [
  { icon: "KeyIcon", value: "$1.8B+", label: "Closed Off-Market Volume" },
  { icon: "GlobeIcon", value: "98.4%", label: "Client Retainage Rate" },
];

const Hero = () => {
  const { motion } = window.Motion;
  const { FadingVideo, BlurText, Navbar, ProfileCard, ArrowUpRight, Play } = window;

  const rise = (delay) => ({
    initial: { filter: "blur(10px)", opacity: 0, y: 20 },
    animate: { filter: "blur(0px)", opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut", delay },
  });

  return (
    <section id="top" className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Background video — oversized and top-aligned, no overlay. */}
      <FadingVideo
        src={HERO_VIDEO}
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center text-center pt-24 px-4">
          {/* Badge */}
          <motion.div
            {...rise(0.4)}
            className="liquid-glass rounded-full flex items-center gap-3 p-1"
          >
            <span className="rounded-full bg-white text-black px-3 py-1 text-xs font-semibold font-body">
              Exclusive
            </span>
            <span className="text-sm text-white/90 font-body pr-3">
              Private Portfolio Release: Coastal &amp; Aspen Estates 2026
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mt-6">
            <BlurText
              text="Architectural Masterpieces Designed for Legacy"
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-3xl tracking-[-4px]"
            />
          </div>

          {/* Subheading */}
          <motion.p
            {...rise(0.8)}
            className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight"
          >
            Curating premier luxury estates, trophy properties, and off-market architectural icons
            globally. Bespoke representation for discerning buyers and private family offices.
          </motion.p>

          {/* CTAs */}
          <motion.div {...rise(1.1)} className="flex items-center gap-6 mt-6">
            <a
              href="#advisory"
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white font-body flex items-center gap-2"
            >
              Explore Portfolio
              <ArrowUpRight size={16} strokeWidth={2} />
            </a>
            <a
              href="#advisory"
              className="text-sm font-medium text-white font-body flex items-center gap-2"
            >
              Private Tour Film
              <Play size={14} />
            </a>
          </motion.div>

          {/* Lead advisor profile card */}
          <motion.div {...rise(1.2)} className="mt-8 max-w-2xl mx-auto w-full">
            <ProfileCard />
          </motion.div>

          {/* Stats */}
          <motion.div {...rise(1.3)} className="flex items-stretch gap-4 mt-8 flex-wrap justify-center">
            {STATS.map(({ icon, value, label }) => {
              const Icon = window[icon];
              return (
              <div
                key={value}
                className="liquid-glass rounded-[1.25rem] p-5 w-[220px] flex flex-col items-start text-left"
              >
                <span className="text-white">
                  <Icon size={28} />
                </span>
                <span className="mt-6 font-heading italic text-white text-4xl tracking-[-1px] leading-none">
                  {value}
                </span>
                <span className="text-xs text-white font-body font-light mt-2">{label}</span>
              </div>
              );
            })}
          </motion.div>

          {/* Partners */}
          <motion.div
            {...rise(1.4)}
            className="flex flex-col items-center gap-4 pb-8 mt-auto pt-12 w-full"
          >
            <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body text-center">
              Trusted advisory for global private clients &amp; architectural heritage estates
            </span>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
              {PARTNERS.map((name) => (
                <span
                  key={name}
                  className="font-heading italic text-white text-2xl md:text-3xl tracking-tight whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

window.Hero = Hero;
