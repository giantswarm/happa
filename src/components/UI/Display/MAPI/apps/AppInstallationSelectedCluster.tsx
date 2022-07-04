import { Anchor, Box, BoxProps, Keyboard, Paragraph } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledParagraph = styled(Paragraph)`
  line-height: 1.1;
`;

const StyledAnchor = styled(Anchor)`
  :focus {
    outline: 0;
  }

  :focus:not(:focus-visible) {
    box-shadow: none;
  }

  i:focus {
    outline: 0;
  }
`;

interface IAppInstallationSelectedClusterProps extends BoxProps {
  clusterName: string;
  onDeselectCluster: () => void;
}

const AppInstallationSelectedCluster: React.FC<
  React.PropsWithChildren<IAppInstallationSelectedClusterProps>
> = ({ clusterName, onDeselectCluster, ...props }) => {
  return (
    <Box
      role='status'
      direction='row'
      justify='between'
      align='center'
      flex='grow'
      min-height='xxsmall'
      pad='small'
      round='xsmall'
      background='background-accent'
      {...props}
    >
      <StyledParagraph fill margin='none'>
        <i className='fa fa-info' role='presentation' aria-hidden='true' /> Your
        selected cluster is{' '}
        <ClusterIDLabel
          clusterID={clusterName}
          variant={ClusterIDLabelType.Name}
        />{' '}
        and install status will be shown for this cluster.
      </StyledParagraph>

      <Box>
        <Keyboard onSpace={onDeselectCluster} onEnter={onDeselectCluster}>
          <StyledAnchor
            size='large'
            role='button'
            tabIndex={0}
            onClick={onDeselectCluster}
          >
            <TooltipContainer
              content={<Tooltip>Deselect this cluster</Tooltip>}
            >
              <i
                className='fa fa-close'
                role='presentation'
                title={`Deselect cluster ${clusterName}`}
              />
            </TooltipContainer>
          </StyledAnchor>
        </Keyboard>
      </Box>
    </Box>
  );
};

export default AppInstallationSelectedCluster;
