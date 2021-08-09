import { Box, Text } from 'grommet';
import { formatDate, getRelativeDateFromNow } from 'lib/helpers';
import GenericModal from 'Modals/GenericModal';
import PropTypes from 'prop-types';
import React from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import NotAvailable from 'UI/Display/NotAvailable';

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

const ClusterDetailKeyPairDetailsModal: React.FC<IClusterDetailKeyPairDetailsModalProps> = ({
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
  const title = `Key pair details`;

  return (
    <GenericModal
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
              {formatDate(creationDate)} &ndash;{' '}
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
              {formatDate(expirationDate)} &ndash;{' '}
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
    </GenericModal>
  );
};

ClusterDetailKeyPairDetailsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  id: PropTypes.string,
  commonName: PropTypes.string,
  organizations: PropTypes.string,
  creationDate: PropTypes.string,
  expirationDate: PropTypes.string,
  isExpiringSoon: PropTypes.bool,
  description: PropTypes.string,
  visible: PropTypes.bool,
};

export default ClusterDetailKeyPairDetailsModal;
