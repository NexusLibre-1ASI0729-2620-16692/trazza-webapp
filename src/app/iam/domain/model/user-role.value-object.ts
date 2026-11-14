export enum UserRole {
  CARRIER = 'CARRIER',
  MERCHANT = 'MERCHANT'
}

export const ALL_ROLES: readonly UserRole[] = Object.freeze([UserRole.CARRIER, UserRole.MERCHANT]);

export const isUserRole = (value: unknown): value is UserRole => ALL_ROLES.includes(value as UserRole);
