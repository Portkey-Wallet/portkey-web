import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { BasicActions, getUpdateList } from '../utils';
import { PortkeySendActions, SendState } from './actions';

const INITIAL_STATE = {
  initialized: false,
};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function usePortkeySend(): [SendState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: SendState, { type, payload }: any) {
  switch (type) {
    case PortkeySendActions.destroy: {
      return INITIAL_STATE;
    }
    case PortkeySendActions.setRecentTx: {
      const { skipCount, isUpdate, totalRecordCount } = payload;
      const list = getUpdateList(isUpdate, totalRecordCount, state.recentTx?.list);
      list.splice(skipCount, payload.list.length, ...payload.list);
      return Object.assign({}, state, {
        recentTx: {
          totalRecordCount,
          list,
        },
      });
    }
    default: {
      // const { destroy } = payload;
      // if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export function PortkeySendProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <PortkeyContext.Provider value={useMemo(() => [{ ...state }, { dispatch }], [state])}>
      {children}
    </PortkeyContext.Provider>
  );
}
