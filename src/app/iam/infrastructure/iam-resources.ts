export interface IdentityResource {
  fullName: string;
  dniMasked: string;
  phone: string | null;
  kycStatus: string | null;
}

export interface AccountResource {
  id: string;
  email: string;
  roles: string[];
  identity: IdentityResource | null;
  carrierProfile: { id: string } | null;
  merchantProfile: { id: string; businessName: string; ruc: string; businessType: string } | null;
  createdAt: string | null;
}

export interface AuthenticatedSessionResource {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AccountResource;
}

export interface VehicleResource {
  id: string;
  plate: string;
  model: string;
  maxLoadKg: number;
  cargoLengthM: number;
  cargoWidthM: number;
  cargoHeightM: number;
  cargoVolumeM3: number | null;
  photoS3Key: string | null;
  isActive: boolean;
}

export interface DriverResource {
  id: number;
  fullName: string;
  sex: 'F' | 'M' | 'X' | null;
  experienceStars: number;
  isActive: boolean;
}

export interface SavedAddressResource {
  id: number;
  label: string;
  address: string;
  district: string | null;
  latitude: number;
  longitude: number;
}

export interface IdentityVerificationResource {
  id: number;
  provider: string;
  status: string;
  externalReference: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}
