import { useEffect, useState } from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { getItem } from '../../services/gameService';
import { DocumentIcon, FolderIcon, LockIcon } from './PixelIcons';
import Window95, { RAISED, SUNKEN } from './Window95';

function pickIcon(child) {
  if (child.locked) return <LockIcon />;
  return child.type === 'folder' ? <FolderIcon /> : <DocumentIcon />;
}

// The window always starts at the root folder.
const ROOT = { slug: 'root', name: 'C:' };

export default function ExplorerWindow({ onClose }) {
  // "stack" is the trail of folders we walked through, e.g. [root, users].
  // The LAST one is the folder we are looking at. Going Back = remove the last one.
  const [stack, setStack] = useState([ROOT]);
  // The latest reply from the service, or the slug of a folder that failed to load.
  const [loaded, setLoaded] = useState({ item: null, failedSlug: null });

  const current = stack[stack.length - 1];

  // The API does not return the path, so we build it ourselves from the stack.
  // [root, users] -> "C:\users"
  const path = ['C:', ...stack.slice(1).map((f) => f.name)].join('\\');

  useEffect(() => {
    let cancelled = false; // ignore a late reply if we already moved on
    getItem(current.slug)
      .then((item) => { if (!cancelled) setLoaded({ item, failedSlug: null }); })
      .catch(() => { if (!cancelled) setLoaded({ item: null, failedSlug: current.slug }); });
    return () => { cancelled = true; };
  }, [current.slug]);

  // We are "loading" until the reply we hold matches the folder we want.
  const failed = loaded.failedSlug === current.slug;
  const item = loaded.item?.slug === current.slug ? loaded.item : null;

  const handleOpen = (child) => {
    // Slice 2: only unlocked folders open. Locked items (slice 4) and
    // documents (slice 3) do nothing yet.
    if (child.locked || child.type !== 'folder') return;
    setStack((s) => [...s, { slug: child.slug, name: child.name }]);
  };

  const handleBack = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const atRoot = stack.length === 1;

  return (
    <Window95 title="C:\" onClose={onClose}>
      {/* Toolbar: Back button + read-only address bar */}
      <div className="flex items-center gap-2 px-1 py-1 text-sm text-black">
        <button
          type="button"
          onClick={handleBack}
          disabled={atRoot}
          className={`flex items-center gap-1 bg-gray-300 px-2 py-0.5 ${RAISED} ${
            atRoot ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white'
          }`}
        >
          <VscArrowLeft size={12} aria-hidden="true" />
          Back
        </button>
        <span>Address:</span>
        <div
          role="textbox"
          aria-readonly="true"
          aria-label="Current path"
          className={`flex-1 truncate bg-black px-2 py-0.5 font-sans text-green-400 ${SUNKEN}`}
        >
          {path}
        </div>
      </div>

      {/* Black file area with green text. Courier Prime = the default font-sans */}
      <div className={`min-h-0 flex-1 overflow-auto bg-black p-3 font-sans text-green-400 ${SUNKEN}`}>
        {!item && !failed && <p className="animate-pulse">loading...</p>}
        {failed && <p className="text-red-400">Could not read {path}</p>}
        {item && item.children.length === 0 && <p className="text-green-700">This folder is empty.</p>}
        {item && (
          <ul className="flex flex-wrap gap-4">
            {item.children.map((child) => {
              const isDocument = !child.locked && child.type !== 'folder';
              return (
                <li key={child.slug}>
                  <div
                    onDoubleClick={() => handleOpen(child)}
                    // Documents cannot be opened until slice 3, so show that
                    title={isDocument ? 'Cannot be opened yet' : undefined}
                    className={`flex w-24 select-none flex-col items-center gap-1 p-1 text-center hover:bg-green-500/10 ${
                      isDocument ? 'cursor-not-allowed' : 'cursor-default'
                    }`}
                  >
                    <span className="h-10 w-10">{pickIcon(child)}</span>
                    <span className={`wrap-break-word text-sm ${child.locked || isDocument ? 'text-green-700' : ''}`}>
                      {child.name}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Window95>
  );
}