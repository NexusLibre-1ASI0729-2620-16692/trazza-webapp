import { Ruc } from './ruc.value-object';
import { Phone } from './phone.value-object';

export interface MerchantProfileParams {
  id?: number | null;
  userId: number;
  businessName: string;
  contactName: string;
  ruc: Ruc;
  phone: Phone;
  verified?: boolean;
}

export class MerchantProfile {
  private _id: number | null;
  private _userId: number;
  private _businessName: string;
  private _contactName: string;
  private _ruc: Ruc;
  private _phone: Phone;
  private _verified: boolean;

  constructor(params: MerchantProfileParams) {
    if (!(params.ruc instanceof Ruc)) throw new Error('validation.ruc-invalid');
    if (!(params.phone instanceof Phone)) throw new Error('validation.phone-invalid');

    this._id = params.id ?? null;
    this._userId = params.userId;
    this._businessName = params.businessName.trim();
    this._contactName = params.contactName.trim();
    this._ruc = params.ruc;
    this._phone = params.phone;
    this._verified = params.verified ?? false;
  }

  get id(): number | null { return this._id; }
  get userId(): number { return this._userId; }
  get businessName(): string { return this._businessName; }
  get contactName(): string { return this._contactName; }
  get ruc(): Ruc { return this._ruc; }
  get phone(): Phone { return this._phone; }
  get verified(): boolean { return this._verified; }

  updateBusiness({ businessName, contactName, phone }: { businessName: string; contactName: string; phone: Phone }): void {
    this._businessName = businessName.trim();
    this._contactName = contactName.trim();
    this._phone = phone;
  }
}