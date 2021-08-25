import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import CertificateOrgsLabel from 'Cluster/ClusterDetail/CertificateOrgsLabel';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { relativeDate } from 'lib/helpers';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';
import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useLocation, useParams } from 'react-router';
import Copyable from 'shared/Copyable';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import NotAvailable from 'UI/Display/NotAvailable';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import Truncated from 'UI/Util/Truncated';

import CreateKeyPairGuide from '../clusters/guides/CreateKeyPairGuide';
import ClusterDetailKeyPairDetailsModal from './ClusterDetailKeyPairDetailsModal';
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
  const { pathname } = useLocation();
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

  const [selectedKeyPairSerial, setSelectedKeyPairSerial] = useState('');

  const selectedKeyPair = useMemo(() => {
    if (!keyPairList) return undefined;

    return keyPairList.items.find(
      (i) => i.serial_number === selectedKeyPairSerial
    );
  }, [keyPairList, selectedKeyPairSerial]);

  const [
    selectedKeyPairExpirationDate,
    isSelectedKeyPairExpiringSoon,
  ] = useMemo(() => {
    if (!selectedKeyPair) return [undefined, false];

    const expirationDate = getKeyPairExpirationDate(
      selectedKeyPair
    ).toISOString();
    const isExpiringSoon = isKeyPairExpiringSoon(selectedKeyPair);

    return [expirationDate, isExpiringSoon];
  }, [selectedKeyPair]);

  const handleOpenDetails = (serial: string) => () => {
    setSelectedKeyPairSerial(serial);
  };

  const handleCloseDetails = () => {
    setSelectedKeyPairSerial('');
  };

  return (
    <DocumentTitle title={`Key Pairs | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'KEY PAIRS',
          pathname,
        }}
      >
        <Box>
          <Box>
            <Text>
              Key pairs consist of an RSA private key and certificate, signed by
              the certificate authority (CA) belonging to this cluster. They are
              used for access to the cluster via the Kubernetes API.
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
                      <LoadingPlaceholder width={400} />
                    </TableCell>
                    <TableCell size='small'>
                      <LoadingPlaceholder />
                    </TableCell>
                    <TableCell size='small'>
                      <LoadingPlaceholder />
                    </TableCell>
                    <TableCell size='small'>
                      <LoadingPlaceholder />
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
                      <Button
                        size='small'
                        onClick={handleOpenDetails(keyPair.serial_number)}
                      >
                        Details
                      </Button>
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

          <ClusterDetailKeyPairDetailsModal
            id={selectedKeyPair?.serial_number}
            commonName={selectedKeyPair?.common_name}
            organizations={selectedKeyPair?.certificate_organizations}
            creationDate={selectedKeyPair?.create_date}
            expirationDate={selectedKeyPairExpirationDate}
            isExpiringSoon={isSelectedKeyPairExpiringSoon}
            description={selectedKeyPair?.description}
            onClose={handleCloseDetails}
            visible={typeof selectedKeyPair !== 'undefined'}
          />
        </Box>

        <Box margin={{ top: 'large' }} direction='column' gap='small'>
          <CreateKeyPairGuide />
        </Box>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailKeyPairs;
