import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { SiVsco } from "react-icons/si";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

export function Footer() {
  const { theme, lang } = useApp();
  const isDark = theme === "dark";
  const copy = content.footer[lang];

  const socials = [
    { href: "https://github.com/pedr0fsc", icon: FaGithub, label: "GitHub" },
    { href: "https://linkedin.com/in/pedrofsc", icon: FaLinkedin, label: "LinkedIn" },
    { href: "https://vsco.co/Pedr0fsc/gallery", icon: SiVsco, label: "VSCO" },
    { href: "mailto:pedrodafonsecaschwertner@gmail.com", icon: FaEnvelope, label: "Email" },
  ];

  return (
    <footer 
      id="contact" 
      className="py-10 px-4 text-center mt-auto border-t transition-colors duration-300 bg-[var(--bg-footer)] border-[var(--border-footer)] text-[var(--text-footer)]"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        <h3 className="font-semibold text-lg text-[var(--text-footer-title)]">{copy.letsConnect}</h3>
        
        {/* Social Icon Links */}
        <div className="flex space-x-6">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
                  className={`p-3 rounded-full transition shadow-sm hover-accent ${
                isDark 
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer-links-divider" aria-hidden="true" />

      <p className="footer-ai-disclaimer">
        <span className="footer-ai-disclaimer-label">{copy.aiDisclaimerLabel}</span>
        {copy.aiDisclaimer}
      </p>

      <p className="text-xs pt-4 text-[var(--text-footer)] opacity-75">
        © {new Date().getFullYear()} {copy.footerCredits}
      </p>
    </footer>
  );
}