export interface User {
  id?: number;
  username: string;
  email: string;
  userName: string; // SAP single field
  ruolo?: string;
  isActive?: boolean;
}

export interface Session {
  sessionId: string;
  version?: string;
  sessionTimeout?: number;
  user?: User;
  expiresAt: Date;
}

export interface LoginRequest {
  companyDB?: string;
  userName: string;
  password: string;
}

export interface LoginResponse {
  sessionId: string;
  version?: string;
  sessionTimeout: number;
}

