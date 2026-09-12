import { Navbar } from "./components/Navbar";
import { HeroCard } from "./components/HeroCard";
import { GitGraph } from "./components/GitGraph";
import { ProjectGrid } from "./components/ProjectGrid";
import { WaveDivider } from "./components/WaveDivider";
import { Footer } from "./components/Footer";
import { Presentation } from "./components/Presentation";
import { HallTree } from "./components/HallTree";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--bg-app)]">
      <Navbar />
      <HeroCard />
      <Presentation />
      <WaveDivider color="var(--bg-projects)" bgColor="var(--bg-hero)" flip={true} />
      <HallTree />
      <WaveDivider color="var(--bg-hero)" bgColor="var(--bg-projects)" flip={true} />
      <GitGraph />
      <WaveDivider color="var(--bg-projects)" bgColor="var(--bg-hero)" flip={true} />
      <ProjectGrid />
      <WaveDivider color="var(--bg-footer)" bgColor="var(--bg-projects)" flip={true} className="mb-[-2.5px] relative z-10" />
      <Footer />
    </div>
  );
}