import { VscChromeClose, VscChromeMaximize, VscChromeMinimize } from 'react-icons/vsc';

// Windows 95 bevel: light top/left edges, dark bottom/right edges.
export const RAISED = 'border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700';
export const SUNKEN = 'border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white';

// A fixed (not draggable) window frame. Only X works.
export default function Window95({ title, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className={`absolute left-1/2 top-[45%] z-20 flex h-105 w-170 -translate-x-1/2 -translate-y-1/2 flex-col bg-gray-300 p-0.5 font-pixel ${RAISED}`}
    >
      <div className="flex items-center justify-between bg-green-900 px-1 py-0.5 text-green-100">
        <span className="truncate text-sm">{title}</span>
        <div className="flex gap-0.5">
          {/* The first two buttons are decoration only */}
          <span className={`flex h-4 w-4 items-center justify-center bg-gray-300 text-black ${RAISED}`}><VscChromeMinimize size={10} /></span>
          <span className={`flex h-4 w-4 items-center justify-center bg-gray-300 text-black ${RAISED}`}><VscChromeMaximize size={10} /></span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close window"
            className={`flex h-4 w-4 cursor-pointer items-center justify-center bg-gray-300 text-black ${RAISED}`}
          >
            <VscChromeClose size={10} />
          </button>
        </div>
      </div>
      <div className="mt-0.5 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
