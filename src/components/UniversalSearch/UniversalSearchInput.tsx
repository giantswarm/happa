import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Input from 'UI/Inputs/Input';

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

interface IUniversalSearchInputProps
  extends React.ComponentPropsWithRef<typeof Input> {
  isOpened?: boolean;
  onClear?: () => void;
  searchTerm?: string;
}

const UniversalSearchInput: React.FC<IUniversalSearchInputProps> = React.forwardRef(
  ({ isOpened, onClear, searchTerm, ...rest }, ref) => {
    return (
      <InputWrapper>
        <StyledInput
          ref={ref}
          icon='search'
          hint={<>&#32;</>}
          value={searchTerm}
          placeholder={`I'm looking for…`}
          autoComplete='off'
          autoCapitalize='off'
          spellCheck='false'
          aria-label={`I'm looking for…`}
          aria-haspopup='true'
          aria-expanded={isOpened ? 'true' : 'false'}
          aria-autocomplete='list'
          {...rest}
        />
        <ClearButton
          role='button'
          aria-label='Clear'
          onClick={onClear}
          isVisible={(searchTerm as string).length > 0}
        >
          <i className='fa fa-close' role='presentation' aria-hidden='true' />
        </ClearButton>
      </InputWrapper>
    );
  }
);

UniversalSearchInput.propTypes = {
  isOpened: PropTypes.bool,
  onClear: PropTypes.func,
  searchTerm: PropTypes.string,
};

UniversalSearchInput.defaultProps = {
  isOpened: false,
};

export default UniversalSearchInput;
