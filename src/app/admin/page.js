"use client";
/* eslint-disable @next/next/no-img-element -- preview accepts user-selected internal image URLs. */

import { useCallback, useEffect, useState } from "react";

const blankArticle = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "Announcements",
  status: "Published",
  coverImage: "",
  imageAlt: "",
  eventDate: "",
  location: "",
  ctaLabel: "",
  ctaHref: "",
  author: "Gujarati Community IITG",
  featured: false,
  showOnHome: false,
  published: false,
  publishAt: "",
};
const categories = [
  "Announcements",
  "Events",
  "Opportunities",
  "Community stories",
  "Reports",
  "Newsletter",
];

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Draft";
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(blankArticle);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadArticles = useCallback(async () => {
    const response = await fetch("/api/admin/news", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setArticles(data.articles || []);
    else setMessage(data.error || "Unable to load news.");
  }, []);
  const loadSession = useCallback(async () => {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    const data = await response.json();
    setSession(data);
    if (data.authenticated) loadArticles();
  }, [loadArticles]);
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error);
      return;
    }
    setPassword("");
    await loadSession();
  };
  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ ...session, authenticated: false });
    setArticles([]);
    setMessage("");
  };
  const saveArticle = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch(
      editingId ? `/api/admin/news/${editingId}` : "/api/admin/news",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      },
    );
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to save this article.");
      return;
    }
    setMessage(article.published ? "News published." : "Draft saved.");
    setArticle(blankArticle);
    setEditingId(null);
    loadArticles();
  };
  const editArticle = (item) => {
    setArticle({ ...blankArticle, ...item });
    setEditingId(item.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const removeArticle = async (item) => {
    if (!window.confirm(`Archive “${item.title}”? It will be hidden from the public site but retained in the database.`))
      return;
    const response = await fetch(`/api/admin/news/${item.id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to archive this article.");
      return;
    }
    if (editingId === item.id) {
      setArticle(blankArticle);
      setEditingId(null);
    }
    setMessage("News item archived. Its full history remains in MongoDB.");
    loadArticles();
  };
  const update = (field, value) =>
    setArticle((current) => ({ ...current, [field]: value }));
  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const form = new FormData();
    form.append("image", file);
    const response = await fetch("/api/admin/news/upload", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setUploading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to upload this image.");
      return;
    }
    update("coverImage", data.src);
    setMessage(`Image uploaded: ${data.filename}`);
    event.target.value = "";
  };

  if (!session)
    return (
      <main className="admin-shell">
        <p>Loading admin workspace…</p>
      </main>
    );
  if (!session.configured)
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <p className="eyebrow">ADMIN SETUP</p>
          <h1>Publishing is almost ready.</h1>
          <p>
            Add <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> and{" "}
            <code>SESSION_SECRET</code> to <code>.env.local</code>. Generate the
            password hash locally with{" "}
            <code>node scripts/hash-admin-password.mjs</code>, then restart the
            server.
          </p>
        </section>
      </main>
    );
  if (!session.authenticated)
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <p className="eyebrow">GUJARATI COMMUNITY IITG</p>
          <h1>Admin sign in</h1>
          <p>Use the publishing account configured for this website.</p>
          <form onSubmit={signIn}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {message && <p className="admin-message error">{message}</p>}
            <button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div>
          <p className="eyebrow">ADMIN WORKSPACE</p>
          <h1>Community publishing</h1>
          <p>Signed in as {session.email}</p>
        </div>
        <div className="admin-top-actions">
          <a className="admin-secondary" href="/">View website</a>
          <button className="admin-secondary" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <section className="admin-dashboard" aria-label="Admin tools">
        <a className="admin-dashboard-card" href="#news-editor"><p className="eyebrow">PUBLISHING</p><h2>News</h2><p>Create, edit and publish community updates.</p><span>Manage news →</span></a>
        <a className="admin-dashboard-card" href="/admin/kurta-orders"><p className="eyebrow">GARBARAAS</p><h2>Kurta orders</h2><p>Search orders, open receipts and manage collection.</p><span>Manage orders →</span></a>
        <a className="admin-dashboard-card" href="/admin/koti-orders"><p className="eyebrow">GARBARAAS</p><h2>Koti orders</h2><p>Search orders, open receipts and manage collection.</p><span>Manage orders →</span></a>
        <a className="admin-dashboard-card" href="/admin/chanda"><p className="eyebrow">GARBARAAS · CONFIDENTIAL</p><h2>Chanda collection</h2><p>Approve POCs and view confidential donor-linked records.</p><span>Open Chanda desk →</span></a>
      </section>
      <nav className="admin-nav" aria-label="Admin sections">
        <a href="#news-editor">News</a>
        <a href="/admin/kurta-orders">Kurta orders</a>
        <a href="/admin/koti-orders">Koti orders</a>
        <a href="/admin/chanda">Chanda collection</a>
      </nav>
      <section className="admin-grid" id="news-editor">
        <form className="admin-editor" onSubmit={saveArticle}>
          <div className="admin-editor-heading">
            <div>
              <p className="eyebrow">{editingId ? "EDIT NEWS" : "ADD NEWS"}</p>
              <h2>
                {editingId ? "Refine this update" : "Write a community update"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                className="admin-text-button"
                onClick={() => {
                  setArticle(blankArticle);
                  setEditingId(null);
                }}
              >
                New article
              </button>
            )}
          </div>
          <label>
            Title
            <input
              value={article.title}
              onChange={(event) => update("title", event.target.value)}
              required
            />
          </label>
          <label>
            Short summary
            <textarea
              value={article.summary}
              onChange={(event) => update("summary", event.target.value)}
              rows="3"
              required
            />
          </label>
          <label>
            Full article{" "}
            <small>
              Optional for now; this will power the individual news page.
            </small>
            <textarea
              value={article.content}
              onChange={(event) => update("content", event.target.value)}
              rows="7"
            />
          </label>
          <div className="admin-two-column">
            <label>
              Category
              <select
                value={article.category}
                onChange={(event) => update("category", event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <input
                value={article.status}
                onChange={(event) => update("status", event.target.value)}
                placeholder="Upcoming, Published…"
              />
            </label>
          </div>
          <label>
            Upload cover image <small>JPG, PNG or WebP, up to 4 MB.</small>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadImage}
              disabled={uploading}
            />
          </label>
          <label>
            Cover image path or URL
            <input
              value={article.coverImage}
              onChange={(event) => update("coverImage", event.target.value)}
              placeholder="Upload an image above, or use /community/news/photo.jpg"
              required
            />
          </label>
          {article.coverImage && (
            <img
              className="admin-image-preview"
              src={article.coverImage}
              alt="Selected cover preview"
            />
          )}
          <label>
            Image description
            <input
              value={article.imageAlt}
              onChange={(event) => update("imageAlt", event.target.value)}
              placeholder="People and setting shown in the image"
            />
          </label>
          <div className="admin-two-column">
            <label>
              Event date
              <input
                value={article.eventDate}
                onChange={(event) => update("eventDate", event.target.value)}
                placeholder="23 September 2026"
              />
            </label>
            <label>
              Location
              <input
                value={article.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder="IIT Guwahati"
              />
            </label>
          </div>
          <label>
            URL slug <small>Leave blank to make one from the title.</small>
            <input
              value={article.slug}
              onChange={(event) => update("slug", event.target.value)}
              placeholder="garbaraas-2026-orientation"
            />
          </label>
          <div className="admin-two-column">
            <label>
              Call-to-action label
              <input
                value={article.ctaLabel}
                onChange={(event) => update("ctaLabel", event.target.value)}
                placeholder="Register now"
              />
            </label>
            <label>
              Call-to-action URL
              <input
                value={article.ctaHref}
                onChange={(event) => update("ctaHref", event.target.value)}
                placeholder="https://… or /events"
              />
            </label>
          </div>
          <label>
            Author
            <input
              value={article.author}
              onChange={(event) => update("author", event.target.value)}
            />
          </label>
          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                checked={article.featured}
                onChange={(event) => update("featured", event.target.checked)}
              />{" "}
              Feature at the top of news
            </label>
            <label>
              <input
                type="checkbox"
                checked={article.showOnHome}
                onChange={(event) => update("showOnHome", event.target.checked)}
              />{" "}
              Show on homepage
            </label>
            <label>
              <input
                type="checkbox"
                checked={article.published}
                onChange={(event) => update("published", event.target.checked)}
              />{" "}
              Publish now
            </label>
          </div>
          {message && <p className="admin-message">{message}</p>}
          <button type="submit" disabled={busy || uploading}>
            {uploading
              ? "Uploading image…"
              : busy
                ? "Saving…"
                : article.published
                  ? "Publish news"
                  : "Save draft"}
          </button>
        </form>
        <aside className="admin-list">
          <p className="eyebrow">ALL NEWS</p>
          <h2>
            {articles.length} item{articles.length === 1 ? "" : "s"}
          </h2>
          {articles.length === 0 ? (
            <p className="admin-empty">
              No database articles yet. The existing website cards remain
              visible until you publish the first one.
            </p>
          ) : (
            <div>
              {articles.map((item) => (
                <article key={item.id}>
                  <div>
                    <p>
                      {item.archived ? "Archived" : item.published ? "Published" : "Draft"} ·{" "}
                      {formatDate(item.publishedAt)}
                    </p>
                    <h3>{item.title}</h3>
                    <span>
                      {item.category}
                      {item.featured ? " · Featured" : ""}
                    </span>
                  </div>
                  <div className="admin-item-actions">
                    <button type="button" onClick={() => editArticle(item)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeArticle(item)}>
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
