import { Box, Text } from 'grommet';
import React from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import Date from 'UI/Display/Date';
import NotAvailable from 'UI/Display/NotAvailable';
import Modal from 'UI/Layout/Modal';
import { getRelativeDateFromNow } from 'utils/helpers';

const Label = styled(Text).attrs({
  color: 'text-weak',
  size: 'small',
  margin: { bottom: 'xxsmall' },
})`
  text-transform: uppercase;
`;

interface IClusterDetailKeyPairDetailsModalProps {
  onClose: () => void;
  id?: string;
  commonName?: string;
  organizations?: string;
  creationDate?: string;
  expirationDate?: string;
  isExpiringSoon?: boolean;
  description?: string;
  visible?: boolean;
}

const ClusterDetailKeyPairDetailsModal: React.FC<IClusterDetailKeyPairDetailsModalProps> =
  ({
    id,
    commonName,
    organizations,
    creationDate,
    expirationDate,
    isExpiringSoon,
    description,
    onClose,
    visible,
  }) => {
    const title = `Client certificate details`;

    return (
      <Modal
        footer={<Button onClick={onClose}>Close</Button>}
        onClose={onClose}
        title={title}
        aria-label={title}
        visible={visible}
      >
        <Box direction='column' gap='medium'>
          <Box>
            <Label>ID</Label>
            {id ? (
              <Copyable copyText={id}>
                <Text>{id}</Text>
              </Copyable>
            ) : (
              <NotAvailable />
            )}
          </Box>
          <Box>
            <Label>Common Name (CN)</Label>
            {commonName ? (
              <Copyable copyText={commonName}>
                <Text>{commonName}</Text>
              </Copyable>
            ) : (
              <NotAvailable />
            )}
          </Box>
          <Box>
            <Label>Certificate Organizations (O)</Label>
            {organizations ? (
              <Copyable copyText={organizations}>
                <Text>{organizations}</Text>
              </Copyable>
            ) : (
              <NotAvailable />
            )}
          </Box>
          <Box>
            <Label>Created</Label>
            {creationDate ? (
              <Text>
                <Date value={creationDate} /> &ndash;{' '}
                {getRelativeDateFromNow(creationDate)}
              </Text>
            ) : (
              <NotAvailable />
            )}
          </Box>
          <Box>
            <Label>Expiry</Label>
            {expirationDate ? (
              <Text color={isExpiringSoon ? 'status-warning' : undefined}>
                <Date value={expirationDate} /> &ndash;{' '}
                {getRelativeDateFromNow(expirationDate)}
              </Text>
            ) : (
              <NotAvailable />
            )}
          </Box>
          <Box>
            <Label>Description</Label>
            {description ? <Text>{description}</Text> : <NotAvailable />}
          </Box>
        </Box>
      </Modal>
    );
  };

export default ClusterDetailKeyPairDetailsModal;
