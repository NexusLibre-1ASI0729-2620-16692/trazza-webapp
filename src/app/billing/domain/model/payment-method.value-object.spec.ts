import {PaymentMethod} from './payment-method.value-object';

describe('PaymentMethod', () => {
  it('detects visa cards that pass the Luhn check', () => {
    const method = PaymentMethod.fromCard({ number: '4242 4242 4242 4242', holderName: 'Valeria Torres', expiry: '12/30' });
    expect(method.brand).toBe('visa');
    expect(method.label).toBe('VISA •••• 4242');
  });

  it('rejects numbers that fail the Luhn check', () => {
    expect(() => PaymentMethod.fromCard({ number: '4242 4242 4242 4241', holderName: 'Valeria Torres', expiry: '12/30' }))
      .toThrowError('validation.card-number-invalid');
  });

  it('rejects expired cards', () => {
    expect(() => PaymentMethod.fromCard({ number: '4242 4242 4242 4242', holderName: 'Valeria Torres', expiry: '01/20' }))
      .toThrowError('validation.card-expired');
  });
});
