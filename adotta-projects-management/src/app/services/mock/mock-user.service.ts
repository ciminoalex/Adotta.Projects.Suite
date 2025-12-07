import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface UserDto {
  code?: string;
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
      code: u.code,
      userCode: u.userCode,
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
      code: user.code || user.userCode,
      userCode: user.userCode,
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
    const userCode = user.code || user.userCode;
    if (!userCode) throw new Error('Missing user code');
    const existingUser = this.mockData.findUser(userCode);
    const toUpdate: any = {
      code: userCode,
      userCode: user.userCode,
      userName: user.userName,
      password: user.password || existingUser?.password || 'changeme',
      email: user.email,
      ruolo: user.ruolo,
      teamTecnico: user.teamTecnico,
      isActive: user.isActive
    };
    const updated = this.mockData.updateUser(userCode, toUpdate);
    const dto: UserDto = { ...updated } as any;
    delete (dto as any).password;
    return of(dto).pipe(delay(150));
  }

  deleteUser(userCode: string): Observable<void> {
    this.mockData.deleteUser(userCode);
    return of(void 0).pipe(delay(150));
  }
}


