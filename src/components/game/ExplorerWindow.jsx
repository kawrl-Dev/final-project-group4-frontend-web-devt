import { useEffect, useState } from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { setCachedItem, useItem } from '../../hooks/useItem';
import { useWindows } from '../../hooks/useWindows';
import { DocumentIcon, FolderIcon, LockIcon } from './PixelIcons';
import BsonView from './BsonView';
import LockPrompt from './LockPrompt';
import Window95, { RAISED, SUNKEN } from './Window95';

const RETRY_SECONDS = 5;

function pickIcon(child, locked) {
  if (locked) return <LockIcon />;
  return child.type === 'folder' ? <FolderIcon /> : <DocumentIcon />;
}

// Mounts when an error appears, so the countdown restarts on every failure.
function RetryButton({ onRetry }) {
  const [left, setLeft] = useState(RETRY_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={left > 0}
      className={`mt-2 bg-gray-300 px-3 py-0.5 text-sm text-black ${RAISED} ${
        left > 0 ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'
      }`}
    >
      {left > 0 ? `Retry (${left})` : 'Retry'}
    </button>
  );
}

// The window always starts at the root folder.
const ROOT = { slug: 'root', name: 'C:' };

export default function ExplorerWindow({ onClose }) {
  const { state, dispatch } = useWindows();

  // "stack" is the trail we walked through, e.g. [root, users, guest.bson].
  // The LAST entry is what we are looking at (a folder or a document).
  // Going Back = remove the last one.
  const [stack, setStack] = useState([ROOT]);
  const current = stack[stack.length - 1];

  // The locked child the player double-clicked ({ slug, name, type }), or null.
  // While set, the lock prompt replaces the folder contents.
  const [lockTarget, setLockTarget] = useState(null);

  // The API does not return the path, so we build it from the stack.
  // [root, users, guest.bson] -> "C:\users\guest.bson"
  const folderPath = ['C:', ...stack.slice(1).map((f) => f.name)].join('\\');
  const path = lockTarget ? `${folderPath}\\${lockTarget.name}` : folderPath;

  const { item, loading, error, waking, refetch } = useItem(current.slug);

  // A folder listing from the server marks every lock as locked. After a Load
  // (or a solve) the player has already opened some of them, so the list of
  // solved slugs in WindowProvider overrides what the listing says.
  const isLocked = (child) => child.locked && !state.solved.includes(child.slug);

  // Opening a document counts as "read". This runs only after the file has
  // loaded successfully (item exists), never on double-click or on failure.
  // MARK_READ ignores duplicates, so running twice (StrictMode) is harmless.
  useEffect(() => {
    if (item && item.type === 'file' && !item.locked) {
      dispatch({ type: 'MARK_READ', slug: item.slug, name: item.name });
    }
  }, [item, dispatch]);

  const handleOpen = (child) => {
    // Locked items show the lock prompt. Unlocked folders AND files open.
    if (isLocked(child)) {
      setLockTarget({ slug: child.slug, name: child.name, type: child.type });
      return;
    }
    setStack((s) => [...s, { slug: child.slug, name: child.name }]);
  };

  // Correct answer: remember the unlocked item, flip the lock icon in this
  // folder's cached listing, record the solve (so Save can store it), and go
  // back to the folder. The folder re-renders from the cache, so the icon
  // turns into a normal folder/document.
  const handleSolved = (unlockedItem) => {
    setCachedItem(lockTarget.slug, unlockedItem);
    if (item?.children) {
      setCachedItem(current.slug, {
        ...item,
        children: item.children.map((c) =>
          c.slug === lockTarget.slug ? { ...c, locked: false } : c
        ),
      });
    }
    dispatch({ type: 'SOLVE', slug: lockTarget.slug });
    setLockTarget(null);
  };

  // Back first closes the lock prompt, then walks up the folder trail.
  const handleBack = () => {
    if (lockTarget) {
      setLockTarget(null);
      return;
    }
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  };

  const atRoot = stack.length === 1;
  const isFile = item?.type === 'file';

  return (
    <Window95 title="C:\" onClose={onClose}>
      {/* Toolbar: Back button + read-only address bar */}
      <div className="flex items-center gap-2 px-1 py-1 text-sm text-black">
        <button
          type="button"
          onClick={handleBack}
          disabled={atRoot && !lockTarget}
          className={`flex items-center gap-1 bg-gray-300 px-2 py-0.5 ${RAISED} ${
            atRoot && !lockTarget ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white'
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
        {lockTarget ? (
          <LockPrompt
            key={lockTarget.slug}
            target={lockTarget}
            onSolved={handleSolved}
            onCancel={() => setLockTarget(null)}
          />
        ) : (
          <>
            {loading && (
              <p role="status" className="animate-pulse">
                {waking ? 'waking the server...' : 'loading...'}
              </p>
            )}
            {error && (
              <div role="alert">
                <p className="text-red-400">Could not read {path}</p>
                <RetryButton onRetry={refetch} />
              </div>
            )}

            {/* Document view */}
            {isFile && item.document && <BsonView document={item.document} />}

            {/* Folder view */}
            {item && !isFile && item.children?.length === 0 && (
              <p className="text-green-700">This folder is empty.</p>
            )}
            {item && !isFile && item.children && (
              <ul className="flex flex-wrap gap-4">
                {item.children.map((child) => {
                  const locked = isLocked(child);
                  return (
                    <li key={child.slug}>
                      <div
                        onDoubleClick={() => handleOpen(child)}
                        className="flex w-24 cursor-default select-none flex-col items-center gap-1 p-1 text-center hover:bg-green-500/10"
                      >
                        <span className="h-10 w-10">{pickIcon(child, locked)}</span>
                        <span className={`wrap-break-word text-sm ${locked ? 'text-green-700' : ''}`}>
                          {child.name}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </Window95>
  );
}
