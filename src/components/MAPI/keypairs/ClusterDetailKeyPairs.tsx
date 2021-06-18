import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import CertificateOrgsLabel from 'Cluster/ClusterDetail/CertificateOrgsLabel';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { relativeDate } from 'lib/helpers';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import Copyable from 'shared/Copyable';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterDetailWidgetLoadingPlaceholder from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetLoadingPlaceholder';
import NotAvailable from 'UI/Display/NotAvailable';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import Truncated from 'UI/Util/Truncated';

import { getKeyPairExpirationDate, isKeyPairExpiringSoon } from './utils';

const LOADING_COMPONENTS = new Array(4).fill(0);

function formatCommonName(value: string) {
  return (
    <Copyable copyText={value}>
      <Truncated numStart={20} numEnd={40}>
        {value}
      </Truncated>
    </Copyable>
  );
}

function formatOrganization(value: string) {
  if (!value) return <NotAvailable />;

  return (
    <Copyable copyText={value}>
      <CertificateOrgsLabel value={value} />
    </Copyable>
  );
}

const formatExpirationDate = (keyPair: legacyKeyPairs.IKeyPair) => {
  const expirationDate = getKeyPairExpirationDate(keyPair);
  const isExpiringSoon = isKeyPairExpiringSoon(keyPair);

  return (
    <Text color={isExpiringSoon ? 'status-warning' : undefined}>
      {relativeDate(expirationDate)}
    </Text>
  );
};

interface IClusterDetailKeyPairsProps {}

const ClusterDetailKeyPairs: React.FC<IClusterDetailKeyPairsProps> = () => {
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  const keyPairListClient = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: keyPairList,
    error: keyPairListError,
    isValidating: keyPairListIsValidating,
  } = useSWR<legacyKeyPairs.IKeyPairList, GenericResponseError>(
    legacyKeyPairs.getKeyPairListKey(clusterId),
    () => legacyKeyPairs.getKeyPairList(keyPairListClient, auth, clusterId)
  );

  const keyPairListIsLoading =
    typeof keyPairList === 'undefined' &&
    typeof keyPairListError === 'undefined' &&
    keyPairListIsValidating;

  useEffect(() => {
    if (keyPairListError) {
      new FlashMessage(
        'There was a problem loading key pairs.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(keyPairListError)
      );

      ErrorReporter.getInstance().notify(keyPairListError);
    }
  }, [keyPairListError]);

  return (
    <Box>
      <Box>
        <Text>
          Key pairs consist of an RSA private key and certificate, signed by the
          certificate authority (CA) belonging to this cluster. They are used
          for access to the cluster via the Kubernetes API.
        </Text>
      </Box>
      <Table width='100%' margin={{ top: 'medium' }}>
        <TableHeader>
          <TableRow>
            <TableCell>Common Name (CN)</TableCell>
            <TableCell>Organization (O)</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell />
          </TableRow>
        </TableHeader>
        <TableBody>
          {keyPairListIsLoading &&
            LOADING_COMPONENTS.map((_, i) => (
              <TableRow key={i}>
                <TableCell size='large'>
                  <ClusterDetailWidgetLoadingPlaceholder width={400} />
                </TableCell>
                <TableCell size='small'>
                  <ClusterDetailWidgetLoadingPlaceholder />
                </TableCell>
                <TableCell size='small'>
                  <ClusterDetailWidgetLoadingPlaceholder />
                </TableCell>
                <TableCell size='small'>
                  <ClusterDetailWidgetLoadingPlaceholder />
                </TableCell>
              </TableRow>
            ))}

          {!keyPairListIsLoading &&
            keyPairList!.items.map((keyPair) => (
              <TableRow key={keyPair.serial_number}>
                <TableCell size='large'>
                  {formatCommonName(keyPair.common_name)}
                </TableCell>
                <TableCell size='small'>
                  {formatOrganization(keyPair.certificate_organizations)}
                </TableCell>
                <TableCell size='small'>
                  {relativeDate(keyPair.create_date)}
                </TableCell>
                <TableCell size='small'>
                  {formatExpirationDate(keyPair)}
                </TableCell>
                <TableCell size='xsmall'>
                  <Button bsSize='sm'>Details</Button>
                </TableCell>
              </TableRow>
            ))}

          {!keyPairListIsLoading && keyPairList!.items.length === 0 && (
            <TableRow>
              <TableCell>
                <Text color='text-weak'>
                  There are no key pairs to display.
                </Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

ClusterDetailKeyPairs.propTypes = {};

export default ClusterDetailKeyPairs;
