import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {AccountResource, AuthenticatedSessionResource, IdentityVerificationResource} from './iam-resources';
import {DriverAssembler, SavedAddressAssembler, VehicleAssembler} from './fleet.assemblers';
import {Vehicle} from '../domain/model/vehicle.entity';
import {Driver} from '../domain/model/driver.entity';
import {SavedAddress} from '../domain/model/saved-address.entity';
import {IdentityVerification} from '../domain/model/identity-verification.entity';
import {VehicleResource, DriverResource, SavedAddressResource} from './iam-resources';
import {SignUpCommand, MerchantData} from '../domain/commands/sign-up.command';
import {SignInCommand} from '../domain/commands/sign-in.command';

@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  static readonly AUTHENTICATION_PATH = environment.authenticationEndpointPath;
  static readonly USERS_PATH = '/users/me';

  readonly vehicles = new BaseApiEndpoint<Vehicle, VehicleResource, VehicleAssembler>(this.http, this.url('/vehicles'), new VehicleAssembler());
  readonly drivers = new BaseApiEndpoint<Driver, DriverResource, DriverAssembler>(this.http, this.url('/drivers'), new DriverAssembler());
  readonly savedAddresses = new BaseApiEndpoint<SavedAddress, SavedAddressResource, SavedAddressAssembler>(
    this.http, this.url('/saved-addresses'), new SavedAddressAssembler());

  signUp(command: SignUpCommand): Observable<AuthenticatedSessionResource> {
    return this.post(`${IamApi.AUTHENTICATION_PATH}/sign-up`, { ...command });
  }

  signIn(command: SignInCommand): Observable<AuthenticatedSessionResource> {
    return this.post(`${IamApi.AUTHENTICATION_PATH}/sign-in`, { email: command.email, password: command.password });
  }

  signOut(refreshToken: string): Observable<void> {
    return this.post(`${IamApi.AUTHENTICATION_PATH}/sign-out`, { refreshToken });
  }

  getMe(): Observable<AccountResource> {
    return this.get(IamApi.USERS_PATH);
  }

  updateIdentity(fullName: string, phone: string): Observable<AccountResource> {
    return this.put(`${IamApi.USERS_PATH}/identity`, { fullName, phone });
  }

  addRole(role: string, merchant: MerchantData | null): Observable<AccountResource> {
    return this.post(`${IamApi.USERS_PATH}/roles`, { role, merchant });
  }

  updateMerchantProfile(businessName: string, businessType: string): Observable<AccountResource> {
    return this.put(`${IamApi.USERS_PATH}/merchant-profile`, { businessName, businessType });
  }

  listIdentityVerifications(): Observable<IdentityVerification[]> {
    return this.get<IdentityVerificationResource[]>(`${IamApi.USERS_PATH}/identity-verifications`).pipe(map(items => items.map(item => ({ ...item }))));
  }

  submitIdentityVerification(documentFrontS3Key: string | null, documentBackS3Key: string | null): Observable<IdentityVerification> {
    return this.post(`${IamApi.USERS_PATH}/identity-verifications`, { documentFrontS3Key, documentBackS3Key });
  }
}
