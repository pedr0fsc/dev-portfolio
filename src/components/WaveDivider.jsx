import { useId } from "react";

export function WaveDivider({
  color = "#f1f5f9",
  bgColor = "transparent",
  flip = false,
  className = "",
  style = {},
}) {
  const filterId = `wave-shadow-${useId().replace(/:/g, "")}`;

  return (
    <div
      className={`wave-divider w-full leading-none transition-colors duration-300 ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      <svg
        className="relative block w-full h-12 md:h-20 lg:h-24"
        style={{ transform: flip ? "rotate(180deg)" : "none" }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={filterId} x="-8%" y="-40%" width="116%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dy="5" result="offsetBlur" />
            <feFlood floodColor="#0f172a" floodOpacity="0.28" result="shadowColor" />
            <feComposite in="shadowColor" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          className="wave-divider-fill transition-[fill] duration-300"
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          fill={color}
          filter={`url(#${filterId})`}
        />
        <g className="wave-divider-crests" fill="#0f172a">
          <ellipse className="wave-crest-shadow" cx="180" cy="42" rx="54" ry="10" />
          <ellipse className="wave-crest-shadow" cx="493" cy="18" rx="70" ry="11" />
          <ellipse className="wave-crest-shadow" cx="823" cy="38" rx="62" ry="10" />
          <ellipse className="wave-crest-shadow" cx="1048" cy="82" rx="58" ry="9" />
        </g>
      </svg>
    </div>
  );
}
