import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from
'../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
export function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setIsLoading(true);
    try {
      const result = isLogin ?
      await login(username, password) :
      await register(username, password);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(
          isLogin ? 'Logged in successfully' : 'Registered successfully'
        );
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary p-3 rounded-full text-primary-foreground mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">RestaurantOS</h1>
          <p className="text-muted-foreground">Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin ?
              'Enter your credentials to access your dashboard' :
              'Register a new waiter account'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading} />
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading} />
                
              </div>

              {isLogin &&
              <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground mt-4">
                  <p className="font-medium mb-1 text-foreground">
                    Demo Credentials:
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      Manager:{' '}
                      <code className="bg-background px-1 rounded">
                        manager
                      </code>{' '}
                      /{' '}
                      <code className="bg-background px-1 rounded">
                        manager
                      </code>
                    </li>
                    <li>
                      Waiter:{' '}
                      <code className="bg-background px-1 rounded">
                        waiter1
                      </code>{' '}
                      /{' '}
                      <code className="bg-background px-1 rounded">
                        waiter1
                      </code>
                    </li>
                    <li>
                      Kitchen:{' '}
                      <code className="bg-background px-1 rounded">
                        kitchen
                      </code>{' '}
                      /{' '}
                      <code className="bg-background px-1 rounded">
                        kitchen
                      </code>
                    </li>
                  </ul>
                </div>
              }
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ?
                'Please wait...' :
                isLogin ?
                'Sign In' :
                'Register'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}>
                
                {isLogin ?
                "Don't have an account? Register" :
                'Already have an account? Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>);

}