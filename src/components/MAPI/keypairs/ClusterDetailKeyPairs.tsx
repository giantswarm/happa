import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import CertificateOrgsLabel from 'Cluster/ClusterDetail/CertificateOrgsLabel';
import { Box, Text } from 'grommet';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { Cluster } from 'MAPI/types';
import {
  extractErrorMessage,
  fetchCluster,
  fetchClusterKey,
  supportsClientCertificates,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import Copyable from 'shared/Copyable';
import DocumentTitle from 'shared/DocumentTitle';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import Date from 'UI/Display/Date';
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
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import CreateKeyPairGuide from '../clusters/guides/CreateKeyPairGuide';
import ClusterDetailKeyPairDetailsModal from './ClusterDetailKeyPairDetailsModal';
import { usePermissionsForKeyPairs } from './permissions/usePermissionsForKeyPairs';
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
    <Date
      relative={true}
      color={isExpiringSoon ? 'status-warning' : undefined}
      value={expirationDate}
    />
  );
};

interface IClusterDetailKeyPairsProps {}

const ClusterDetailKeyPairs: React.FC<IClusterDetailKeyPairsProps> = () => {
  const { pathname } = useLocation();
  const { clusterId, orgId } =
    useParams<{ clusterId: string; orgId: string }>();

  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const namespace = selectedOrg?.namespace;

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const keyPairListClient = useRef(clientFactory());

  const { canGet: canGetKeyPairs, canCreate: canCreateKeyPairs } =
    usePermissionsForKeyPairs(provider, namespace ?? '');

  const keyPairListKey = canGetKeyPairs
    ? legacyKeyPairs.getKeyPairListKey(clusterId)
    : null;

  const {
    data: keyPairList,
    error: keyPairListError,
    isValidating: keyPairListIsValidating,
  } = useSWR<legacyKeyPairs.IKeyPairList, GenericResponseError>(
    keyPairListKey,
    () =>
      legacyKeyPairs.getKeyPairList(keyPairListClient.current, auth, clusterId)
  );

  const keyPairListIsLoading =
    typeof keyPairList === 'undefined' &&
    typeof keyPairListError === 'undefined' &&
    keyPairListIsValidating;

  useEffect(() => {
    if (keyPairListError) {
      new FlashMessage(
        'There was a problem loading client certificates.',
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(keyPairListError)
      );

      ErrorReporter.getInstance().notify(keyPairListError);
    }
  }, [keyPairListError]);

  const displayKeyPairPlaceholder =
    !canGetKeyPairs ||
    (!keyPairListIsLoading && keyPairList?.items.length === 0);

  const [selectedKeyPairSerial, setSelectedKeyPairSerial] = useState('');

  const selectedKeyPair = useMemo(() => {
    if (!keyPairList) return undefined;

    return keyPairList.items.find(
      (i) => i.serial_number === selectedKeyPairSerial
    );
  }, [keyPairList, selectedKeyPairSerial]);

  const [selectedKeyPairExpirationDate, isSelectedKeyPairExpiringSoon] =
    useMemo(() => {
      if (!selectedKeyPair) return [undefined, false];

      const expirationDate =
        getKeyPairExpirationDate(selectedKeyPair).toISOString();
      const isExpiringSoon = isKeyPairExpiringSoon(selectedKeyPair);

      return [expirationDate, isExpiringSoon];
    }, [selectedKeyPair]);

  const handleOpenDetails = (serial: string) => () => {
    setSelectedKeyPairSerial(serial);
  };

  const handleCloseDetails = () => {
    setSelectedKeyPairSerial('');
  };

  const { canGet: canGetCluster } = usePermissionsForClusters(
    provider,
    namespace ?? ''
  );

  const clusterKey =
    canGetCluster && namespace
      ? fetchClusterKey(provider, namespace, clusterId)
      : null;

  // The error is handled in the parent component.
  const { data: cluster } = useSWR<Cluster, GenericResponseError>(
    clusterKey,
    () => fetchCluster(clientFactory, auth, provider, namespace!, clusterId)
  );

  const canCreateClientCertificatesForCluster = cluster
    ? supportsClientCertificates(cluster)
    : false;

  return (
    <DocumentTitle title={`Client Certificates | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'CLIENT CERTIFICATES',
          pathname,
        }}
      >
        <>
          <Box>
            <Box gap='small'>
              <Text>
                Client certificates consist of an RSA private key and an X.509
                certificate, signed by the certificate authority (CA) belonging
                to this cluster. They are used for access to the cluster via the
                Kubernetes API.
              </Text>
              <Text>
                <i
                  className='fa fa-info'
                  aria-hidden={true}
                  role='presentation'
                />{' '}
                <strong>Caution:</strong> This list does not include client
                certificates created via the <code>kubectl gs login</code>{' '}
                command or directly via CertConfig resources.
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

                {canGetKeyPairs &&
                  !keyPairListIsLoading &&
                  keyPairList?.items.map((keyPair) => (
                    <TableRow key={keyPair.serial_number}>
                      <TableCell size='large'>
                        {formatCommonName(keyPair.common_name)}
                      </TableCell>
                      <TableCell size='small'>
                        {formatOrganization(keyPair.certificate_organizations)}
                      </TableCell>
                      <TableCell size='small'>
                        <Date relative={true} value={keyPair.create_date} />
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

                {displayKeyPairPlaceholder && (
                  <TableRow>
                    <TableCell>
                      <Text color='text-weak'>
                        There are no client certificates to display.
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
            {canCreateClientCertificatesForCluster && (
              <CreateKeyPairGuide
                clusterName={clusterId}
                organizationName={orgId}
                canCreateKeyPairs={canCreateKeyPairs}
              />
            )}
          </Box>
        </>
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default ClusterDetailKeyPairs;
