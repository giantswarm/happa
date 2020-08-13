import styled from '@emotion/styled';
import * as React from 'react';
import { Link } from 'react-router-dom';

const SuggestionItem = styled.li``;

const SuggestionItemLink = styled(Link)`
  padding: 16px;
  box-sizing: border-box;
  line-height: initial;
  display: block;
`;

interface IUniversalSearchSuggestionItemProps
  extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = () => {
  return (
    <SuggestionItem>
      <SuggestionItemLink
        to=''
        role='option'
        tabIndex={-1}
        id='opt2'
        aria-selected='true'
      >
        cluster: Some option
      </SuggestionItemLink>
    </SuggestionItem>
  );
};

UniversalSearchSuggestionItem.propTypes = {};

export default UniversalSearchSuggestionItem;
