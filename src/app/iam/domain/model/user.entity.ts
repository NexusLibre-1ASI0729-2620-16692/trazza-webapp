import { Email } from './email.value-object';
import { Phone } from './phone.value-object';
import { UserRole } from './user-role.value-object';

export interface UserParams {
  id?: number | null;
  fullName: string;
  email: Email;
  phone: Phone;
  role: UserRole;
  createdAt?: string | null;
}

export class User {
  public static readonly MIN_NAME_LENGTH = 3;
  private _id: number | null;
  private _fullName: string;
  private _email: Email;
  private _phone: Phone;
  private _role: UserRole;
  private _createdAt: string | null;

  constructor(params: UserParams) {
    const normalizedName = (params.fullName ?? '').trim();
    if (normalizedName.length < User.MIN_NAME_LENGTH) throw new Error('validation.full-name-required');
    if (!(params.email instanceof Email)) throw new Error('validation.email-invalid');
    if (!(params.phone instanceof Phone)) throw new Error('validation.phone-invalid');
    if (!(params.role instanceof UserRole)) throw new Error('validation.role-invalid');

    this._id = params.id ?? null;
    this._fullName = normalizedName;
    this._email = params.email;
    this._phone = params.phone;
    this._role = params.role;
    this._createdAt = params.createdAt ?? null;
  }

  get id(): number | null { return this._id; }
  get fullName(): string { return this._fullName; }
  get firstName(): string { return this._fullName.split(' ')[0]; }
  get email(): Email { return this._email; }
  get phone(): Phone { return this._phone; }
  get role(): UserRole { return this._role; }
  get createdAt(): string | null { return this._createdAt; }
  get isCarrier(): boolean { return this._role.isCarrier; }
  get isMerchant(): boolean { return this._role.isMerchant; }

  updateContact(fullName: string, phone: Phone): void {
    const normalizedName = (fullName ?? '').trim();
    if (normalizedName.length < User.MIN_NAME_LENGTH) throw new Error('validation.full-name-required');
    if (!(phone instanceof Phone)) throw new Error('validation.phone-invalid');
    this._fullName = normalizedName;
    this._phone = phone;
  }
}