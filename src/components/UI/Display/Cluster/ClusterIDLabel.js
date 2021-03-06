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

  &:hover {
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

    &:hover {
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

  return (
    <Wrapper onMouseLeave={() => setClipboardContent(null)}>
      <Label clusterID={clusterID} title={`Unique Cluster ID: ${clusterID}`}>
        {clusterID}
      </Label>

      {copyEnabled &&
        (hasContentInClipboard ? (
          <i aria-hidden='true' className='fa fa-done' />
        ) : (
          <OverlayTrigger
            overlay={
              <Tooltip id='tooltip'>Copy {clusterID} to clipboard.</Tooltip>
            }
            placement='top'
          >
            <i
              aria-hidden='true'
              className='fa fa-content-copy'
              onClick={copyToClipboard}
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
