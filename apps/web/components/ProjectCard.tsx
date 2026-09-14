import Image from "next/image";
import type { Project } from "../lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {project.thumbnail ? (
        <Image src={project.thumbnail} alt={project.title} width={800} height={450} className="h-44 w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{project.title}</h3>
        <p className="mt-1 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span key={tech} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-3 text-sm font-semibold">
          {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:underline">Repo →</a> : null}
          {project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">Live Demo →</a> : null}
        </div>
      </div>
    </article>
  );
}
