import styled from '@emotion/styled';
import { push } from 'connected-react-router';
import useDebounce from 'lib/effects/useDebounce';
import { IUniversalSearcherResult } from 'lib/UniversalSearcher/UniversalSearcher';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Input from 'UI/Inputs/Input';
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

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
`;

const StyledInput = styled(Input)`
  width: 100%;
  margin-bottom: 0;
`;

const ClearButton = styled.div<{ isVisible?: boolean }>`
  position: absolute;
  z-index: 9;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto 0;
  padding: ${({ theme }) => theme.spacingPx * 2}px;
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.spacingPx * 5}px;
  user-select: none;
  opacity: ${({ isVisible, theme }) => (isVisible ? theme.disabledOpacity : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'all' : 'none')};
  transition: opacity 0.115s ease-out;
  will-change: opacity;

  &:hover {
    opacity: 1;
  }

  &:active {
    opacity: 0.4;
  }
`;

interface IUniversalSearchProps extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearch: React.FC<IUniversalSearchProps> = React.memo(
  ({ ...rest }) => {
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
      <SearchWrapper {...rest}>
        <InputWrapper>
          <StyledInput
            ref={searchInputRef}
            icon='search'
            hint={<>&#32;</>}
            onChange={search}
            value={searchTerm}
            placeholder={`I'm looking for...`}
            autoComplete='off'
            autoCapitalize='off'
            spellCheck='false'
            role='combobox'
            aria-haspopup={isOpened ? 'true' : 'false'}
            aria-autocomplete='list'
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <ClearButton
            role='button'
            onClick={handleClear}
            isVisible={searchTerm.length > 0}
          >
            <i className='fa fa-close' />
          </ClearButton>
        </InputWrapper>
        <UniversalSearchSuggestionList
          searchResults={debouncedResults}
          searchTerm={debouncedSearchTerm}
          filters={filters}
          isOpened={isOpened}
          onResultClick={handleResultClick}
          onResultHover={handleResultHover}
          selectedIndex={selectedIndex}
        />
      </SearchWrapper>
    );
  }
);

UniversalSearch.propTypes = {};

export default UniversalSearch;
