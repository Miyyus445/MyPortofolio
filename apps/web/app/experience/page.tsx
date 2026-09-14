import { ExperienceTimeline } from "../../components/ExperienceTimeline";
import { SectionHeading } from "../../components/SectionHeading";

export default function ExperiencePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Career" title="Experience" description="Riwayat kerja dan kredensial." />
      <ExperienceTimeline />
    </section>
  );
}
