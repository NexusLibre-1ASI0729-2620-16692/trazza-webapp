export interface SignInCommand {
  email: string;
  password?: string; // Optional depending on auth strategy
}