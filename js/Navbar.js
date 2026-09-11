const NAV_LINKS = [
  "Residences",
  "Off-Market",
  "Estates",
  "Advisory",
  "Private Placement",
];

const Navbar = () => {
  const { motion } = window.Motion;
  const ArrowUpRight = window.ArrowUpRight;

  return (
    <motion.nav
      initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16"
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a
          href="#top"
          aria-label="Aura Advisory &amp; Estates"
          className="liquid-glass rounded-full flex items-center justify-center shrink-0"
          style={{ width: 48, height: 48 }}
        >
          <span className="font-heading italic text-white text-2xl leading-none lowercase select-none">
            a
          </span>
        </a>

        {/* Center pill — desktop only */}
        <div className="hidden lg:flex liquid-glass rounded-full items-center px-1.5 py-1.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#top"
              className="px-3 py-2 text-sm font-medium text-white/90 font-body whitespace-nowrap"
            >
              {link}
            </a>
          ))}
          <a
            href="#top"
            className="ml-1.5 flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium font-body whitespace-nowrap"
          >
            Book Consultation
            <ArrowUpRight size={16} strokeWidth={2} />
          </a>
        </div>

        {/* Spacer to balance the logo */}
        <div className="shrink-0 invisible" style={{ width: 48, height: 48 }} aria-hidden="true" />
      </div>
    </motion.nav>
  );
};

window.Navbar = Navbar;
