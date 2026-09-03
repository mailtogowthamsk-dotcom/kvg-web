/* ============================================================
   Legal documents — load published HTML from Digital House API
   Same source as the mobile app: GET /api/legal/:slug
   ============================================================ */
(function () {
  "use strict";

  const ALLOWED_TAGS = new Set([
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "blockquote",
    "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td",
    "img", "span", "div", "pre", "code"
  ]);
  const GLOBAL_SAFE_ATTRS = new Set(["class", "title"]);
  const TAG_ATTRS = {
    a: new Set(["href", "target", "rel", "title"]),
    img: new Set(["src", "alt", "title", "width", "height"]),
    td: new Set(["colspan", "rowspan"]),
    th: new Set(["colspan", "rowspan"])
  };

  function resolveLegalApiBase() {
    try {
      const h = typeof location !== "undefined" ? location.hostname : "";
      if (!h || h === "localhost" || h === "127.0.0.1") {
        return "http://localhost:4000/api/legal";
      }
    } catch (_) { /* ignore */ }
    return "https://www.infosensetechnologies.com/digitalhouse/backend/api/legal";
  }

  function decodeAttr(value) {
    return String(value)
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function encodeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isSafeUrl(raw, allowDataImage) {
    const value = String(raw || "").trim();
    if (!value) return false;
    if (value.startsWith("#") || value.startsWith("/")) return true;
    const lower = value.toLowerCase();
    if (lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("mailto:")) {
      return true;
    }
    if (allowDataImage && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value)) {
      return true;
    }
    return false;
  }

  function sanitizeAttributes(tag, attrText) {
    const allowed = new Set([...(TAG_ATTRS[tag] || []), ...GLOBAL_SAFE_ATTRS]);
    const out = [];
    const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;
    let match;
    while ((match = attrRe.exec(attrText || ""))) {
      const name = match[1].toLowerCase();
      if (name.startsWith("on") || name === "style" || !allowed.has(name)) continue;
      const raw = decodeAttr(match[2] ?? match[3] ?? match[4] ?? "");
      if (name === "href" || name === "src") {
        if (!isSafeUrl(raw, name === "src")) continue;
        out.push(name + '="' + encodeAttr(raw) + '"');
        if (name === "href") out.push('rel="noopener noreferrer"');
        continue;
      }
      if (name === "target") {
        if (raw === "_blank" || raw === "_self") out.push(name + '="' + raw + '"');
        continue;
      }
      out.push(name + '="' + encodeAttr(raw) + '"');
    }
    return out.length ? " " + out.join(" ") : "";
  }

  /** Client-side mirror of backend sanitizeLegalHtml — never trust raw HTML alone. */
  function sanitizeLegalHtml(input) {
    if (!input) return "";
    let html = String(input)
      .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi, "");

    html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, rawTag, attrs) => {
      const tag = String(rawTag).toLowerCase();
      const closing = full.trimStart().startsWith("</");
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return "</" + tag + ">";
      const selfClosing = /\/>\s*$/.test(full) || tag === "br" || tag === "hr" || tag === "img";
      const safeAttrs = sanitizeAttributes(tag, attrs || "");
      return selfClosing ? "<" + tag + safeAttrs + " />" : "<" + tag + safeAttrs + ">";
    });

    return html.trim();
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    } catch (_) {
      return "";
    }
  }

  function setText(el, text) {
    if (el) el.textContent = text || "";
  }

  function showState(root, which) {
    ["loading", "error", "empty", "content"].forEach((name) => {
      const el = root.querySelector('[data-legal-state="' + name + '"]');
      if (el) el.hidden = name !== which;
    });
  }

  async function loadLegalDocument(root) {
    const slug = (root.getAttribute("data-legal-slug") || "").trim();
    if (!slug) {
      showState(root, "error");
      setText(root.querySelector("[data-legal-error]"), "Legal page is not configured.");
      return;
    }

    showState(root, "loading");
    const base = (window.CommunityData && window.CommunityData.legalApiBase) || resolveLegalApiBase();
    const url = base.replace(/\/+$/, "") + "/" + encodeURIComponent(slug);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      let data = null;
      try { data = await res.json(); } catch (_) { /* ignore */ }

      if (res.status === 404 || (data && data.ok === false && /not found/i.test(data.message || ""))) {
        showState(root, "empty");
        setText(
          root.querySelector("[data-legal-empty]"),
          "This document is not published yet. Please check back later or open it in the Digital House app."
        );
        return;
      }

      if (!res.ok || !data || !data.ok || !data.document) {
        throw new Error((data && data.message) || "Failed to load document");
      }

      const doc = data.document;
      const title = doc.title || (data.type && data.type.title) || "Legal document";
      const version = doc.version || "";
      const updated = formatDate(doc.publishedAt || doc.updatedAt);

      const heroTitle = document.querySelector("[data-legal-hero-title]");
      const crumb = document.querySelector("[data-legal-crumb]");
      const pageTitleEl = document.querySelector("title");
      const metaDesc = document.querySelector('meta[name="description"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');

      setText(heroTitle, title);
      setText(crumb, title);
      if (pageTitleEl) {
        pageTitleEl.textContent = title + " — கொங்கு வேட்டுவ கவுண்டர் சமூகம்";
      }
      const desc =
        (data.type && data.type.description) ||
        ("Official " + title + " for Digital House / Kongu Vettuva Gounder community.");
      if (metaDesc) metaDesc.setAttribute("content", desc);
      if (ogTitle) ogTitle.setAttribute("content", title);
      if (ogDesc) ogDesc.setAttribute("content", desc);

      const metaLine = root.querySelector("[data-legal-meta]");
      if (metaLine) {
        const parts = [];
        if (version) parts.push("Version " + version);
        if (updated) parts.push("Last updated: " + updated);
        metaLine.textContent = parts.join(" · ");
        metaLine.hidden = !parts.length;
      }

      const body = root.querySelector("[data-legal-html]");
      if (body) {
        body.innerHTML = sanitizeLegalHtml(doc.content || "");
        if (!body.innerHTML.trim()) {
          showState(root, "empty");
          setText(root.querySelector("[data-legal-empty]"), "This document has no content yet.");
          return;
        }
      }

      showState(root, "content");
    } catch (err) {
      showState(root, "error");
      setText(
        root.querySelector("[data-legal-error]"),
        "Unable to load this document right now. Please try again later."
      );
    }
  }

  function init() {
    document.querySelectorAll("[data-legal-slug]").forEach((root) => {
      void loadLegalDocument(root);
    });
  }

  window.KvgLegal = {
    resolveLegalApiBase,
    sanitizeLegalHtml,
    loadLegalDocument
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
