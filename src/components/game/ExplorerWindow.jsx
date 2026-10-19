import { useEffect, useState } from 'react';
import { getItem } from '../../services/gameService';
import { DocumentIcon, FolderIcon, LockIcon } from './PixelIcons';
import Window95, { SUNKEN } from './Window95';

function pickIcon(child) {
  if (child.locked) return <LockIcon />;
  return child.type === 'folder' ? <FolderIcon /> : <DocumentIcon />;
}

// Slice 1: always shows the children of "root". Double-click does nothing yet.
export default function ExplorerWindow({ onClose }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false; // stops us setting state if the window closed first
    getItem('root')
      .then((data) => { if (!cancelled) setItem(data); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Window95 title="C:\" onClose={onClose}>
      {/* Black file area with green text. Courier Prime = the default font-sans */}
      <div className={`min-h-0 flex-1 overflow-auto bg-black p-3 font-sans text-green-400 ${SUNKEN}`}>
        {!item && !error && <p className="animate-pulse">loading...</p>}
        {error && <p className="text-red-400">Could not read C:\</p>}
        {item && (
          <ul className="flex flex-wrap gap-4">
            {item.children.map((child) => (
              <li key={child.slug}>
                <div
                  onDoubleClick={() => {}} /* opening comes in slice 2 */
                  className="flex w-24 cursor-default select-none flex-col items-center gap-1 p-1 text-center hover:bg-green-500/10"
                >
                  <span className="h-10 w-10">{pickIcon(child)}</span>
                  <span className={`wrap-break-word text-sm ${child.locked ? 'text-green-700' : ''}`}>{child.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Window95>
  );
}
