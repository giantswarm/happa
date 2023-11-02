import { Box, Text } from 'grommet';
import { Cluster, NodePool } from 'MAPI/types';
import * as capav1beta2 from 'model/services/mapi/capav1beta2';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledIcon = styled(Text).attrs({
  role: 'presentation',
  'aria-hidden': true,
})`
  vertical-align: middle;
  line-height: 1;
`;

function getProviderInfo(res: Cluster | NodePool): {
  iconClassName: string;
  providerName: string;
} {
  let infrastructureRef = null;

  switch (res.kind) {
    case capiv1beta1.Cluster:
      infrastructureRef = res.spec?.infrastructureRef;
      break;

    case capiv1beta1.MachinePool:
      infrastructureRef = res.spec?.template.spec?.infrastructureRef;
      break;
  }

  if (!infrastructureRef) {
    return { iconClassName: '', providerName: '' };
  }

  const { kind } = infrastructureRef;

  switch (kind) {
    case capav1beta2.AWSManagedCluster:
    case capav1beta2.AWSManagedMachinePool:
      return { iconClassName: 'fa fa-eks', providerName: 'AWS' };

    default:
      return { iconClassName: '', providerName: '' };
  }
}

interface IImportedResourceNoteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  res: Cluster | NodePool;
  displayNote?: boolean;
}

const ImportedResourceNote: React.FC<
  React.PropsWithChildren<IImportedResourceNoteProps>
> = ({ res, displayNote = true, ...props }) => {
  const divElement = useRef<HTMLDivElement>(null);

  const { iconClassName, providerName } = getProviderInfo(res);

  return (
    <Box direction='row' align='center' {...props} ref={divElement}>
      {displayNote ? (
        <>
          <StyledIcon
            size='20px'
            margin={{ right: displayNote ? 'small' : 'none' }}
            className={iconClassName}
          />
          <Text size='xsmall'>Managed through {providerName}</Text>
        </>
      ) : (
        <TooltipContainer
          target={divElement}
          content={
            <Tooltip>
              <Text
                size='xsmall'
                color='text-strong'
                textAlign='center'
                wordBreak='break-word'
              >
                Managed through {providerName}.
              </Text>
            </Tooltip>
          }
        >
          <StyledIcon
            size='20px'
            margin={{ right: displayNote ? 'small' : 'none' }}
            className={iconClassName}
            aria-label={`Managed through ${providerName}.`}
          />
        </TooltipContainer>
      )}
    </Box>
  );
};

export default ImportedResourceNote;
