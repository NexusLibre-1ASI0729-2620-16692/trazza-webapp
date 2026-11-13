export interface SignUpCommand {
  role: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  ruc?: string;
  dni?: string;
  companyName?: string;
}