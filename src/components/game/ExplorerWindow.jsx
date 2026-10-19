import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { getItem } from '../../services/gameService';
import DocumentViewer from './DocumentViewer';
import { DocumentIcon, FolderIcon, LockIcon } from './PixelIcons';
import Window95, { RAISED, SUNKEN } from './Window95';

function pickIcon(child) {
  if (child.locked) return <LockIcon />;
  return child.type === 'folder' ? <FolderIcon /> : <DocumentIcon />;
}

// The window always starts at the root folder.
const ROOT = { slug: 'root', name: 'C:', type: 'folder' };

export default function ExplorerWindow({ onClose }) {
  // "stack" is the trail we walked through, e.g. [root, users, guest.bson].
  // The LAST entry is what we are looking at. Going Back = remove the last one.
  // If the last entry is a file, we show the document view; otherwise the folder list.
  const [stack, setStack] = useState([ROOT]);
  // Latest reply for a folder, or the slug of a folder that failed to load.
  const [loaded, setLoaded] = useState({ item: null, failedSlug: null });
  // Same idea, for the document being viewed.
  const [docLoaded, setDocLoaded] = useState({ item: null, failedSlug: null });

  const current = stack[stack.length - 1];
  const viewingDoc = current.type === 'file';
  // The folder list always belongs to the last FOLDER in the trail.
  const folder = viewingDoc ? stack[stack.length - 2] : current;

  // The API does not return the path, so we build it ourselves from the stack.
  // [root, users, guest.bson] -> "C:\users\guest.bson"
  const path = ['C:', ...stack.slice(1).map((f) => f.name)].join('\\');

  // Folder list: reloads only when the folder changes, NOT when a document opens.
  useEffect(() => {
    let cancelled = false; // ignore a late reply if we already moved on
    getItem(folder.slug)
      .then((item) => { if (!cancelled) setLoaded({ item, failedSlug: null }); })
      .catch(() => { if (!cancelled) setLoaded({ item: null, failedSlug: folder.slug }); });
    return () => { cancelled = true; };
  }, [folder.slug]);

  // Document: loads when a file is on top of the stack.
  const docSlug = viewingDoc ? current.slug : null;
  useEffect(() => {
    if (!docSlug) return undefined;
    let cancelled = false;
    getItem(docSlug)
      .then((item) => { if (!cancelled) setDocLoaded({ item, failedSlug: null }); })
      .catch(() => { if (!cancelled) setDocLoaded({ item: null, failedSlug: docSlug }); });
    return () => { cancelled = true; };
  }, [docSlug]);

  // We are "loading" until the reply we hold matches what we want.
  const failed = loaded.failedSlug === folder.slug;
  const item = loaded.item?.slug === folder.slug ? loaded.item : null;
  const docFailed = viewingDoc && docLoaded.failedSlug === docSlug;
  const doc = viewingDoc && docLoaded.item?.slug === docSlug ? docLoaded.item : null;

  // The folder list stays mounted (just hidden) while a document is open, so its
  // contents and scroll position are still there when we come Back.
  const listRef = useRef(null);
  const savedScroll = useRef(0);
  useLayoutEffect(() => {
    if (!viewingDoc && listRef.current) listRef.current.scrollTop = savedScroll.current;
  }, [viewingDoc]);

  const handleOpen = (child) => {
    // Locked items (slice 4) still do nothing.
    if (child.locked) return;
    if (listRef.current) savedScroll.current = listRef.current.scrollTop;
    setStack((s) => [...s, { slug: child.slug, name: child.name, type: child.type }]);
  };

  const handleBack = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const atRoot = stack.length === 1;

  // Title bar shows C:\ plus the folder or file you are in (just the last name, not the full path).
  const title = atRoot ? 'C:\\' : `C:\\${current.name}`;

  return (
    <Window95 title={title} onClose={onClose}>
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

      {/* Folder list. Black file area with green text. Courier Prime = the default font-sans */}
      <div
        ref={listRef}
        className={`min-h-0 flex-1 overflow-auto bg-black p-3 font-sans text-green-400 ${SUNKEN} ${viewingDoc ? 'hidden' : ''}`}
      >
        {!item && !failed && <p className="animate-pulse">loading...</p>}
        {failed && <p className="text-red-400">Could not read {path}</p>}
        {item && item.children.length === 0 && <p className="text-green-700">This folder is empty.</p>}
        {item && (
          <ul className="flex flex-wrap gap-4">
            {item.children.map((child) => (
              <li key={child.slug}>
                <div
                  onDoubleClick={() => handleOpen(child)}
                  className="flex w-24 cursor-default select-none flex-col items-center gap-1 p-1 text-center hover:bg-green-500/10"
                >
                  <span className="h-10 w-10">{pickIcon(child)}</span>
                  <span className={`wrap-break-word text-sm ${child.locked ? 'text-green-700' : ''}`}>
                    {child.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Document view: replaces the list in the same window. Scrolls inside the fixed frame. */}
      {viewingDoc && (
        <div className={`min-h-0 flex-1 overflow-auto bg-black p-3 font-sans text-green-400 ${SUNKEN}`}>
          {!doc && !docFailed && <p className="animate-pulse">loading...</p>}
          {docFailed && <p className="text-red-400">Could not read {path}</p>}
          {doc && <DocumentViewer document={doc.document} />}
        </div>
      )}
    </Window95>
  );
}