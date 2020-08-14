import useDebounce from 'lib/effects/useDebounce';
import {
  IUniversalSearcher,
  IUniversalSearcherResult,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import React, { ReactNode, useContext, useState } from 'react';
import { useSelector } from 'react-redux';

const UPDATE_DEBOUNCE_DELAY_MS = 250;

interface IUniversalSearchContextValue {
  searchTerm: string;
  search(newTerm: string): void;
  search<T = unknown>(newTerm: string, type: string): void;
  searchResults: IUniversalSearcherResult<unknown>[];
}

const initialContextValue: IUniversalSearchContextValue = {
  searchTerm: '',
  search: () => {},
  searchResults: [],
};

const UniversalSearchContext = React.createContext<
  IUniversalSearchContextValue
>(initialContextValue);

export function useUniversalSearch() {
  return useContext(UniversalSearchContext);
}

interface IUniversalSearchProviderProps {
  controller: IUniversalSearcher;
  children: ReactNode;
}

const UniversalSearchProvider: React.FC<IUniversalSearchProviderProps> = ({
  children,
  controller,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialContextValue.searchTerm);
  const [results, setResults] = useState(initialContextValue.searchResults);
  const debouncedResults = useDebounce(results, UPDATE_DEBOUNCE_DELAY_MS);
  const globalState = useSelector((state) => state);

  const search = (term: string, type?: string) => {
    setSearchTerm(term);
    setResults(controller.search(term, globalState, type as string));
  };

  const contextValue: IUniversalSearchContextValue = {
    searchTerm,
    searchResults: debouncedResults,
    search,
  };

  return (
    <UniversalSearchContext.Provider value={contextValue}>
      {children}
    </UniversalSearchContext.Provider>
  );
};

UniversalSearchProvider.propTypes = {
  // @ts-ignore
  controller: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default UniversalSearchProvider;
