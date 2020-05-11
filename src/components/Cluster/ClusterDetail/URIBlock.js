import styled from '@emotion/styled';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { CSSBreakpoints } from 'shared/constants/cssBreakpoints';
import { Code, mq } from 'styles';
import Truncated from 'UI/Truncated';

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

  &:hover {
    ${StatusIcon} {
      text-shadow: 0px 0px 15px ${props => props.theme.colors.shade1};
    }
  }
`;

const BlockWrapper = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  max-width: 100%;

  &:hover {
    ${CopyButton} {
      opacity: 0.7;

      &:hover {
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

const getTooltip = content => (
  <Tooltip id='tooltip'>
    Copy <Truncated>{content}</Truncated> to clipboard.
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

  return (
    <BlockWrapper {...props} onMouseLeave={handleMouseLeave}>
      {title && <Title>{title}</Title>}

      <CopyContent>
        <StyledCode>
          <CodeWrapper>{children}</CodeWrapper>
        </StyledCode>

        {hasContentInClipboard ? (
          <StatusIcon
            aria-hidden='true'
            className='fa fa-done'
            title='Content copied to clipboard'
          />
        ) : (
          <OverlayTrigger placement='top' overlay={getTooltip(content)}>
            <CopyButton onClick={copyToClipboard}>
              <StatusIcon
                aria-hidden='true'
                className='fa fa-content-copy'
                title='Copy content to clipboard'
              />
            </CopyButton>
          </OverlayTrigger>
        )}
      </CopyContent>
    </BlockWrapper>
  );
};

URIBlock.defaultProps = {
  children: '',
};

URIBlock.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.string,
  copyContent: PropTypes.string,
};

export default URIBlock;
