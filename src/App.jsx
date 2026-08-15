import { Navbar } from "./components/Navbar";
import { HeroCard } from "./components/HeroCard";
import { ProjectGrid } from "./components/ProjectGrid";
import { WaveDivider } from "./components/WaveDivider";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-sans overflow-x-hidden">
      <Navbar />
      <HeroCard />
      <WaveDivider color="#f1f5f9" bgColor="#0f172a" flip={true} />
      <ProjectGrid />
      <WaveDivider color="#0f172a" bgColor="#f1f5f9" flip={true} />
      <Footer />
    </div>
  );
}