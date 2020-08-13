import styled from '@emotion/styled';
import * as React from 'react';
import Input from 'UI/Inputs/Input';

const SearchWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
`;

const StyledInput = styled(Input)`
  width: 100%;
  max-width: 800px;
`;

interface IUniversalSearchProps extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearch: React.FC<IUniversalSearchProps> = () => {
  return (
    <SearchWrapper>
      <StyledInput
        icon='search'
        hint={<>&#32;</>}
        placeholder={`I'm looking for...`}
      />
    </SearchWrapper>
  );
};

UniversalSearch.propTypes = {};

export default UniversalSearch;
