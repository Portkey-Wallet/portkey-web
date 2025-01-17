export function basicActions<T extends string, P = any>(type: T, payload?: P) {
  return {
    type,
    payload,
  };
}
export type BasicActions<T = string> = {
  dispatch: (actions: { type: T; payload: any }) => void;
};

export function getUpdateList(isUpdate: boolean, total: number, cList: any[] = []) {
  let list;
  if (isUpdate) {
    list = new Array(total);
  } else if (total === cList.length) {
    list = [...cList];
  } else {
    list = new Array(total);
    list.splice(0, cList.length, ...cList);
  }
  return list;
}

export function getSkipCount(maxResultCount: number, page?: number) {
  return page && page > 0 ? page * maxResultCount : 0;
}
