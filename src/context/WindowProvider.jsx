import { useReducer } from 'react';
import { WindowContext } from './WindowContext';
import { initialState, reducer } from '../lib/gameState';

export default function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <WindowContext.Provider value={{ state, dispatch }}>{children}</WindowContext.Provider>;
}
