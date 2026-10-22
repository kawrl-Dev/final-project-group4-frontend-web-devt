import { useReducer } from 'react';
import { WindowContext } from './WindowContext';

const initialState = {
  openWindow: null, readDocuments: [], solved: [], paused: false,
  finished: false, wrongGuesses: 0, startedAt: null, finishedAt: null,
};

const toMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

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
      return {
        ...state,
        solved: [...state.solved, action.slug],
        startedAt: state.startedAt ?? action.at ?? null,
      };
    case 'WRONG_GUESS':
      return {
        ...state,
        wrongGuesses: state.wrongGuesses + 1,
        startedAt: state.startedAt ?? action.at ?? null,
      };
    case 'SYNC': {
      const save = action.save;
      if (!save) return state;
      return {
        ...state,
        startedAt: toMs(save.startedAt) ?? state.startedAt,
        finishedAt: toMs(save.finishedAt) ?? state.finishedAt,
        wrongGuesses: typeof save.wrongGuesses === 'number' ? save.wrongGuesses : state.wrongGuesses,
      };
    }
    case 'PAUSE':
      return state.paused || state.finished ? state : { ...state, paused: true };
    case 'RESUME':
      return state.paused ? { ...state, paused: false } : state;
    case 'FINISH':
      return state.finished
        ? state
        : { ...state, finished: true, paused: false, finishedAt: state.finishedAt ?? action.at ?? null };
    case 'LOAD':
      return {
        ...initialState,
        readDocuments: action.readDocuments,
        solved: action.solved,
        wrongGuesses: action.wrongGuesses ?? 0,
        startedAt: toMs(action.startedAt),
        finishedAt: toMs(action.finishedAt),
      };
    case 'RESET':
      return { ...initialState, paused: state.paused };
    default:
      return state;
  }
}

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}