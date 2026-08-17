import { Navbar } from "./components/Navbar";
import { HeroCard } from "./components/HeroCard";
import { ProjectGrid } from "./components/ProjectGrid";
import { WaveDivider } from "./components/WaveDivider";
import { Footer } from "./components/Footer";
import { useApp } from "./context/AppContext";

export default function App() {
  const { theme } = useApp();
  
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--bg-app)]`}>
      <Navbar />
      <HeroCard />
      <WaveDivider color="var(--bg-projects)" bgColor="var(--bg-hero)" flip={true} />
      <ProjectGrid />
      {/* Added mb-[-2.5px] and relative positioning to prevent 1px sub-pixel rendering gaps at the footer boundary */}
      <WaveDivider color="var(--bg-footer)" bgColor="var(--bg-projects)" flip={true} className="mb-[-2.5px] relative z-10" />
      <Footer />
    </div>
  );
}