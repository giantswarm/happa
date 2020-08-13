import styled from '@emotion/styled';
import * as React from 'react';
import UniversalSearchSuggestionItem from 'UniversalSearch/UniversalSearchSuggestionItem';

const SuggestionsWrapper = styled.div`
  position: absolute;
  top: 100%;
  width: 100%;
  max-width: 800px;
  background: ${({ theme }) => theme.colors.darkBlueDarker4};
  z-index: 99;
  border-radius: ${({ theme }) =>
    `0 0 ${theme.border_radius} ${theme.border_radius}`};
  padding-top: 8px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

interface IUniversalSearchSuggestionListProps
  extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearchSuggestionList: React.FC<IUniversalSearchSuggestionListProps> = () => {
  return (
    <SuggestionsWrapper>
      <SuggestionsList role='listbox'>
        <UniversalSearchSuggestionItem />
        <UniversalSearchSuggestionItem />
        <UniversalSearchSuggestionItem />
        <UniversalSearchSuggestionItem />
      </SuggestionsList>
    </SuggestionsWrapper>
  );
};

UniversalSearchSuggestionList.propTypes = {};

export default UniversalSearchSuggestionList;
