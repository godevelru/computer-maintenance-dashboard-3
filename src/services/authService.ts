import { User, UserRole } from '@/types';

const STORAGE_KEY = 'auth_user';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const mockUsers: Array<{ username: string; password: string; user: User }> = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@repair.ru',
      role: 'admin',
      fullName: 'Администратор Системы',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    }
  },
  {
    username: 'manager',
    password: 'manager123',
    user: {
      id: '2',
      username: 'manager',
      email: 'manager@repair.ru',
      role: 'manager',
      fullName: 'Иванов Пётр Сергеевич',
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date()
    }
  },
  {
    username: 'tech',
    password: 'tech123',
    user: {
      id: '3',
      username: 'tech',
      email: 'tech@repair.ru',
      role: 'technician',
      fullName: 'Сидоров Алексей Иванович',
      createdAt: new Date('2024-03-01'),
      lastLogin: new Date()
    }
  },
  {
    username: 'reception',
    password: 'reception123',
    user: {
      id: '4',
      username: 'reception',
      email: 'reception@repair.ru',
      role: 'receptionist',
      fullName: 'Петрова Анна Викторовна',
      createdAt: new Date('2024-04-01'),
      lastLogin: new Date()
    }
  }
];

class AuthService {
  async login(username: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (!mockUser) {
      throw new Error('Неверный логин или пароль');
    }

    const user = {
      ...mockUser.user,
      lastLogin: new Date()
    };

    const sessionData = {
      user,
      expiresAt: Date.now() + SESSION_DURATION
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));

    return user;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    try {
      const sessionData = JSON.parse(data);
      
      if (Date.now() > sessionData.expiresAt) {
        this.logout();
        return null;
      }

      return {
        ...sessionData.user,
        createdAt: new Date(sessionData.user.createdAt),
        lastLogin: sessionData.user.lastLogin ? new Date(sessionData.user.lastLogin) : undefined
      };
    } catch {
      this.logout();
      return null;
    }
  }

  isSessionValid(): boolean {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    try {
      const sessionData = JSON.parse(data);
      return Date.now() < sessionData.expiresAt;
    } catch {
      return false;
    }
  }

  getMockUsers() {
    return mockUsers.map(({ username, password, user }) => ({
      username,
      password,
      role: user.role,
      fullName: user.fullName
    }));
  }
}

export const authService = new AuthService();
