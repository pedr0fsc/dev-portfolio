import { useState, useRef, useEffect } from "react";
import { Menu, X, Settings, Sun, Moon } from "lucide-react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { SiVsco } from "react-icons/si";
import { useApp } from "../context/AppContext";
import content from "../data/content.json";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme, lang, changeLanguage } = useApp();
  const settingsRef = useRef(null);
  const isDark = theme === "dark";
  
  const copy = content.navbar[lang];

  // Show the bar after the first scroll — still in the hero, before the main title is covered
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const socialLinks = [
    { href: "https://github.com/pedr0fsc", icon: FaGithub, label: "GitHub" },
    { href: "https://linkedin.com/in/pedrofsc", icon: FaLinkedin, label: "LinkedIn" },
    { href: "https://vsco.co/Pedr0fsc/gallery", icon: SiVsco, label: "VSCO" },
    { href: "mailto:pedrodafonsecaschwertner@gmail.com", icon: FaEnvelope, label: "Email" },
  ];

  return (
    <nav
      className={`site-navbar fixed top-0 left-0 right-0 z-50 w-full pointer-events-auto border-b ${
        isScrolled ? "is-scrolled" : "bg-transparent border-transparent"
      }`}
    >
      <div className="navbar-inner max-w-6xl mx-auto px-4 py-3 flex items-center">
        {/* Brand */}
        <div className="navbar-brand flex shrink-0 items-center space-x-1.5 font-bold text-lg font-heading">
          <a href="#hero" className="flex items-center space-x-1.5">
            <span className="text-accent">&lt;</span>
            <span className={isDark ? "text-white font-extrabold" : "text-slate-900 font-extrabold"}>pedr0fsc</span>
            <span className="text-accent">/&gt;</span>
          </a>
        </div>

        {/* Desktop Links, Socials & Config */}
        <div className="hidden md:ml-auto md:flex items-center gap-6">
          <a
            href="#presentation"
            className={`transition font-semibold text-sm hover-accent ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {copy.about}
          </a>
          <a
            href="#journey"
            className={`transition font-semibold text-sm hover-accent ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {copy.journey}
          </a>
          <a
            href="#projects"
            className={`transition font-semibold text-sm hover-accent ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {copy.projects}
          </a>
          <a
            href="#contact"
            className={`transition font-semibold text-sm hover-accent ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {copy.contact}
          </a>

          <div className="navbar-tools">
            <span className="navbar-vdiv" aria-hidden="true" />
            <div className="navbar-socials">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="navbar-icon"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <span className="navbar-vdiv" aria-hidden="true" />
            <div className="navbar-settings-slot relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`transition rounded-md hover-accent ${
                  isDark ? "text-slate-300 hover:bg-slate-800/40" : "text-slate-600 hover:bg-slate-200/50"
                }`}
                aria-label="Settings"
              >
                <Settings size={18} className={`${isSettingsOpen ? "rotate-45" : ""} transition-transform duration-300`} />
              </button>

            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-36 border rounded-xl shadow-2xl p-2.5 flex flex-col gap-2 backdrop-blur-md ${
                isDark 
                  ? "bg-slate-900/95 border-slate-800 text-white" 
                  : "bg-white/95 border-slate-200 text-slate-800"
              }`}>
                {/* Theme selection row */}
                <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{lang === "pt" ? "Tema" : "Theme"}</span>
                  <button
                    onClick={toggleTheme}
                    className="p-1 rounded transition text-accent hover:opacity-80"
                  >
                    {isDark ? <Moon size={14} /> : <Sun size={14} />}
                  </button>
                </div>
                {/* Language selection row */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{lang === "pt" ? "Idioma" : "Lang"}</span>
                  <div className={`flex p-0.5 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                        lang === "en" 
                          ? "bg-accent" 
                          : isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => changeLanguage("pt")}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                        lang === "pt" 
                          ? "bg-accent" 
                          : isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      PT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`navbar-menu-toggle ml-auto shrink-0 md:hidden transition ${
            isDark ? "text-slate-200 hover:text-white" : "text-slate-700 hover:text-slate-900"
          }`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden px-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[28rem] opacity-100 pb-4" : "max-h-0 opacity-0 pointer-events-none pb-0"
        }`}
      >
        <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md space-y-4 ${
          isDark
            ? "bg-slate-900/95 border-slate-800"
            : "bg-white/95 border-slate-200"
        }`}>
          <div className="space-y-3">
            <a href="#presentation" className={`block font-semibold hover-accent ${isDark ? "text-slate-300" : "text-slate-700"}`} onClick={() => setIsOpen(false)}>{copy.about}</a>
            <a href="#journey" className={`block font-semibold hover-accent ${isDark ? "text-slate-300" : "text-slate-700"}`} onClick={() => setIsOpen(false)}>{copy.journey}</a>
            <a href="#projects" className={`block font-semibold hover-accent ${isDark ? "text-slate-300" : "text-slate-700"}`} onClick={() => setIsOpen(false)}>{copy.projects}</a>
            <a href="#contact" className={`block font-semibold hover-accent ${isDark ? "text-slate-300" : "text-slate-700"}`} onClick={() => setIsOpen(false)}>{copy.contact}</a>
          </div>
          
          <div className={`flex justify-between items-center pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            {/* Social Links on mobile */}
            <div className="flex space-x-5">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`transition hover-accent ${isDark ? "text-slate-300" : "text-slate-600"}`}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>

            {/* Merged Theme & Language Config for Mobile */}
            <div className={`flex items-center space-x-3 p-1 rounded-lg border ${
              isDark 
                ? "bg-slate-950 border-slate-800" 
                : "bg-slate-50 border-slate-200"
            }`}>
              {/* Language Switch */}
              <div className={`flex p-0.5 rounded ${isDark ? "bg-slate-900" : "bg-slate-200/50"}`}>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    lang === "en" 
                      ? "bg-accent" 
                      : isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("pt")}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    lang === "pt" 
                      ? "bg-accent" 
                      : isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  PT
                </button>
              </div>

              <div className={`w-px h-4 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-1 rounded transition text-accent ${
                  isDark 
                    ? "hover:bg-slate-900" 
                    : "hover:bg-slate-100"
                }`}
                aria-label="Toggle Theme"
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
