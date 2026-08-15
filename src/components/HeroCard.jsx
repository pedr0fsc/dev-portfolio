import { Code2, Smartphone, Layout, Database, GitBranch } from "lucide-react";

const skills = [
  { name: "Swift", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { name: "SwiftUI", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { name: "Xcode", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  { name: "UIKit", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  { name: "CoreData", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { name: "Git", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  { name: "React", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
];

export function HeroCard() {
  return (
<section id="hero" className="bg-slate-900 text-white pt-24 md:pt-28 pb-6 px-4">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        {/* Profile Avatar */}
        <img
          src="src\assets\profile.jpg"
          alt="Profile Avatar"
          className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-blue-500 shadow-xl object-cover shrink-0"
        />

        {/* Content & Pills */}
        <div>
          <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Computer Science Student
          </span>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3">
            Backend Developer & Eletronic Designer
          </h1>

          <p className="text-slate-300 mt-4 text-sm md:text-base leading-relaxed">
            Building intuitive applications and exploring modern platforms. Focused on accessible design and clean code architectures.
          </p>

          {/* Skill Pill Badges */}
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition hover:scale-105 ${skill.color}`}
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