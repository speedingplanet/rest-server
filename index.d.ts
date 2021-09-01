type UserType = 'corporation' | 'person';

export interface ZippayRecord {
  id: string;
  version: number;
  lastUpdated: string | Date;
  active: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
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

export interface DaoData<T> {
  response: Response;
  data: T;
}

export interface Dao {
  findAllTransactions: (options?: any) => Promise<DaoData<Transaction[]>>;
  findTransactionById: (
    id: string,
    options?: any
  ) => Promise<DaoData<Transaction>>;
  findAllUsers: (options?: any) => Promise<DaoData<User[]>>;
  findUserById: (id: string, options?: any) => Promise<DaoData<User>>;
  addUser: (user: User) => Promise<DaoData<User>>;
  getAbortController: () => AbortController;
}

export const dao: Dao;
export const testUrl: string;
