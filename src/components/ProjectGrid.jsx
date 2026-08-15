const projects = [
  { title: "EcoTracker iOS", tech: "SwiftUI, CoreData", desc: "Gamified carbon footprint tracker developed during the Academy macro challenge." },
  { title: "SoundScape", tech: "AVFoundation, UIKit", desc: "Interactive ambient sound generator designed for focus and productivity." },
  { title: "Portfolio Web", tech: "React, Tailwind", desc: "Mobile-first responsive developer showcase deployed on Cloudflare Pages." }
];

export function ProjectGrid() {
  return (
    <section id="projects" className="bg-slate-100 py-12 px-4 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">Academy Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{proj.title}</h3>
              <p className="text-xs font-semibold text-blue-600 mb-3">{proj.tech}</p>
              <p className="text-slate-600 text-sm">{proj.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}