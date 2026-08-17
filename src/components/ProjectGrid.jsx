import { FaGithub } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

export function ProjectGrid() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const sectionCopy = content.projectsSection[lang];
  const projectsList = content.projectsSection.list;

  return (
    <section 
      id="projects" 
      className="py-12 px-4 transition-colors duration-300 bg-[var(--bg-projects)] text-[var(--text-projects)]"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 text-[var(--text-projects-title)]">{sectionCopy.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((proj, idx) => {
            const localized = proj[lang] || proj["en"] || proj;
            return (
              <div 
                key={idx} 
                className="rounded-xl shadow-md p-6 hover:shadow-lg transition flex flex-col justify-between border bg-[var(--bg-card)] border-[var(--border-card)]"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-projects-title)]">{localized.title}</h3>
                  <p className={`text-xs font-semibold mb-3 ${isDark ? "text-blue-400" : "text-blue-600"}`}>{proj.tech}</p>
                  <p className="text-sm mb-4 text-[var(--text-projects)] opacity-90">{localized.desc}</p>
                </div>
                {proj.link && (
                  <div className="mt-auto pt-2 border-t flex justify-end border-[var(--border-card)]">
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center text-xs font-semibold transition gap-1.5 ${
                        isDark 
                          ? "text-slate-355 hover:text-blue-400" 
                          : "text-slate-700 hover:text-blue-600"
                      }`}
                    >
                      <FaGithub size={16} />
                      <span>{sectionCopy.viewOnGithub}</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}