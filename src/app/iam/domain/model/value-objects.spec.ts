import {Email} from './email.value-object';
import {Dni} from './dni.value-object';
import {LicensePlate} from './license-plate.value-object';

describe('IAM value objects', () => {
  it('normalises e-mails and rejects malformed ones', () => {
    expect(new Email('  Ana@Trazza.PE ').value).toBe('ana@trazza.pe');
    expect(() => new Email('ana@trazza')).toThrowError('validation.email-invalid');
  });

  it('accepts a DNI only with eight digits', () => {
    expect(new Dni('12345678').value).toBe('12345678');
    expect(() => new Dni('1234567')).toThrowError('validation.dni-invalid');
  });

  it('normalises licence plates to ABC-123', () => {
    expect(new LicensePlate('t5k 123').value).toBe('T5K-123');
    expect(new LicensePlate('abc-123').equals(new LicensePlate('ABC123'))).toBeTrue();
    expect(() => new LicensePlate('AB-12')).toThrowError('validation.plate-invalid');
  });
});
