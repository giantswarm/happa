import styled from '@emotion/styled';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Code } from 'styles';

const StatusIcon = styled.i`
  width: 14px;
  height: 14px;
`;

const CopyButton = styled.div`
  opacity: 0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;

  &:hover {
    ${StatusIcon} {
      text-shadow: 0px 0px 15px ${(props) => props.theme.colors.shade1};
    }
  }
`;

const BlockWrapper = styled.div`
  display: inline-block;

  &:hover {
    ${CopyButton} {
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }
`;

const StyledCode = styled(Code)`
  width: 100%;
`;

const getTooltip = (text) => <Tooltip id='tooltip'>{text}</Tooltip>;

// eslint-disable-next-line react/no-multi-comp
const URIBlock = ({ children, title, copyContent, ...props }) => {
  const content = copyContent ?? children;
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();
  const tooltipText = `Copy ${content} to clipboard.`;

  const copyToClipboard = () => {
    setClipboardContent(content);
  };
  const handleMouseLeave = () => setClipboardContent(null);

  return (
    <BlockWrapper {...props} onMouseLeave={handleMouseLeave}>
      {title && <span>{title}</span>}

      <StyledCode>{children}</StyledCode>

      {hasContentInClipboard ? (
        <StatusIcon
          aria-hidden='true'
          className='fa fa-done'
          title='Content copied to clipboard'
        />
      ) : (
        <OverlayTrigger placement='top' overlay={getTooltip(tooltipText)}>
          <CopyButton onClick={copyToClipboard}>
            <StatusIcon
              aria-hidden='true'
              className='fa fa-content-copy'
              title='Copy content to clipboard'
            />
          </CopyButton>
        </OverlayTrigger>
      )}
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
