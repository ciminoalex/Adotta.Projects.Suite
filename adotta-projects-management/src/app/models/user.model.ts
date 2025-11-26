// Allineato con swagger.json API schemas (UserDto, LoginRequestDto, LoginResponseDto)

export interface User {
  id?: number;
  userCode?: string; // Codice utente (sostituisce username)
  email: string;
  userName: string; // Nome visualizzato
  ruolo?: string;
  teamTecnico?: string;
  isActive?: boolean;
  password?: string; // Solo per creazione/aggiornamento, non restituito nelle GET
}

export interface Session {
  sessionId: string;
  version?: string;
  sessionTimeout?: number;
  user?: User;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: Date;
  expiresInSeconds: number;
  user: User;
}
