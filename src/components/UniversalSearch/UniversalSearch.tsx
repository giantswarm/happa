import styled from '@emotion/styled';
import { push } from 'connected-react-router';
import useDebounce from 'lib/effects/useDebounce';
import { IUniversalSearcherResult } from 'lib/UniversalSearcher/UniversalSearcher';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import UniversalSearchInput from 'UniversalSearch/UniversalSearchInput';
import { useUniversalSearch } from 'UniversalSearch/UniversalSearchProvider';
import UniversalSearchSuggestionList from 'UniversalSearch/UniversalSearchSuggestionList';

const UPDATE_DEBOUNCE_DELAY_MS = 250;

const SearchWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
  position: relative;
  line-height: initial;
`;

interface IUniversalSearchProps extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearch: React.FC<IUniversalSearchProps> = React.memo((props) => {
  const { searchTerm, search, searchResults, filters } = useUniversalSearch();
  const debouncedSearchTerm: string = useDebounce(
    searchTerm,
    UPDATE_DEBOUNCE_DELAY_MS
  );
  const debouncedResults: IUniversalSearcherResult<unknown>[] = useDebounce(
    searchResults,
    UPDATE_DEBOUNCE_DELAY_MS
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const dispatch = useDispatch();

  useEffect(() => {
    if (debouncedSearchTerm.length > 0 && isFocused) {
      setIsOpened(true);
    }

    if (debouncedSearchTerm.length < 1 || !isFocused) {
      setIsOpened(false);
    }

    setSelectedIndex(-1);
  }, [debouncedSearchTerm, isFocused]);

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, UPDATE_DEBOUNCE_DELAY_MS);
  };

  const handleClear = () => {
    search('');
  };

  const handleResultHover = (index: number) => {
    setSelectedIndex(index === selectedIndex ? -1 : index);
  };

  const handleResultClick = () => {
    handleClear();
    searchInputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        setIsOpened(false);

        break;

      case 'ArrowUp':
        if (isOpened && selectedIndex > 0) {
          e.preventDefault();
          setSelectedIndex(selectedIndex - 1);
        }

        break;

      case 'ArrowDown':
        if (!isOpened) {
          e.preventDefault();
          setIsOpened(true);

          break;
        }

        if (selectedIndex < debouncedResults.length - 1) {
          e.preventDefault();

          setSelectedIndex(selectedIndex + 1);
        }

        break;

      case 'Enter':
        if (
          isOpened &&
          selectedIndex > -1 &&
          selectedIndex < debouncedResults.length
        ) {
          e.preventDefault();

          const activeResult = debouncedResults[selectedIndex];
          if (!activeResult) break;

          const activeFilter = filters[activeResult.type];
          const url = activeFilter.urlFactory(
            activeResult.result,
            debouncedSearchTerm
          );

          dispatch(push(url));
          handleResultClick();
        }

        break;
    }
  };

  return (
    <SearchWrapper {...props}>
      <UniversalSearchInput
        ref={searchInputRef}
        isOpened={isOpened}
        searchTerm={searchTerm}
        onFocus={() => setIsFocused(true)}
        onChange={search}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        inputId='universal-search'
      />
      <UniversalSearchSuggestionList
        searchResults={debouncedResults}
        searchTerm={debouncedSearchTerm}
        filters={filters}
        isOpened={isOpened}
        onResultClick={handleResultClick}
        onResultHover={handleResultHover}
        selectedIndex={selectedIndex}
        aria-labelledby='universal-search'
      />
    </SearchWrapper>
  );
});

UniversalSearch.propTypes = {};

export default UniversalSearch;
