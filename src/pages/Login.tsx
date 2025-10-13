import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success('Успешный вход в систему');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
      toast.error(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  const demoAccounts = authService.getMockUsers();

  const getRoleInfo = (role: string) => {
    const info: Record<string, { label: string; color: string; icon: string; permissions: string[] }> = {
      admin: {
        label: 'Администратор',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: 'Shield',
        permissions: ['Полный доступ ко всем разделам', 'Управление пользователями', 'Финансы и отчёты', 'Настройки системы']
      },
      manager: {
        label: 'Менеджер',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: 'Briefcase',
        permissions: ['Заявки и клиенты', 'Склад и техники', 'График работы', 'Финансы и отчёты']
      },
      technician: {
        label: 'Техник',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: 'Wrench',
        permissions: ['Просмотр заявок', 'Работа с заявками', 'Просмотр дашборда']
      },
      receptionist: {
        label: 'Администратор',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: 'UserCheck',
        permissions: ['Приём заявок', 'Работа с клиентами', 'Просмотр дашборда']
      }
    };
    return info[role] || info.receptionist;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Icon name="Wrench" className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Вход в систему</CardTitle>
                <CardDescription>Система управления ремонтом</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <Icon name="AlertCircle" className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Войти
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Демо-аккаунты</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                >
                  <Icon name={showDemoAccounts ? 'ChevronUp' : 'ChevronDown'} className="h-4 w-4" />
                </Button>
              </div>
              
              {showDemoAccounts && (
                <div className="space-y-2">
                  {demoAccounts.map((account, index) => {
                    const roleInfo = getRoleInfo(account.role);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickLogin(account.username, account.password)}
                        className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg ${roleInfo.color} flex items-center justify-center`}>
                              <Icon name={roleInfo.icon} className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{account.fullName}</div>
                              <div className="text-xs text-muted-foreground">
                                {account.username} / {account.password}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={roleInfo.color}>
                            {roleInfo.label}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Роли и права доступа</CardTitle>
            <CardDescription className="text-blue-100">
              Система с полным разграничением прав
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoAccounts.map((account, index) => {
              const roleInfo = getRoleInfo(account.role);
              return (
                <div key={index} className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon name={roleInfo.icon} className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{roleInfo.label}</div>
                      <div className="text-sm text-blue-100">{account.fullName}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {roleInfo.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-blue-50">
                        <Icon name="Check" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-white/20">
              <div className="flex items-start gap-2 text-sm text-blue-100">
                <Icon name="Shield" className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white mb-1">Безопасность</div>
                  <div>Автоматический выход через 24 часа неактивности. Все действия логируются.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
