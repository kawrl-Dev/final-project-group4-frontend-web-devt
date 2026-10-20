import { useReducer } from 'react';
import { WindowContext } from './WindowContext';

// Only ONE window can be open. readDocuments remembers every document the
// player has opened (used by the Clues icon). solved remembers the slugs of
// every lock the player has opened (this is what gets saved). paused shows the
// pause menu on top of everything. All of it lives here, not in a window, so
// closing the explorer does not erase it.
const initialState = { openWindow: null, readDocuments: [], solved: [], paused: false };

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      // Opening a window replaces whatever was open.
      return { ...state, openWindow: { id: action.id, title: action.title } };
    case 'CLOSE':
      return { ...state, openWindow: null };
    case 'MARK_READ':
      // Ignore duplicates. Returning the same state object also skips a re-render,
      // so StrictMode's double-run is harmless.
      if (state.readDocuments.some((d) => d.slug === action.slug)) return state;
      return {
        ...state,
        readDocuments: [...state.readDocuments, { slug: action.slug, name: action.name }],
      };
    case 'SOLVE':
      if (state.solved.includes(action.slug)) return state;
      return { ...state, solved: [...state.solved, action.slug] };
    case 'PAUSE':
      return state.paused ? state : { ...state, paused: true };
    case 'RESUME':
      return state.paused ? { ...state, paused: false } : state;
    case 'LOAD':
      // Replace the whole session with a save. Windows close so the explorer
      // restarts at the root folder, and the menu closes.
      return {
        openWindow: null,
        readDocuments: action.readDocuments,
        solved: action.solved,
        paused: false,
      };
    default:
      return state;
  }
}

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}