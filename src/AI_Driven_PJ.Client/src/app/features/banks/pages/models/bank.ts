export interface BankModel {
  bankId: number;
  bankName: string;
  bankCode: string;
  status: BankStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export type BankStatus = 'ACTIVE' | 'INACTIVE';

export interface BankRequestModel {
  bankName: string;
  bankCode: string;
  status: BankStatus;
}

export interface BankQueryParams {
  page: number;
  take: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

export interface PagedResultModel<T> {
  items: T[];
  page: number;
  take: number;
  totalCount: number;
  totalPages: number;
}
