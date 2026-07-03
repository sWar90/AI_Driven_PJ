import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BankQueryParams, BankRequestModel } from '../models/bank';
import { RootModel } from '@core/models/root.model';
import { SKIP_GLOBAL_ERROR_TOAST } from '@core/http/http-error-toast.context';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  constructor(private httpClient: HttpClient) {}

  private readonly contextualErrorToast = new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true);

  get(queryParams: BankQueryParams): Observable<RootModel> {
    let params = new HttpParams().set('Page', queryParams.page).set('Take', queryParams.take);

    if (queryParams.search?.trim()) {
      params = params.set('Search', queryParams.search.trim());
    }

    if (queryParams.sortField?.trim()) {
      params = params
        .set('SortField', queryParams.sortField.trim())
        .set('SortOrder', queryParams.sortOrder ?? 1);
    }

    return this.httpClient.get<RootModel>(`${environment.main_url}/banks`, {
      params,
      context: this.contextualErrorToast,
    });
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/banks/${id}`, {
      context: this.contextualErrorToast,
    });
  }

  create(model: BankRequestModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/banks`, model, {
      context: this.contextualErrorToast,
    });
  }

  update(id: number, model: BankRequestModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/banks/${id}`, model, {
      context: this.contextualErrorToast,
    });
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/banks/${id}`, {
      context: this.contextualErrorToast,
    });
  }
}
