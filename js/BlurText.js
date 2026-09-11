const { useEffect, useRef, useState } = React;

/**
 * Word-by-word blur-in. Enters once the element is 10% visible.
 */
const BlurText = ({
  text = "",
  className = "",
  delay = 100, // ms between words
  stepDuration = 0.35,
  as: Tag = "p",
}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const motion = (window.Motion || {}).motion;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  const from = { filter: "blur(10px)", opacity: 0, y: 50 };
  const keyframes = {
    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
    opacity: [0, 0.5, 1],
    y: [50, -5, 0],
  };

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em",
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={from}
          animate={inView ? keyframes : from}
          transition={{
            duration: stepDuration * 2,
            times: [0, 0.5, 1],
            ease: "easeOut",
            delay: (i * delay) / 1000,
          }}
          style={{ display: "inline-block", marginRight: "0.28em", willChange: "transform, filter, opacity" }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

window.BlurText = BlurText;
