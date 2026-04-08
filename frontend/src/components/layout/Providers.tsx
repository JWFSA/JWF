'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { showError } from '@/lib/swal';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000, placeholderData: undefined },
    },
    mutationCache: new MutationCache({
      onError: (error: any, _variables, _context, mutation) => {
        // Si la mutation ya tiene onError propio, no mostrar el global
        if (mutation.options.onError) return;
        const msg = error?.response?.data?.message ?? 'Error al realizar la operación';
        showError(msg);
      },
    }),
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
