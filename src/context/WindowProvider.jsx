import { useReducer } from 'react';
import { WindowContext } from './WindowContext';

// Only ONE window can be open, so state is just "which one" (or null).
const initialState = { openWindow: null };

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      // Opening a window replaces whatever was open.
      return { openWindow: { id: action.id, title: action.title } };
    case 'CLOSE':
      return { openWindow: null };
    default:
      return state;
  }
}

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}
