import {Email} from '../model/email.value-object';
import {Dni} from '../model/dni.value-object';
import {Phone} from '../model/phone.value-object';
import {Ruc} from '../model/ruc.value-object';
import {UserRole} from '../model/user-role.value-object';

export interface MerchantData {
  businessName: string;
  ruc: string;
  businessType: string;
}

export class SignUpCommand {
  static readonly MIN_PASSWORD_LENGTH = 8;

  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly dni: string;
  readonly phone: string;
  readonly roles: UserRole[];
  readonly merchant: MerchantData | null;

  constructor(props: {
    email: string; password: string; fullName: string; dni: string; phone: string; roles: UserRole[];
    businessName?: string; ruc?: string; businessType?: string;
  }) {
    this.email = new Email(props.email).value;
    if ((props.password ?? '').length < SignUpCommand.MIN_PASSWORD_LENGTH) throw new Error('validation.password-too-short');
    this.password = props.password;
    const name = (props.fullName ?? '').trim();
    if (name.length < 3) throw new Error('validation.full-name-required');
    this.fullName = name;
    this.dni = new Dni(props.dni).value;
    this.phone = new Phone(props.phone).value;
    if (!props.roles?.length) throw new Error('validation.role-required');
    this.roles = [...props.roles];
    this.merchant = null;
    if (this.roles.includes(UserRole.MERCHANT)) this.merchant = SignUpCommand.merchantData(props);
  }

  static merchantData(props: { businessName?: string; ruc?: string; businessType?: string }): MerchantData {
    if (!props.businessName?.trim() || !props.businessType?.trim()) throw new Error('validation.merchant-data-required');
    return { businessName: props.businessName.trim(), ruc: new Ruc(props.ruc).value, businessType: props.businessType.trim() };
  }
}
