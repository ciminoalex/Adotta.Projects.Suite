import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  code?: string; // Identificatore principale dell'utente (usato per update/delete)
  userCode?: string; // Codice utente (username)
  username?: string; // Alias per userCode (compatibilità con API response)
  email: string;
  userName: string;
  ruolo?: string;
  teamTecnico?: string;
  isActive?: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  addUser(user: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, user);
  }

  updateUser(user: UserDto): Observable<UserDto> {
    // Usa code come identificatore principale, fallback a userCode se code non è disponibile
    const identifier = user.code || user.userCode;
    if (!identifier) {
      throw new Error('Code o userCode è richiesto per aggiornare un utente');
    }
    return this.http.put<UserDto>(`${this.apiUrl}/${identifier}`, user);
  }

  deleteUser(userCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userCode}`);
  }
}

