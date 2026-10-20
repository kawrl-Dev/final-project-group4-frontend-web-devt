import { useState } from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { useItem } from '../../hooks/useItem';
import { useWindows } from '../../hooks/useWindows';
import { DocumentIcon } from './PixelIcons';
import BsonView from './BsonView';
import Window95, { RAISED, SUNKEN } from './Window95';

export default function CluesWindow({ onClose }) {
  const { state } = useWindows();
  const { readDocuments } = state;

  // The document the player picked ({ slug, name }), or null = show the list.
  const [selected, setSelected] = useState(null);

  // Reads from the useItem cache. The document was already loaded in the
  // Explorer, so it normally appears instantly. With slug = undefined the
  // hook does nothing.
  const { item, loading, error, waking, refetch } = useItem(selected?.slug);

  const path = selected ? `Clues\\${selected.name}` : 'Clues';

  return (
    <Window95 title="Clues" onClose={onClose}>
      {/* Toolbar: Back button + read-only address bar (same look as the Explorer) */}
      <div className="flex items-center gap-2 px-1 py-1 text-sm text-black">
        <button
          type="button"
          onClick={() => setSelected(null)}
          disabled={!selected}
          className={`flex items-center gap-1 bg-gray-300 px-2 py-0.5 ${RAISED} ${
            !selected
              ? 'cursor-not-allowed text-gray-500'
              : 'cursor-pointer active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white'
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

      <div className={`min-h-0 flex-1 overflow-auto bg-black p-3 font-sans text-green-400 ${SUNKEN}`}>
        {/* LIST VIEW */}
        {!selected && readDocuments.length === 0 && (
          <p className="text-green-700">No clues yet. Open a document in C:\ and it will show up here.</p>
        )}

        {!selected && readDocuments.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {readDocuments.map((doc) => (
              <li key={doc.slug}>
                <button
                  type="button"
                  onClick={() => setSelected({ slug: doc.slug, name: doc.name })}
                  className="flex w-24 cursor-pointer select-none flex-col items-center gap-1 p-1 text-center hover:bg-green-500/10 focus-visible:outline-2 focus-visible:outline-green-400"
                >
                  <span className="h-10 w-10"><DocumentIcon /></span>
                  <span className="wrap-break-word text-sm">{doc.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* DOCUMENT VIEW */}
        {selected && loading && (
          <p role="status" className="animate-pulse">
            {waking ? 'waking the server...' : 'loading...'}
          </p>
        )}

        {selected && error && (
          <div role="alert">
            <p className="text-red-400">Could not read {selected.name}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-2 cursor-pointer bg-gray-300 px-3 py-0.5 text-sm text-black ${RAISED}`}
            >
              Retry
            </button>
          </div>
        )}

        {selected && item?.document && <BsonView document={item.document} />}
      </div>
    </Window95>
  );
}