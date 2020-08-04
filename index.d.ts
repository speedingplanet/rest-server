type UserType = 'corporation' | 'person';

export interface ZippayRecord {
  id: string;
  version: number;
  lastUpdated: string | Date;
  active: true;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface User extends ZippayRecord {
  displayName: string;
  payeeId: string;
  email: string;
  userType: UserType;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  address: Address;
}

export const users: User[];

export type TransactionType = 'payment' | 'charge';
export type TransactionStatus = 'settled' | 'open';
export type VisibilityTypes = 'public' | 'private';

export interface Transaction extends ZippayRecord {
  payorId: string;
  payeeId: string;
  txDate: string | Date;
  txType: TransactionType;
  txStatus: TransactionStatus;
  reason: string;
  visibility: VisibilityTypes;
}

export const transactions: Transaction[];