export function WaveDivider({ color = "#f1f5f9", bgColor = "#0f172a", flip = false, className = "" }) {
  return (
    <div 
      className={`w-full overflow-hidden leading-none transition-colors duration-300 ${className}`} 
      style={{ backgroundColor: bgColor }}
    >
      <svg
        className="relative block w-full h-12 md:h-20 lg:h-24"
        style={{ transform: flip ? "rotate(180deg)" : "none" }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          className="transition-[fill] duration-300"
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          fill={color}
        ></path>
      </svg>
    </div>
  );
}