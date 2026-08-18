import { Code2, Smartphone, Layout, Database, GitBranch } from "lucide-react";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

export function HeroCard() {
  const { theme, lang } = useApp();
  const isDark = theme === "dark";
  const copy = content.hero[lang];
  const skills = content.hero.skills;

  return (
    <section 
      id="hero" 
      className="pt-24 md:pt-28 pb-6 px-4 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)]"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        {/* Profile Avatar */}
        <img
          src="src/assets/profile.jpg"
          alt="Profile Avatar"
          className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-blue-550 shadow-xl object-cover shrink-0"
        />

        {/* Content & Pills */}
        <div>
                   
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 text-[var(--text-hero-title)]">
            {copy.role}
          </h1>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-[var(--text-hero)]">
            {copy.bio}
          </p>

          {/* Skill Pill Badges */}
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className={`text-xs font-medium px-3 py-1 rounded-full border ${
                  isDark
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    : "bg-blue-50/80 text-blue-600 border-blue-100"
                }`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}