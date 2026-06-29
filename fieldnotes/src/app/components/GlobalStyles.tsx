import { C, FB } from "@/shared/constants";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;1,400&family=Poppins:wght@500;700&family=JetBrains+Mono:wght@400;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; background: ${C.bg}; color: ${C.ink}; font-family: ${FB}; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .fn-card { transition: box-shadow .2s, transform .2s; }
      .fn-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.12) !important; transform: translateY(-3px); }
      .fn-navlink { transition: color .15s; }
      .fn-navlink:hover { color: ${C.accent} !important; }
      .fn-catitem { transition: all .15s; }
      .fn-catitem:hover { color: ${C.accent} !important; background: ${C.accentBg} !important; }
      .fn-row:hover { background: ${C.accentBg} !important; }
      button { font-family: inherit; font-size: inherit; color: inherit; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 14px;
      }

      table th {
        font-weight: 600;
        background-color: #f6f8fa;
      }

      table th, table td {
        padding: 6px 13px;
        border: 1px solid #d0d7de;
      }

      table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
    `}</style>
  );
}