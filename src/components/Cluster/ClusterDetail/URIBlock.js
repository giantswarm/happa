import { Keyboard, Text } from 'grommet';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import { CSSBreakpoints } from 'model/constants/cssBreakpoints';
import React from 'react';
import styled from 'styled-components';
import { Code, mq } from 'styles';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import Truncated from 'UI/Util/Truncated';

const StatusIcon = styled.i`
  width: 14px;
  height: 14px;
  padding: 0 8px;
  display: block;
`;

const CopyButton = styled.div`
  opacity: 0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;

  &:hover,
  &:focus {
    ${StatusIcon} {
      text-shadow: 0px 0px 15px ${(props) => props.theme.colors.shade1};
    }
  }
`;

const BlockWrapper = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  max-width: 100%;

  &:hover,
  &:focus-within {
    ${CopyButton} {
      opacity: 0.7;

      &:hover,
      &:focus {
        opacity: 1;
      }
    }
  }
`;

const CopyContent = styled.div`
  flex: 0 1 auto;
  display: flex;
  max-width: 100%;
  align-items: center;
`;

const StyledCode = styled(Code)`
  margin-right: 8px;
  width: calc(100% - 8px + 8px + 14px);
  overflow: hidden;

  ${mq(CSSBreakpoints.Large)} {
    margin: 8px 0;
  }
`;

const CodeWrapper = styled.span`
  display: block;
  overflow-x: auto;
`;

const Title = styled.span`
  flex: 0 1 100px;
`;

const getTooltip = (content) => (
  <Tooltip>
    <Text size='xsmall'>
      Copy <Truncated>{content}</Truncated> to clipboard.
    </Text>
  </Tooltip>
);

// eslint-disable-next-line react/no-multi-comp
const URIBlock = ({ children, title, copyContent, ...props }) => {
  const content = copyContent ?? children;
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyToClipboard = () => {
    setClipboardContent(content);
  };
  const handleMouseLeave = () => setClipboardContent(null);

  const handleOnFocusKeyDown = (e) => {
    e.preventDefault();

    e.target.click();
  };

  return (
    <BlockWrapper {...props} onMouseLeave={handleMouseLeave}>
      {title && <Title>{title}</Title>}

      <Keyboard onSpace={handleOnFocusKeyDown} onEnter={handleOnFocusKeyDown}>
        <CopyContent>
          <StyledCode>
            <CodeWrapper>{children}</CodeWrapper>
          </StyledCode>

          {hasContentInClipboard ? (
            <StatusIcon
              className='fa fa-done'
              title='Content copied to clipboard'
            />
          ) : (
            <TooltipContainer content={getTooltip(content)}>
              <CopyButton onClick={copyToClipboard} role='button' tabIndex={0}>
                <StatusIcon
                  className='fa fa-content-copy'
                  title='Copy content to clipboard'
                />
              </CopyButton>
            </TooltipContainer>
          )}
        </CopyContent>
      </Keyboard>
    </BlockWrapper>
  );
};

URIBlock.defaultProps = {
  children: '',
};

export default URIBlock;
