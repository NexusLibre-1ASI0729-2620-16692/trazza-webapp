import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignInCommand } from '../domain/commands/sign-in.command';
import { SignUpCommand } from '../domain/commands/sign-up.command';

@Injectable({
  providedIn: 'root'
})
export class IamApi {
  private readonly usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;

  constructor(private http: HttpClient) {}

  signIn(command: SignInCommand): Observable<any[]> {
    const params = new HttpParams()
      .set('email', command.email)
      .set('password', command.password ?? '');
    return this.http.get<any[]>(this.usersUrl, { params });
  }

  findUsersByEmail(email: string): Observable<any[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<any[]>(this.usersUrl, { params });
  }

  signUp(command: SignUpCommand): Observable<any> {
    const payload = {
      fullName: command.fullName,
      email: command.email,
      phone: command.phone,
      role: command.role,
      password: command.password,
      createdAt: new Date().toISOString()
    };
    return this.http.post<any>(this.usersUrl, payload);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/${id}`);
  }

  updateUser(id: number, resource: any): Observable<any> {
    // Note: json-server requires PATCH to partially update or PUT to replace.
    // For simplicity with json-server, we can use PATCH to update partial fields.
    return this.http.patch<any>(`${this.usersUrl}/${id}`, resource);
  }
}
