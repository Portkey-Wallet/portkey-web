export type TCommonService = {
  saveData(params: TSaveDataApiParams): Promise<string>;
};

export type TSaveDataApiParams = Record<string, any>;
