import { useEffect, useRef, useState } from "react";
import { Cpu, Globe, Award, Terminal, GraduationCap, Users, Bot, Code2, MapPin, Camera } from "lucide-react";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

const PILLAR_ICONS = [Cpu, Globe, Award];
const HIGHLIGHT_ICONS = [GraduationCap, Users, Bot, Code2, MapPin, Camera];

export function Presentation() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const copy = content.presentation[lang];
  const galleryLinkRef = useRef(null);
  const [showGalleryCue, setShowGalleryCue] = useState(false);

  useEffect(() => {
    const el = galleryLinkRef.current;
    if (!el) return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let observer;

    const syncObserver = () => {
      observer?.disconnect();
      if (!mobileQuery.matches) {
        setShowGalleryCue(false);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setShowGalleryCue(entry.isIntersecting);
        },
        {
          threshold: 0,
          rootMargin: "0px 0px -10% 0px",
        }
      );
      observer.observe(el);
    };

    syncObserver();
    mobileQuery.addEventListener("change", syncObserver);

    return () => {
      observer?.disconnect();
      mobileQuery.removeEventListener("change", syncObserver);
    };
  }, []);

  return (
    <section 
      id="presentation" 
      className="py-16 md:py-24 px-4 transition-colors duration-300 bg-[var(--bg-projects)] text-[var(--text-projects)]"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
         
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-projects-title)] font-heading leading-tight">
            {copy.heading}
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-projects)] leading-relaxed">
            {copy.tagline}
          </p>
        </div>

        {/* Narrative & Quick Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Story Card */}
          <div className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col justify-center space-y-4 ${
            isDark 
              ? "bg-slate-900/70 border-slate-800" 
              : "bg-[var(--bg-card)] border-[var(--border-card)]"
          }`}>
            <div className="flex items-center gap-2 text-accent mb-1">
              <Terminal size={20} />
              <span className="font-mono text-xs font-bold tracking-widest uppercase">System.Profile</span>
            </div>

            {copy.story.map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base leading-relaxed text-[var(--text-projects)]">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Quick Highlight Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            {copy.highlights.map((item, idx) => {
              const HighlightIcon = HIGHLIGHT_ICONS[idx] || Code2;
              const cardClass = `p-4 sm:p-4.5 rounded-xl border flex items-center justify-between gap-4 ${
                isDark
                  ? "bg-slate-900/50 border-slate-800/80"
                  : "bg-[var(--bg-card)] border-[var(--border-card)]"
              }`;
              const labelBlock = (
                <div className="space-y-0.5 min-w-0">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
                    isDark ? "text-slate-400" : "text-[var(--text-muted)]"
                  }`}>
                    {item.label}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-projects-title)] font-heading truncate">
                    {item.value}
                  </h3>
                </div>
              );

              if (item.href) {
                return (
                  <a
                    key={idx}
                    ref={galleryLinkRef}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${cardClass} highlight-link-card`}
                  >
                    {labelBlock}
                    <div className={`highlight-icon-wrap ${showGalleryCue ? "is-cue-visible" : ""}`}>
                      <span className="gallery-cue-spark" aria-hidden="true" />
                      <span className="gallery-cue-spark" aria-hidden="true" />
                      <span className="gallery-cue-spark" aria-hidden="true" />
                      <span className={`gallery-cue ${showGalleryCue ? "is-visible" : ""}`}>
                        {copy.galleryCue}
                      </span>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 accent-chip">
                        <HighlightIcon size={18} />
                      </div>
                    </div>
                  </a>
                );
              }

              return (
                <div key={idx} className={cardClass}>
                  {labelBlock}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 accent-chip">
                    <HighlightIcon size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {copy.pillars.map((pillar, idx) => {
            const Icon = PILLAR_ICONS[idx] || Cpu;
            return (
              <div
                key={idx}
                className={`p-6 sm:p-7 rounded-2xl border shadow-sm flex flex-col ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-[var(--bg-card)] border-[var(--border-card)]"
                }`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 accent-chip">
                  <Icon size={24} />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-projects-title)] font-heading mb-2">
                  {pillar.title}
                </h3>

                <p className="text-sm leading-relaxed text-[var(--text-projects)] mt-auto">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}