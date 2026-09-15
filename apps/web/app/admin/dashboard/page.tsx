"use client";

import { useEffect, useState } from "react";
import { fetchPhotos, fetchProjects, fetchExperience } from "@/lib/api";
import type { Photo, Project, ExperienceItem } from "@/lib/types";

interface Stats {
  photos: number;
  projects: number;
  experience: number;
  featuredPhotos: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    photos: 0,
    projects: 0,
    experience: 0,
    featuredPhotos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPhotos(),
      fetchProjects(),
      fetchExperience(),
    ]).then(([photos, projects, experience]) => {
      setStats({
        photos: photos.length,
        projects: projects.length,
        experience: experience.length,
        featuredPhotos: photos.filter((p) => p.isFeatured).length,
      });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Total Photos", value: stats.photos, href: "/admin/photos" },
    { label: "Featured Photos", value: stats.featuredPhotos, href: "/admin/photos" },
    { label: "Projects", value: stats.projects, href: "/admin/projects" },
    { label: "Experience", value: stats.experience, href: "/admin/experience" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-label="Loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
          </a>
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/photos" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Add Photo
          </a>
          <a href="/admin/projects" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            Add Project
          </a>
          <a href="/admin/experience" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
            Add Experience
          </a>
        </div>
      </div>
    </div>
  );
}