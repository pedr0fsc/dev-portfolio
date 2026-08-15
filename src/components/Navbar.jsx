import { useState } from "react";
import { Menu, X, Code2 } from "lucide-react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    { href: "https://github.com/pedr0fsc", icon: FaGithub, label: "GitHub" },
    { href: "https://linkedin.com/in/pedrofsc", icon: FaLinkedin, label: "LinkedIn" },
    { href: "mailto:pedrodafonsecaschwertner@gmail.com", icon: FaEnvelope, label: "Email" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center space-x-2 font-bold text-lg">
          <Code2 className="text-blue-400" />
          <span>pedr0fsc</span>
        </div>

        {/* Desktop Links & Socials */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#hero" className="hover:text-blue-400 transition">About</a>
          <a href="#projects" className="hover:text-blue-400 transition">Projects</a>
          <a href="#contact" className="hover:text-blue-400 transition">Contact</a>
          
          <div className="h-4 w-px bg-slate-700 mx-2" />

          <div className="flex items-center space-x-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-slate-400 hover:text-blue-400 transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-3 border-t border-slate-800">
          <a href="#hero" className="block text-slate-300 hover:text-blue-400" onClick={() => setIsOpen(false)}>About</a>
          <a href="#projects" className="block text-slate-300 hover:text-blue-400" onClick={() => setIsOpen(false)}>Projects</a>
          <a href="#contact" className="block text-slate-300 hover:text-blue-400" onClick={() => setIsOpen(false)}>Contact</a>
          
          <div className="flex space-x-5 pt-2 border-t border-slate-700/60">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-slate-400 hover:text-blue-400 transition"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}