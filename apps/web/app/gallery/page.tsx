import { PhotoGrid } from "../../components/PhotoGrid";
import { SectionHeading } from "../../components/SectionHeading";

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Gallery" title="Photo Gallery" description="Semua foto fotografi." />
      <PhotoGrid />
    </section>
  );
}
