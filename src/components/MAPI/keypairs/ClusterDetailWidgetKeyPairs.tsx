import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as docs from 'model/constants/docs';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailCounter from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { isKeyPairActive } from './utils';

const StyledLink = styled.a`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetKeyPairsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {}

const ClusterDetailWidgetKeyPairs: React.FC<
  IClusterDetailWidgetKeyPairsProps
> = (props) => {
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  const keyPairListClient = useHttpClient();
  const auth = useAuthProvider();

  const { data: keyPairList, error: keyPairListError } = useSWR<
    legacyKeyPairs.IKeyPairList,
    GenericResponseError
  >(legacyKeyPairs.getKeyPairListKey(clusterId), () =>
    legacyKeyPairs.getKeyPairList(keyPairListClient, auth, clusterId)
  );

  useEffect(() => {
    if (keyPairListError) {
      ErrorReporter.getInstance().notify(keyPairListError);
    }
  }, [keyPairListError]);

  const activeKeyPairsCount = useMemo(() => {
    if (keyPairListError) return -1;
    if (!keyPairList) return undefined;

    return keyPairList.items.filter(isKeyPairActive).length;
  }, [keyPairList, keyPairListError]);

  const hasNoKeyPairs =
    typeof activeKeyPairsCount === 'number' && activeKeyPairsCount === 0;

  return (
    <ClusterDetailWidget
      title='Client certificates'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        justify: 'around',
      }}
      {...props}
    >
      {hasNoKeyPairs && (
        <Box fill={true} pad={{ bottom: 'xsmall' }}>
          <Text margin={{ bottom: 'small' }}>No client certificates</Text>
          <Text size='small'>
            Use{' '}
            <StyledLink
              target='_blank'
              href={docs.kubectlGSLoginURL}
              rel='noopener noreferrer'
            >
              kubectl gs login
            </StyledLink>{' '}
            to create one.
          </Text>
        </Box>
      )}

      {!hasNoKeyPairs && (
        <ClusterDetailCounter
          label='client certificate'
          pluralize={true}
          value={activeKeyPairsCount}
        />
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetKeyPairs;
