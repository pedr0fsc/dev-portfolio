import { Code2, Smartphone, Layout, Database, GitBranch } from "lucide-react";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

export function Presentation() {
  const { theme, lang } = useApp();
  const isDark = theme === "dark";
  const copy = content.presentation[lang];

  return (
    <section 
      id="presentation" 
      className="py-12 px-4 transition-colors duration-300 bg-[var(--bg-projects)] text-[var(--text-projects)]"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        <div>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-[var(--text-hero)]">
            {copy.text}
          </p>

        </div>
      </div>
    </section>
  );
}