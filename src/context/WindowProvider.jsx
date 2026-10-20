import { useReducer } from 'react';
import { WindowContext } from './WindowContext';

// Only ONE window can be open. readDocuments remembers every document the
// player has opened (used by the Clues icon in slice 5). It lives here, not
// in the window, so closing the explorer does not erase it.
const initialState = { openWindow: null, readDocuments: [] };

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
    default:
      return state;
  }
}

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}