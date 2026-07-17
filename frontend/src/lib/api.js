const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Terjadi kesalahan, coba lagi.");
  }
  return data;
}

export const api = {
  // Auth
  me: () => request("/auth/me"),
  loginGoogle: (credential) =>
    request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  requestOtp: (email) =>
    request("/auth/otp/request", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (email, code) =>
    request("/auth/otp/verify", { method: "POST", body: JSON.stringify({ email, code }) }),
  logout: () => request("/auth/logout", { method: "POST" }),

  // Blog
  getPosts: () => request("/blog"),
  getPost: (slug) => request(`/blog/${slug}`),
  createPost: (payload) => request("/blog", { method: "POST", body: JSON.stringify(payload) }),
  updatePost: (slug, payload) =>
    request(`/blog/${slug}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePost: (slug) => request(`/blog/${slug}`, { method: "DELETE" }),

  // Gallery
  getPhotos: () => request("/gallery"),
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${BASE}/gallery`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload gagal.");
    return data;
  },
  deletePhoto: (filename) => request(`/gallery/${filename}`, { method: "DELETE" }),
};
