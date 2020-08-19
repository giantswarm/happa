import styled from '@emotion/styled';
import { push } from 'connected-react-router';
import useDebounce from 'lib/effects/useDebounce';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Constants } from 'shared';
import UniversalSearchInput from 'UniversalSearch/UniversalSearchInput';
import { useUniversalSearch } from 'UniversalSearch/UniversalSearchProvider';
import UniversalSearchSuggestionList from 'UniversalSearch/UniversalSearchSuggestionList';

const DELAY_BEFORE_CLOSE_MS = 250;

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

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearchTerm = useDebounce(
    searchTerm,
    Constants.UNIVERSAL_SEARCH_UPDATE_DELAY_MS
  );

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
    }, DELAY_BEFORE_CLOSE_MS);
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

        if (selectedIndex < searchResults.length - 1) {
          e.preventDefault();

          setSelectedIndex(selectedIndex + 1);
        }

        break;

      case 'Enter':
        if (
          isOpened &&
          selectedIndex > -1 &&
          selectedIndex < searchResults.length
        ) {
          e.preventDefault();

          const activeResult = searchResults[selectedIndex];
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
        searchResults={searchResults}
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
