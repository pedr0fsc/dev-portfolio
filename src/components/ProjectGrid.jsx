import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { ChevronDown, ChevronUp, ExternalLink, Play, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

function ProjectDialog({ project, lang, copy, onClose }) {
  const localized = project[lang] || project.en;
  const [activeImage, setActiveImage] = useState(project.media.cover);
  const gallery = [project.media.cover, ...(project.media.images || [])].filter(Boolean);

  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("project-dialog-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("project-dialog-open");
    };
  }, [onClose]);

  return (
    <div className="project-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby={`project-${project.id}-title`} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="project-dialog-close" onClick={onClose} aria-label={copy.closeProject}><X size={20} aria-hidden="true" /></button>
        <div className="project-dialog-media"><img src={activeImage} alt={project.media.alt[lang] || project.media.alt.en} /></div>
        <div className="project-dialog-content">
          <div className="project-dialog-heading">
            <div><p className="project-dialog-kicker">{copy.projectDetails}</p><h2 id={`project-${project.id}-title`}>{localized.title}</h2></div>
            {project.links.github && <a href={project.links.github} target="_blank" rel="noreferrer" className="project-dialog-link"><FaGithub size={17} aria-hidden="true" />{copy.viewOnGithub}</a>}
          </div>
          <div className="project-dialog-tech">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
          <p className="project-dialog-description">{localized.description}</p>
          {localized.highlights?.length > 0 && <div className="project-dialog-highlights"><h3>{copy.highlights}</h3><ul>{localized.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>}
          {gallery.length > 1 && <div className="project-gallery" aria-label={copy.projectImages}>{gallery.map((image, index) => <button type="button" key={image} className={activeImage === image ? "is-active" : ""} onClick={() => setActiveImage(image)} aria-label={`${copy.projectImage} ${index + 1}`}><img src={image} alt="" /></button>)}</div>}
          {project.media.video?.url && <div className="project-dialog-video"><video controls poster={project.media.video.poster || project.media.cover}><source src={project.media.video.url} type={project.media.video.type || "video/mp4"} />{copy.videoUnsupported}</video></div>}
          {project.links.demo && <a href={project.links.demo} target="_blank" rel="noreferrer" className="project-dialog-demo"><ExternalLink size={17} aria-hidden="true" />{copy.visitProject}</a>}
        </div>
      </section>
    </div>
  );
}

export function ProjectGrid() {
  const { lang, theme } = useApp();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const isDark = theme === "dark";
  const sectionCopy = content.projectsSection[lang];

  return (
    <section id="projects" className="py-12 px-4 transition-colors duration-300 bg-[var(--bg-projects)] text-[var(--text-projects)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 text-[var(--text-projects-title)]">{sectionCopy.title}</h2>
        <div className={`project-grid-wrapper ${showAllProjects ? "is-expanded" : "is-collapsed"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.projectsSection.list.map((project, index) => {
            const localized = project[lang] || project.en;
            const mobileVisibility = !showAllProjects && index === 5 ? "project-card-mobile-preview" : !showAllProjects && index > 5 ? "project-card-mobile-hidden" : "";
            return <article key={project.id} className={`project-card ${mobileVisibility} rounded-xl shadow-md hover:shadow-xl transition border bg-[var(--bg-card)] border-[var(--border-card)]`}>
              <button type="button" className="project-card-open" onClick={() => setSelectedProject(project)} aria-label={`${sectionCopy.openProject}: ${localized.title}`}>
                <div className="project-card-banner"><img src={project.media.cover} alt={project.media.alt[lang] || project.media.alt.en} loading="lazy" /></div>
                <div className="project-card-content"><h3 className="text-xl font-bold text-[var(--text-projects-title)]">{localized.title}</h3><p className={`text-xs font-semibold mt-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>{project.tech.join(" · ")}</p><p className="text-sm mt-3 text-[var(--text-projects)] opacity-90">{localized.summary}</p></div>
              </button>
              {project.links.github && <div className="px-5 pb-5"><a href={project.links.github} target="_blank" rel="noreferrer" className={`inline-flex items-center text-xs font-semibold transition gap-1.5 ${isDark ? "text-slate-300 hover:text-blue-400" : "text-slate-700 hover:text-blue-600"}`}><FaGithub size={16} aria-hidden="true" /><span>{sectionCopy.viewOnGithub}</span></a></div>}
            </article>;
          })}
          </div>
          {content.projectsSection.list.length > 5 && <button type="button" className="project-show-more" onClick={() => setShowAllProjects((isExpanded) => !isExpanded)} aria-expanded={showAllProjects}>
            {showAllProjects ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
            {showAllProjects ? sectionCopy.showLessProjects : sectionCopy.showMoreProjects}
          </button>}
        </div>
      </div>
      {selectedProject && <ProjectDialog project={selectedProject} lang={lang} copy={sectionCopy} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}
