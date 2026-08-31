// Per-route document metadata: title + description + Open Graph tags.
// SPA-safe alternative to per-page HTML files — no extra dependencies.
import { useEffect } from "react";

function ensureMeta(selector: string, attribute: "name" | "property", key: string): HTMLMetaElement {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  return meta;
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (!description) return;
    ensureMeta('meta[name="description"]', "name", "description").content = description;
    ensureMeta('meta[property="og:title"]', "property", "og:title").content = title;
    ensureMeta('meta[property="og:description"]', "property", "og:description").content = description;
  }, [title, description]);
}
