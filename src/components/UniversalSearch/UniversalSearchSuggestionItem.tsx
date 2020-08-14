import styled from '@emotion/styled';
import { IUniversalSearcherResult } from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
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
  extends React.ComponentPropsWithoutRef<'li'> {
  searchResult: IUniversalSearcherResult<unknown>;
}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = ({
  searchResult,
  ...rest
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const name = `${searchResult.type}: ${(searchResult.result as any).name}`;

  return (
    <SuggestionItem {...rest}>
      <SuggestionItemLink
        to=''
        role='option'
        tabIndex={-1}
        aria-selected='true'
      >
        {name}
      </SuggestionItemLink>
    </SuggestionItem>
  );
};

UniversalSearchSuggestionItem.propTypes = {
  // @ts-ignore
  searchResult: PropTypes.object.isRequired,
};

export default UniversalSearchSuggestionItem;
