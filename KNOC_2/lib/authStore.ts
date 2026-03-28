// Module-level store for the Firebase phone auth confirmation object.
// This survives React re-renders and screen navigation without going stale.

let _confirmation: any = null;

export const setConfirmation = (c: any) => {
  _confirmation = c;
};

export const getConfirmation = (): any => _confirmation;
