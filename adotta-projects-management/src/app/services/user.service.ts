import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  id?: number;
  userCode?: string;
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
    return this.http.put<UserDto>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

