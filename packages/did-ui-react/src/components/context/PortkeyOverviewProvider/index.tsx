import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { BasicActions } from '../utils';
import { OverviewState } from './actions';
import { PortkeyOverviewActions } from './actions';

const INITIAL_STATE = {};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function usePortkeyOverview(): [OverviewState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: OverviewState, { type, payload }: any) {
  switch (type) {
    case PortkeyOverviewActions.destroy: {
      return INITIAL_STATE;
    }
    default: {
      console.log(payload, 'payload===default');
      // const { destroy } = payload;
      // if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export function PortkeyOverviewProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <PortkeyContext.Provider value={useMemo(() => [{ ...state }, { dispatch }], [state])}>
      {children}
    </PortkeyContext.Provider>
  );
}
