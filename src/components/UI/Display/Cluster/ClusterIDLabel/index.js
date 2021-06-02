import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';
import CachingColorHash from 'utils/cachingColorHash';

const colorHash = new CachingColorHash();

const Wrapper = styled.span`
  display: inline-block;

  &:hover,
  &:focus-within {
    i {
      opacity: 0.7;
    }
  }

  i {
    cursor: pointer;
    font-size: 14px;
    margin-left: 5px;
    margin-right: 5px;
    opacity: 0;

    &:hover,
    &:focus {
      opacity: 1;
      text-shadow: 0px 0px 15px ${(props) => props.theme.colors.shade1};
    }
  }
`;

const Label = styled.span`
  background-color: ${(props) => colorHash.calculateColor(props.clusterID)};
  font-family: ${(props) => props.theme.fontFamilies.console};
  padding: 0.2em 0.4em;
  border-radius: 0.2em;
`;

const ClusterIDLabel = ({ clusterID, copyEnabled }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyToClipboard = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setClipboardContent(clusterID);
  };

  let label = clusterID.substring(0, 5);
  if (label !== clusterID) {
    label = `${clusterID.substring(0, 4)}…`;
  }

  const labelComponent = (
    <Label clusterID={clusterID}>
      <OverlayTrigger
        overlay={
          <Tooltip id='idtooltip'>
            <>Cluster ID: {clusterID}</>
          </Tooltip>
        }
        placement='top'
      >
        <span aria-label={clusterID}>{label}</span>
      </OverlayTrigger>
    </Label>
  );

  return (
    <Wrapper onMouseLeave={() => setClipboardContent(null)}>
      {labelComponent}

      {copyEnabled &&
        (hasContentInClipboard ? (
          <i
            key='cluster-id-copy-button'
            aria-hidden='true'
            className='fa fa-done'
          />
        ) : (
          <OverlayTrigger
            overlay={<Tooltip id='tooltip'>Copy ID to clipboard</Tooltip>}
            placement='top'
          >
            <i
              key='cluster-id-copy-button'
              aria-hidden='true'
              className='fa fa-content-copy'
              onClick={copyToClipboard}
              role='button'
              tabIndex={0}
            />
          </OverlayTrigger>
        ))}
    </Wrapper>
  );
};

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string,
  copyEnabled: PropTypes.bool,
};

export default ClusterIDLabel;
