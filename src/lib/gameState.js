/* 
  Game state for WindowProvider, as plain JS so node:test can run it.
The score is never calculated here. It is copied from server replies
(solve, hint, pause, resume, save, load) and shown as max(0, score).
*/
export const initialState = {
  openWindow: null, readDocuments: [], solved: [], paused: false, finished: false,
  score: 0, hintsByLock: [], startedAt: null, finishedAt: null, pausedMs: 0,
  creditLeftMs: null, pausedAt: null, serverPaused: false, pauseFailed: false
};

export const toMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

const num = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const list = (v) => (Array.isArray(v) ? v : []);

/** Builds the LOAD action from a GET /api/saves/me reply. */
export const loadFromSave = (save) => ({ type: 'LOAD', save });

export function reducer(state, action) {
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
        score: num(action.score, state.score),
      };
    case 'WRONG_GUESS':
      return {
        ...state,
        startedAt: state.startedAt ?? action.at ?? null,
        score: num(action.score, state.score),
      };
    case 'HINT_REVEALED':
      return {
        ...state,
        hintsByLock: state.hintsByLock.includes(action.slug) ? state.hintsByLock : [...state.hintsByLock, action.slug],
        score: num(action.score, state.score),
      };
    case 'SYNC': {
      const save = action.save;
      if (!save) return state;
      return {
        ...state,
        startedAt: toMs(save.startedAt) ?? state.startedAt,
        finishedAt: toMs(save.finishedAt) ?? state.finishedAt,
        score: num(save.playerScore, state.score),
        pausedMs: num(save.pausedMs, state.pausedMs),
        hintsByLock: Array.isArray(save.hintsByLock) ? save.hintsByLock : state.hintsByLock,
        serverPaused: save.pausedAt ? true : state.paused ? state.serverPaused : false,
      };
    }
    case 'PAUSE':
      if (state.paused || state.finished) return state;
      return { ...state, paused: true, pausedAt: action.at ?? null, serverPaused: true, pauseFailed: false };
    case 'PAUSE_RESULT': {
      const res = action.res ?? {};
      return {
        ...state,
        pausedMs: num(res.pausedMs, state.pausedMs),
        creditLeftMs: num(res.creditLeftMs, state.creditLeftMs),
        score: num(res.score, state.score),
        serverPaused: !!res.paused,
        pauseFailed: false,
      };
    }
    case 'PAUSE_FAILED':
      return { ...state, pauseFailed: true };
    case 'RESUME':
      return state.paused ? { ...state, paused: false, pausedAt: null } : state;
    case 'RESUME_RESULT': {
      const res = action.res ?? {};
      return {
        ...state,
        pausedMs: num(res.pausedMs, state.pausedMs),
        creditLeftMs: num(res.creditLeftMs, state.creditLeftMs),
        score: num(res.score, state.score),
        serverPaused: !!res.paused,
      };
    }
    case 'FINISH':
      return state.finished
        ? state
        : { ...state, finished: true, paused: false, pausedAt: null, finishedAt: state.finishedAt ?? action.at ?? null };
    case 'LOAD': {
      const save = action.save ?? {};
      return {
        ...initialState,
        readDocuments: list(save.readDocuments),
        solved: list(save.solved),
        score: num(save.playerScore, 0),
        hintsByLock: list(save.hintsByLock),
        startedAt: toMs(save.startedAt),
        finishedAt: toMs(save.finishedAt),
        pausedMs: num(save.pausedMs, 0),
        serverPaused: !!save.pausedAt,
      };
    }
    case 'RESET':
      return { ...initialState, paused: state.paused };
    default:
      return state;
  }
}
