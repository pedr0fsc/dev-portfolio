import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export function Footer() {
  const socials = [
    { href: "https://github.com/pedr0fsc", icon: FaGithub, label: "GitHub" },
    { href: "https://linkedin.com/in/pedrofsc", icon: FaLinkedin, label: "LinkedIn" },
    { href: "mailto:pedrodafonsecaschwertner@gmail.com", icon: FaEnvelope, label: "Email" },
  ];

  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-10 px-4 text-center mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        <h3 className="text-white font-semibold text-lg">Let's Connect</h3>
        
        {/* Social Icon Links */}
        <div className="flex space-x-6">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-slate-800 rounded-full text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition shadow-sm"
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500 pt-2">
          © {new Date().getFullYear()} Apple Developer Academy Profile. Built with React & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}