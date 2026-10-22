// Small hand-made pixel-art icons drawn on a 16x16 grid.
// crispEdges keeps the pixels sharp instead of blurry.
const base = { viewBox: '0 0 16 16', shapeRendering: 'crispEdges', className: 'h-full w-full' };

export function FolderIcon() {
  return (
    <svg {...base} aria-hidden="true">
      <path fill="#15803D" d="M1 3h6v2h8v9H1z" />
      <path fill="#4ADE80" d="M1 6h14v8H1z" />
      <path fill="#BBF7D0" d="M1 6h14v1H1z" />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg {...base} aria-hidden="true">
      <path fill="#E5E7EB" d="M3 1h7l3 3v11H3z" />
      <path fill="#9CA3AF" d="M10 1v3h3z" />
      <path fill="#16A34A" d="M5 7h6v1H5z M5 9h6v1H5z M5 11h4v1H5z" />
    </svg>
  );
}

// Dimmed lock: a gray padlock. Used for locked folders and files.
export function LockIcon() {
  return (
    <svg {...base} className="h-full w-full opacity-50" aria-hidden="true">
      <path fill="#9CA3AF" d="M5 2h6v1h1v4h-1V4H5v3H4V3h1z" />
      <path fill="#6B7280" d="M3 7h10v8H3z" />
      <path fill="#111827" d="M7 9h2v3H7z" />
    </svg>
  );
}
