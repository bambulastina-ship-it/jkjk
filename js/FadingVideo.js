const { useEffect, useRef } = React;

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55; // seconds before the end where the fade-out starts

/**
 * Looping background video with a hand-rolled rAF crossfade.
 * No CSS transitions are used — every opacity step is driven per frame so a new
 * fade can resume from wherever the previous one was interrupted.
 */
const FadingVideo = ({ src, className = "", style = {}, poster }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const fadingOutRef = useRef(false);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeTo = (target, duration = FADE_MS) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const start = performance.now();
      const from = parseFloat(video.style.opacity || "0");
      const delta = target - from;

      if (duration <= 0 || delta === 0) {
        video.style.opacity = String(target);
        return;
      }

      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        video.style.opacity = String(from + delta * t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    const handleLoadedData = () => {
      video.style.opacity = "0";
      const playback = video.play();
      if (playback && typeof playback.catch === "function") playback.catch(() => {});
      fadeTo(1, FADE_MS);
    };

    const handleTimeUpdate = () => {
      const { duration, currentTime } = video;
      if (fadingOutRef.current) return;
      const remaining = duration - currentTime;
      if (remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      resetTimerRef.current = setTimeout(() => {
        video.currentTime = 0;
        const playback = video.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.style.opacity = "0";
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // The video may already be buffered by the time the listeners attach.
    if (video.readyState >= 2) handleLoadedData();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
};

window.FadingVideo = FadingVideo;
