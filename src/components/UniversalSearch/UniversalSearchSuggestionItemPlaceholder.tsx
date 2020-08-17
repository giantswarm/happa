import styled from '@emotion/styled';
import * as React from 'react';
import RendererWrapper from 'UniversalSearch/filters/RendererWrapper';

const Placeholder = styled.li``;

interface IUniversalSearchSuggestionItemPlaceholderProps
  extends React.ComponentPropsWithoutRef<'li'> {}

const UniversalSearchSuggestionItemPlaceholder: React.FC<IUniversalSearchSuggestionItemPlaceholderProps> = ({
  ...rest
}) => {
  return (
    <Placeholder {...rest}>
      <RendererWrapper>No results found for your query.</RendererWrapper>
    </Placeholder>
  );
};

UniversalSearchSuggestionItemPlaceholder.propTypes = {};

export default UniversalSearchSuggestionItemPlaceholder;
