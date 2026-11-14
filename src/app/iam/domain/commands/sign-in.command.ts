import {Email} from '../model/email.value-object';

export class SignInCommand {
  readonly email: string;
  readonly password: string;

  constructor({ email, password }: { email: string; password: string }) {
    this.email = new Email(email).value;
    if (!password) throw new Error('validation.password-required');
    this.password = password;
  }
}
