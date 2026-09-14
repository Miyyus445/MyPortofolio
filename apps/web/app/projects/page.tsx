import { ProjectsSection } from "../../components/ProjectsSection";
import { SectionHeading } from "../../components/SectionHeading";

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Work" title="IT Projects" description="Daftar project beserta tech stack." />
      <ProjectsSection />
    </section>
  );
}
