'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    if (isAuthenticated) {
      // Redirect to painel if user is logged in
      router.push('/painel');
    } else {
      // Redirect to login if user is not logged in
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-gray-400">Redirecionando...</div>
    </div>
  );
}
