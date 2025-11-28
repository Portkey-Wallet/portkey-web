import { basicActions } from '../utils';

export const PortkeyOverviewActions = {
  destroy: 'DESTROY',
};

export interface OverviewState {
  init?: boolean;
}

export const basicOverviewView = {
  destroy: {
    type: PortkeyOverviewActions['destroy'],
    actions: () => basicActions(PortkeyOverviewActions['destroy']),
  },
};

export const basicOverviewAction = {};
