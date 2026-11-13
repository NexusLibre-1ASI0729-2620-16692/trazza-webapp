import {LoyaltyAccount} from './loyalty-account.entity';
import {Rating} from './rating.entity';

describe('Reputation', () => {
  it('accepts whole scores from 1 to 5', () => {
    expect(() => Rating.assertScore(5)).not.toThrow();
    expect(() => Rating.assertScore(0)).toThrowError('validation.score-range');
    expect(() => Rating.assertScore(4.5)).toThrowError('validation.score-range');
  });

  it('redeems only positive whole points within the balance', () => {
    const account = new LoyaltyAccount({ balance: 12 });
    expect(() => account.assertCanRedeem(10)).not.toThrow();
    expect(() => account.assertCanRedeem(0)).toThrowError('validation.points-positive');
    expect(() => account.assertCanRedeem(13)).toThrowError('validation.points-insufficient');
  });
});
