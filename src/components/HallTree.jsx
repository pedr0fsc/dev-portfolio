import { useApp } from "../context/AppContext";
import hallData from "../data/hall.json";

const assetFiles = import.meta.glob("../assets/*.{webp,jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

function resolveAssetUrl(value) {
  if (!value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  const match = Object.entries(assetFiles).find(([path]) => path.endsWith(`/${value}`));
  return match?.[1] || value;
}

function branchSide(branch, index) {
  if (branch.side === "left" || branch.side === "right") return branch.side;
  return index % 2 === 0 ? "left" : "right";
}

function buildWave(count) {
  const mid = 100;
  const amp = 10;
  const points = [{ x: mid, y: 0 }];

  for (let i = 0; i < count; i++) {
    points.push({
      x: mid + (i % 2 === 0 ? -amp : amp),
      y: ((i + 0.5) / Math.max(count, 1)) * 100,
    });
  }

  points.push({ x: mid, y: 100 });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const dy = next.y - prev.y;
    d += ` C ${prev.x} ${prev.y + dy * 0.48}, ${next.x} ${next.y - dy * 0.48}, ${next.x} ${next.y}`;
  }

  return { d, knots: points.slice(1, -1) };
}

export function HallTree() {
  const { lang } = useApp();
  const copy = hallData[lang] || hallData.en;
  const branches = hallData.branches || [];
  const wave = buildWave(branches.length);

  return (
    <section
      id="hall"
      className="hall-section py-16 md:py-24 px-4 transition-colors duration-300 bg-[var(--bg-projects)] text-[var(--text-projects)]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-projects-title)] font-heading leading-tight">
            {copy.title}
          </h2>
          {copy.tagline && (
            <p className="text-base sm:text-lg text-[var(--text-projects)] leading-relaxed">
              {copy.tagline}
            </p>
          )}
        </div>

        <div className="hall-tree">
          <svg
            className="hall-wave"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="hall-wave-shadow" d={wave.d} />
            <path className="hall-wave-stroke" d={wave.d} />
            {wave.knots.map((knot, index) => (
              <circle
                key={`knot-${index}`}
                className="hall-wave-knot"
                cx={knot.x}
                cy={knot.y}
                r="1.8"
              />
            ))}
          </svg>

          {branches.map((branch, index) => {
            const side = branchSide(branch, index);
            const localized = branch[lang] || branch.en;
            const imageSrc = resolveAssetUrl(branch.image);
            const alt = branch.alt?.[lang] || branch.alt?.en || localized.title;

            return (
              <article key={branch.id || index} className={`hall-row is-${side}`}>
                <div className="hall-leaf">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={alt}
                      className="hall-leaf-image"
                    />
                  )}
                  <div className="hall-leaf-copy">
                    <h3>{localized.title}</h3>
                    <p>{localized.text}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
