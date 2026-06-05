import { C, FH, FM } from "../constants";

/* ═══════════════════════════════════════════════════════════════
   INLINE MARKDOWN RENDERER
═══════════════════════════════════════════════════════════════ */
export default function renderMd(text: string): string {
  if (!text) return "";
  let s = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Fenced code
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) =>
      `<pre style="background:${C.codeBg};color:#E2E8F0;padding:1.25rem;border-radius:8px;overflow-x:auto;font-family:${FM};font-size:.85rem;margin:1.25rem 0;line-height:1.6"><code>${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, `<code style="background:#F1F5F9;color:${C.codeInk};padding:2px 6px;border-radius:4px;font-family:${FM};font-size:.9em">$1</code>`)
    // HR
    .replace(/^---$/gm, `<hr style="border:none;border-top:2px solid ${C.border};margin:2rem 0"/>`)
    // Headings
    .replace(/^### (.+)$/gm, `<h3 style="font-family:${FH};font-size:1.35rem;color:${C.ink};margin:1.75rem 0 .6rem">${'$1'}</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-family:${FH};font-size:1.75rem;color:${C.ink};margin:2rem 0 .75rem">${'$1'}</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-family:${FH};font-size:2.2rem;color:${C.ink};margin:2rem 0 1rem">${'$1'}</h1>`)
    // Bold / Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^&gt; (.+)$/gm, `<blockquote style="border-left:3px solid ${C.accent};padding:.5rem 1rem;margin:1rem 0;color:${C.muted};font-style:italic">$1</blockquote>`)
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" target="_blank" style="color:${C.accent};text-decoration:underline">$1</a>`);

  // List items
  s = s.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>[\s\S]*?<\/li>)/g, `<ul style="list-style:disc;padding-left:1.5rem;margin:.75rem 0">$1</ul>`);

  // Paragraphs (skip block-level tags)
  s = s.split(/\n\n+/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(trimmed)) return trimmed;
    return `<p style="margin:.75rem 0;line-height:1.8;color:${C.ink}">${trimmed.replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");

  return s;
}