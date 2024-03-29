export type TCommonService = {
  saveData(params: TSaveDataApiParams): Promise<string>;
};

export type TSaveDataApiParams = { needPersist?: boolean } & Record<string, string>;
