"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  setPhotoFeatured,
  uploadPhoto,
  resolveImageUrl,
} from "@/lib/api";
import type { Photo, CreatePhotoInput, UpdatePhotoInput } from "@/lib/types";

export default function AdminPhotosPage() {
  const { token } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePhotoInput>({
    title: "",
    description: "",
    descriptionId: "",
    imageUrl: "",
    category: "",
    isFeatured: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch {
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const resetForm = () => {
    setFormData({ title: "", description: "", descriptionId: "", imageUrl: "", category: "", isFeatured: false });
    setEditingId(null);
    setShowForm(false);
    setError("");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsDragging(false);
  };

  const handleFileSelect = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleEdit = (photo: Photo) => {
    setFormData({
      title: photo.title,
      description: photo.description || "",
      descriptionId: photo.descriptionId || "",
      imageUrl: photo.imageUrl,
      category: photo.category,
      isFeatured: photo.isFeatured,
    });
    setEditingId(photo.id);
    setSelectedFile(null);
    setPreviewUrl("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const urlValue = formData.imageUrl.trim();
    if (!selectedFile && !urlValue) {
      setError("Pilih file gambar lokal atau isi Image URL.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = urlValue;
      if (selectedFile) {
        const uploadResult = await uploadPhoto(selectedFile, token!);
        imageUrl = uploadResult.imageUrl;
      }
      const payload = {
        ...formData,
        imageUrl,
        description: formData.description?.trim() ? formData.description : null,
        descriptionId: formData.descriptionId?.trim() ? formData.descriptionId : null,
      };
      if (editingId) {
        await updatePhoto(editingId, payload, token!);
      } else {
        await createPhoto(payload, token!);
      }
      resetForm();
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    setError("");
    try {
      await deletePhoto(id, token!);
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleToggleFeatured = async (photo: Photo) => {
    setError("");
    try {
      await setPhotoFeatured(photo.id, !photo.isFeatured, token!);
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Photos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Photo
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            {editingId ? "Edit Photo" : "Add Photo"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description ?? ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="descriptionId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Description (ID / Opsional)
              </label>
              <textarea
                id="descriptionId"
                value={formData.descriptionId ?? ""}
                onChange={(e) => setFormData({ ...formData, descriptionId: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Terjemahan manual ke Bahasa Indonesia (kosongkan untuk auto-translate)</p>
            </div>
            <div>
              <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Gambar * <span className="font-normal text-zinc-500">(isi salah satu: file lokal atau URL)</span>
              </span>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-300 dark:border-zinc-600"
                  }`}
              >
                <label htmlFor="imageFile" className="block text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Seret & letakkan file gambar di sini, atau{" "}
                  <span className="text-blue-600 dark:text-blue-400 underline">pilih file</span>
                </label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="mt-2 block w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-300 dark:file:bg-zinc-700 dark:hover:file:bg-zinc-600"
                />
                {selectedFile && (
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    Dipilih: {selectedFile.name}
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                      className="ml-2 text-red-600 dark:text-red-400 underline"
                    >
                      Hapus
                    </button>
                  </p>
                )}
                {(previewUrl || (!selectedFile && formData.imageUrl)) && (
                  <img
                    src={previewUrl || resolveImageUrl(formData.imageUrl)}
                    alt="Pratinjau"
                    className="mx-auto mt-3 max-h-40 rounded-lg object-contain"
                  />
                )}
              </div>
              <div className="my-2 text-center text-xs text-zinc-500 dark:text-zinc-400">— atau —</div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Category *
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isFeatured" className="text-sm text-zinc-700 dark:text-zinc-300">
                Featured
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Featured</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {photos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  No photos yet. Click "Add Photo" to create one.
                </td>
              </tr>
            ) : (
              photos.map((photo) => (
                <tr key={photo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <img
                      src={resolveImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      className="w-16 h-10 object-cover rounded"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">{photo.title}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{photo.category}</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={photo.isFeatured}
                        onChange={() => handleToggleFeatured(photo)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}