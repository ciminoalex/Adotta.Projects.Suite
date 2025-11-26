import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface UserDto {
  id?: number;
  userCode?: string;
  email: string;
  userName: string;
  ruolo?: string;
  teamTecnico?: string;
  isActive?: boolean;
  password?: string; // only for create/update in mock
}

@Injectable({ providedIn: 'root' })
export class MockUserService {
  private readonly apiUrl = '/api/users';
  private readonly mockData: MockDataService;

  constructor(mockData?: MockDataService) {
    this.mockData = mockData || MockDataService.getInstance();
  }

  getUsers(): Observable<UserDto[]> {
    const users = this.mockData.getUsers().map(u => ({
      id: u.id,
      userName: u.userName,
      email: u.email,
      ruolo: u.ruolo,
      teamTecnico: u.teamTecnico,
      isActive: u.isActive
    }));
    return of(users).pipe(delay(150));
  }

  addUser(user: UserDto): Observable<UserDto> {
    const created = this.mockData.addUser({
      id: undefined,
      userName: user.userName,
      password: user.password || 'changeme',
      email: user.email,
      ruolo: user.ruolo,
      teamTecnico: user.teamTecnico,
      isActive: user.isActive ?? true
    });
    const dto: UserDto = { ...created } as any;
    delete (dto as any).password;
    return of(dto).pipe(delay(150));
  }

  updateUser(user: UserDto): Observable<UserDto> {
    if (!user.id) throw new Error('Missing user id');
    const toUpdate: any = {
      id: user.id,
      userName: user.userName,
      password: user.password || this.mockData.findUser(user.id!)?.password || 'changeme',
      email: user.email,
      ruolo: user.ruolo,
      teamTecnico: user.teamTecnico,
      isActive: user.isActive
    };
    const updated = this.mockData.updateUser(user.id, toUpdate);
    const dto: UserDto = { ...updated } as any;
    delete (dto as any).password;
    return of(dto).pipe(delay(150));
  }

  deleteUser(id: number): Observable<void> {
    this.mockData.deleteUser(id);
    return of(void 0).pipe(delay(150));
  }
}


