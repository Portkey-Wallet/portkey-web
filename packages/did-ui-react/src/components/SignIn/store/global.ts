import { AccountTypeEnum } from '@portkey/services';

const initState = {
  network: 'TESTNET',
  accountType: AccountTypeEnum.Email,
};

interface GlobalState {
  network: string;
  accountType: AccountTypeEnum;
}

class Global {
  state: GlobalState;

  constructor(state: GlobalState = initState) {
    this.state = state;
  }

  getState = (key: keyof GlobalState) => {
    return this.state?.[key];
  };

  setState = (key: keyof GlobalState, value: GlobalState[keyof GlobalState]) => {
    // if (this.state[key]) return (this.state[key] = value);
    this.state = {
      ...this.state,
      [key]: value,
    };
  };
}

export const globalState = new Global();
