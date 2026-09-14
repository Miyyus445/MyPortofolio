import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { Hero } from "../components/Hero";
import { PhotoGrid } from "../components/PhotoGrid";
import { ProjectsSection } from "../components/ProjectsSection";
import { SectionHeading } from "../components/SectionHeading";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Photography" title="Featured Photos" description="Koleksi foto pilihan." />
        <PhotoGrid featuredOnly limit={6} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Engineering" title="Latest Projects" description="Project IT terbaru." />
        <ProjectsSection limit={3} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Background" title="Experience" description="Riwayat kerja dan kredensial." />
        <ExperienceTimeline />
      </section>
    </>
  );
}
