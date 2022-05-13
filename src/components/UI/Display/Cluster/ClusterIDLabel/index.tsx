import { Keyboard } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import CachingColorHash from 'utils/cachingColorHash';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

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

const ClusterIDLabel: React.FC<
  React.PropsWithChildren<IClusterIDLabelProps>
> = ({ clusterID, copyEnabled, variant, ...props }) => {
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
      <TooltipContainer
        content={<Tooltip>{`Cluster ${variant}: ${clusterID}`}</Tooltip>}
      >
        <span aria-label={clusterID}>{label}</span>
      </TooltipContainer>
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
            <TooltipContainer
              content={<Tooltip>{`Copy ${variant} to clipboard`}</Tooltip>}
            >
              <i
                key='cluster-id-copy-button'
                className='fa fa-content-copy'
                onClick={copyToClipboard}
                role='button'
                tabIndex={0}
              />
            </TooltipContainer>
          ))}
      </Wrapper>
    </Keyboard>
  );
};

ClusterIDLabel.defaultProps = {
  variant: ClusterIDLabelType.ID,
};

export default ClusterIDLabel;
