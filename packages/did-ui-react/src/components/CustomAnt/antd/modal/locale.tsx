export interface ModalLocale {
  okText: string;
  cancelText: string;
  justOkText: string;
}

let runtimeLocale: ModalLocale = {
  okText: 'OK',
  cancelText: 'Cancel',
  justOkText: 'OK',
};

export function changeConfirmLocale(newLocale?: ModalLocale) {
  if (newLocale) {
    runtimeLocale = {
      ...runtimeLocale,
      ...newLocale,
    };
  } else {
    runtimeLocale = {
      okText: 'OK',
      cancelText: 'Cancel',
      justOkText: 'OK',
    };
  }
}

export function getConfirmLocale() {
  return runtimeLocale;
}
