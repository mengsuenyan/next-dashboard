'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const curPath = usePathname();
  const {replace} = useRouter();

  function handleSearch(term: string) {
    const parms = new URLSearchParams(searchParams);

    parms.set('page', '1');
    if (term) {
      parms.set('query', term);
    } else {
      parms.delete('query');
    }

    replace(`${curPath}?${parms.toString()}`);
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onKeyDown={(k) => {
          if (k.key == 'Enter') {
            handleSearch(k.currentTarget.value)
          }
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
