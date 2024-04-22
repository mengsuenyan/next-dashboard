'use client';
import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
 
export default function NotFound() {
    const handleRefrech = () => {
        window.location.reload();
    };

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">Form Item Not Set</h2>
      <p>Could not create new invoice.</p>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={handleRefrech}
      >
        Go Back
      </button>
      {/* <Link
        href="/dashboard/invoices/create"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => refresh()}
      >
        Go Back
      </Link> */}
    </main>
  );
}