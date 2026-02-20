'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { LoginCredentials } from '@/types/auth.types';

export const LoginForm = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!credentials.email.trim() || !credentials.password.trim()) {
        throw new Error('Email e senha são obrigatórios');
      }

      await authService.login(credentials);
      router.push('/painel');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha no login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Fullstack Chat
          </h1>
          <p className="text-center text-gray-400 mb-6">Entrar no chat</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-right">
              <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium text-sm transition">
                Criar uma conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
