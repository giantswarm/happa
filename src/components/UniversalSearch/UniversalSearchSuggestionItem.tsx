import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearcherRenderer,
} from 'lib/UniversalSearcher/UniversalSearcher';
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
  searchTerm: string;
  renderer: UniversalSearcherRenderer<unknown>;
}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = ({
  searchResult,
  searchTerm,
  renderer,
  ...rest
}) => {
  return (
    <SuggestionItem {...rest}>
      <SuggestionItemLink
        to=''
        role='option'
        tabIndex={-1}
        aria-selected='true'
      >
        {renderer(searchResult.result, searchTerm, searchResult.type)}
      </SuggestionItemLink>
    </SuggestionItem>
  );
};

UniversalSearchSuggestionItem.propTypes = {
  // @ts-ignore
  searchResult: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  renderer: PropTypes.func.isRequired,
};

export default UniversalSearchSuggestionItem;
