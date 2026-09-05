import { useApp } from "../context/AppContext";
import content from "../data/content.json";
import profileImg from "../assets/profile.jpg";
import { WaveDivider } from "./WaveDivider";

export function HeroCard() {
  const { lang } = useApp();
  const copy = content.hero[lang];

  const bgImage =
    content.hero.backgroundImage === "/src/assets/hero.png" ||
    content.hero.backgroundImage === "hero.png" ||
    content.hero.backgroundImage === "@/assets/hero.png"
      ? heroImg
      : content.hero.backgroundImage;

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-between pt-20 md:pt-24 pb-0 px-0 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)] overflow-hidden"
    >
      {bgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bgImage}
            alt=""
            className="w-full h-full object-cover object-center scale-105"
          />
          <div
            className="absolute inset-0 transition-colors duration-300 backdrop-blur-[2px]"
            style={{ background: "var(--bg-hero-overlay)" }}
          />
        </div>
      )}

      <div className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 text-center md:text-left my-auto">
        <div className="relative shrink-0 group">
          <img
            src={profileImg}
            alt="Pedro Schwertner"
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full border-4 border-[var(--accent)] shadow-2xl object-cover ring-4 ring-[var(--accent-ring)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-accent mb-2 font-heading">
            {lang === "pt" ? "Olá, eu sou Pedro" : "Hello, I'm Pedro"}
          </p>

          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-hero-title)] leading-[1.08] font-heading"
          >
            {copy.role}
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl leading-relaxed text-[var(--text-hero)] font-normal opacity-90">
            {copy.bio}
          </p>
        </div>
      </div>

      <div className="relative z-10 -mb-[1px] leading-none w-full shrink-0">
        <WaveDivider color="var(--bg-projects)" bgColor="transparent" flip={true} />
      </div>
    </section>
  );
}
