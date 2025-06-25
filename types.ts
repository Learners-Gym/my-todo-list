export interface ToDo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export enum FilterStatus {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}
