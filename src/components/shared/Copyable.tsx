import { Keyboard } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

const TooltipWrapper = styled.div`
  top: 0px;
  right: 0px;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  opacity: 0;
`;

export const COPYABLE_PADDING = 20;
const Wrapper = styled.div`
  padding-right: ${COPYABLE_PADDING}px;
  position: relative;
  overflow: inherit;
  text-overflow: inherit;
  display: inherit;

  &:hover,
  &:focus-visible {
    ${TooltipWrapper} {
      opacity: 0.7;
    }
  }
`;

const Content = styled.div`
  position: relative;
  overflow: inherit;
  text-overflow: inherit;
  display: inherit;
`;

interface ICopyableProps extends React.ComponentPropsWithoutRef<'div'> {
  copyText: string;
}

const Copyable: React.FC<ICopyableProps> = ({ children, copyText }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const handleCopyToClipboard = () => {
    setClipboardContent(copyText);
  };

  const handleDisplayCopyingDone = () => {
    setClipboardContent(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    handleCopyToClipboard();
  };

  return (
    <Keyboard onSpace={handleKeyDown} onEnter={handleKeyDown}>
      <Wrapper
        onClick={handleCopyToClipboard}
        onMouseLeave={handleDisplayCopyingDone}
        style={{ cursor: 'pointer' }}
        title='Copy content to clipboard'
        tabIndex={0}
      >
        <Content>{children}</Content>

        <TooltipWrapper>
          {hasContentInClipboard ? (
            <i
              aria-hidden='true'
              className='fa fa-done'
              title='Content copied to clipboard'
            />
          ) : (
            <TooltipContainer content={<Tooltip>Copy to clipboard.</Tooltip>}>
              <i aria-hidden='true' className='fa fa-content-copy' />
            </TooltipContainer>
          )}
        </TooltipWrapper>
      </Wrapper>
    </Keyboard>
  );
};

export default Copyable;
