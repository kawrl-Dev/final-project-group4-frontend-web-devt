import { DESKTOP_ICONS } from '../../data/desktopIcons';
import { useWindows } from '../../hooks/useWindows';

const glow = { textShadow: '0 0 0.2em #16A34A' };

export default function Desktop() {
  const { dispatch } = useWindows();

  // Only icons with an `opens` value do anything.
  const handleOpen = (icon) => {
    if (icon.opens) dispatch({ type: 'OPEN', id: icon.opens, title: icon.windowTitle });
  };

  return (
    <div className="absolute left-6 top-6 z-10 flex flex-col gap-4 p-4">
      {DESKTOP_ICONS.map((icon) => (
        <button
          key={icon.id}
          type="button"
          onDoubleClick={() => handleOpen(icon)}
          style={glow}
          className="flex w-24 cursor-default select-none flex-col items-center gap-1 p-1 font-pixel text-green-200 hover:bg-green-500/10 focus-visible:outline-2 focus-visible:outline-green-400"
        >
          <icon.Icon className="h-10 w-10 drop-shadow-[0_0_6px_#16A34A]" aria-hidden="true" />
          <span className="text-sm">{icon.label}</span>
        </button>
      ))}
    </div>
  );
}
