import { useReducer } from 'react';
import { WindowContext } from './WindowContext';

const initialState = { openWindow: null, readDocuments: [], solved: [], paused: false, finished: false };

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return { ...state, openWindow: { id: action.id, title: action.title } };
    case 'CLOSE':
      return { ...state, openWindow: null };
    case 'MARK_READ':
      if (state.readDocuments.some((d) => d.slug === action.slug)) return state;
      return {
        ...state,
        readDocuments: [...state.readDocuments, { slug: action.slug, name: action.name }],
      };
    case 'SOLVE':
      if (state.solved.includes(action.slug)) return state;
      return { ...state, solved: [...state.solved, action.slug] };
    case 'PAUSE':
      return state.paused || state.finished ? state : { ...state, paused: true };
    case 'RESUME':
      return state.paused ? { ...state, paused: false } : state;
    case 'FINISH':
      return state.finished ? state : { ...state, finished: true, paused: false };
    case 'LOAD':
      return {
        openWindow: null,
        readDocuments: action.readDocuments,
        solved: action.solved,
        paused: false,
        finished: false,
      };
    default:
      return state;
  }
}

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}