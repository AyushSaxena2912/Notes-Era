import { AuthProvider } from "../models/user.model";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "student";
  college: string;
  year: string;
  mobileNumber: string;
  providers: AuthProvider[];
  emailVerified: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
