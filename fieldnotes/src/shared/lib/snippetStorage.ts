export interface Snippet {
  id: string;
  name: string;
  content: string;
}

const STORAGE_KEY = "snippets";

function readAll(): Snippet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(snippets: Snippet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export const snippetStore = {
  list: (): Snippet[] => readAll(),
  add: (name: string, content: string): Snippet => {
    const snippet: Snippet = { id: crypto.randomUUID(), name, content };
    writeAll([...readAll(), snippet]);
    return snippet;
  },
  update: (id: string, patch: Partial<Pick<Snippet, "name" | "content">>) => {
    writeAll(readAll().map((s) => (s.id === id ? { ...s, ...patch } : s)));
  },
  remove: (id: string) => {
    writeAll(readAll().filter((s) => s.id !== id));
  },
};