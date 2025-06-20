// This file should be created at: src/app/verify/[hash]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyWithHashPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to main verify page with hash as search param
    if (params?.hash) {
      router.replace(`/verify?hash=${encodeURIComponent(params.hash as string)}`);
    } else {
      router.replace('/verify');
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to verification page...</p>
      </div>
    </div>
  );
}