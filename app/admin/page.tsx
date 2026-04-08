'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings');
  }, [router]);

  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Redirecionando...</p>
    </div>
  );
}
