import { Code } from 'styles';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

const CopyButton = styled.div`
  opacity: 0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;

  &:hover {
    i {
      text-shadow: 0px 0px 15px ${props => props.theme.colors.shade1};
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

const getTooltip = text => <Tooltip id='tooltip'>{text}</Tooltip>;

const URIBlock = ({ children, title }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();
  const tooltipText = `Copy ${children} to clipboard.`;

  const copyToClipboard = () => {
    setClipboardContent(children);
  };
  const handleMouseLeave = () => setClipboardContent(null);

  return (
    <BlockWrapper onMouseLeave={handleMouseLeave}>
      {title && <span>{title}</span>}

      <Code>{children}</Code>

      {hasContentInClipboard ? (
        <i aria-hidden='true' className='fa fa-done' />
      ) : (
        <OverlayTrigger placement='top' overlay={getTooltip(tooltipText)}>
          <CopyButton onClick={copyToClipboard}>
            <i aria-hidden='true' className='fa fa-content-copy' />
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
  children: PropTypes.string,
  title: PropTypes.string,
};

export default URIBlock;
