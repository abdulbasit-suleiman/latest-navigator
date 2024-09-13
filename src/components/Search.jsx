import React, { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate, useLocation } from 'react-router-dom';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
  
    const updateUrl = useCallback((term) => {
      const params = new URLSearchParams(location.search);
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      navigate({ search: params.toString() }, { replace: true });
    }, [navigate, location.search]);
  
    const debouncedUpdateUrl = useDebouncedCallback((term) => {
      updateUrl(term);
    }, 500);
  
    useEffect(() => {
      debouncedUpdateUrl(searchTerm);
    }, [searchTerm, debouncedUpdateUrl]);
  
    return (
        <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
            placeholder="Search for a building"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
        />
    );
};

export default Search;
