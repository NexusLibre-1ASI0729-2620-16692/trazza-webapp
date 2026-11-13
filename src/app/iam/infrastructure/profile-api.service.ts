import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileApi {
  private readonly carrierProfilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCarrierProfilesEndpointPath}`;
  private readonly merchantProfilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderMerchantProfilesEndpointPath}`;

  constructor(private http: HttpClient) {}

  getCarrierProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.carrierProfilesUrl);
  }

  getCarrierProfileByUserId(userId: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any[]>(this.carrierProfilesUrl, { params });
  }

  createCarrierProfile(resource: any): Observable<any> {
    return this.http.post<any>(this.carrierProfilesUrl, resource);
  }

  updateCarrierProfile(id: number, resource: any): Observable<any> {
    return this.http.patch<any>(`${this.carrierProfilesUrl}/${id}`, resource);
  }

  getMerchantProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.merchantProfilesUrl);
  }

  getMerchantProfileByUserId(userId: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any[]>(this.merchantProfilesUrl, { params });
  }

  createMerchantProfile(resource: any): Observable<any> {
    return this.http.post<any>(this.merchantProfilesUrl, resource);
  }

  updateMerchantProfile(id: number, resource: any): Observable<any> {
    return this.http.patch<any>(`${this.merchantProfilesUrl}/${id}`, resource);
  }
}
