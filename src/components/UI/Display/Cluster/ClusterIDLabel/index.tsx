import { Keyboard } from 'grommet';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';
import CachingColorHash from 'utils/cachingColorHash';

const colorHash = new CachingColorHash();

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;

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

const Label = styled.span<{ clusterID: string }>`
  background-color: ${(props) => colorHash.calculateColor(props.clusterID)};
  font-family: ${(props) => props.theme.fontFamilies.console};
  padding: 0.2em 0.4em;
  border-radius: 0.2em;
`;

export enum ClusterIDLabelType {
  Name = 'name',
  ID = 'ID',
}

interface IClusterIDLabelProps extends React.ComponentPropsWithoutRef<'span'> {
  clusterID: string;
  copyEnabled?: boolean;
  variant?: ClusterIDLabelType;
}

const ClusterIDLabel: React.FC<IClusterIDLabelProps> = ({
  clusterID,
  copyEnabled,
  variant = ClusterIDLabelType.ID,
  ...props
}) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyToClipboard = (e: React.MouseEvent<HTMLElement>) => {
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
          <Tooltip id='idtooltip'>{`Cluster ${variant}: ${clusterID}`}</Tooltip>
        }
        placement='top'
      >
        <span aria-label={clusterID}>{label}</span>
      </OverlayTrigger>
    </Label>
  );

  const handleOnFocusKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <Keyboard onSpace={handleOnFocusKeyDown} onEnter={handleOnFocusKeyDown}>
      <Wrapper onMouseLeave={() => setClipboardContent(null)} {...props}>
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
              overlay={
                <Tooltip id='tooltip'>{`Copy ${variant} to clipboard`}</Tooltip>
              }
              placement='top'
            >
              <i
                key='cluster-id-copy-button'
                className='fa fa-content-copy'
                onClick={copyToClipboard}
                role='button'
                tabIndex={0}
              />
            </OverlayTrigger>
          ))}
      </Wrapper>
    </Keyboard>
  );
};

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string.isRequired,
  copyEnabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(ClusterIDLabelType)),
};

export default ClusterIDLabel;
