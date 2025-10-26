export interface User {
  id?: number;
  username: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo?: string;
  isActive?: boolean;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: Date;
}

