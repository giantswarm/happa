import { Box, Heading, Keyboard, Text } from 'grommet';
import * as docs from 'lib/docs';
import useDebounce from 'lib/hooks/useDebounce';
import {
  OrganizationNameStatusMessage,
  validateOrganizationName,
} from 'MAPI/organizations/utils';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import TextInput from 'UI/Inputs/TextInput';
import Well from 'UI/Layout/Well';

import ClusterDetailWidgetOptionalValue from '../MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';

const VALIDATION_ERROR_DEBOUNCE_MS = 500;

const StyledTableRow = styled(TableRow)`
  :hover,
  :focus-visible {
    background: ${({ theme }) => theme.global.colors.border.dark};
  }
`;

interface IOrganization {
  name: string;
  clusterCount?: number;
}

interface IOrganizationIndexPageProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizations: IOrganization[];
  onClickRow: (name: string) => void;
  onCreateOrg: (name: string) => Promise<void>;
}

const OrganizationListPage: React.FC<IOrganizationIndexPageProps> = ({
  organizations,
  onClickRow,
  onCreateOrg,
}) => {
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const [hasTyped, setHasTyped] = useState(false);

  const validationMessage = useMemo(() => {
    if (!hasTyped) return OrganizationNameStatusMessage.Ok;

    return validateOrganizationName(newOrgName).statusMessage;
  }, [hasTyped, newOrgName]);

  const debouncedValidationMessage = useDebounce(
    validationMessage,
    VALIDATION_ERROR_DEBOUNCE_MS
  );
  const isValid = validationMessage.length < 1;

  const resetForm = () => {
    setHasTyped(false);
    setCreating(false);
    setCreateOrgOpen(false);
    setNewOrgName('');
  };

  const onChangeOrgName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasTyped) {
      setHasTyped(true);
    }

    setNewOrgName(e.target.value);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    if (!isValid) return;

    setCreating(true);
    await onCreateOrg(newOrgName);

    resetForm();
  };

  return (
    <Box direction='column' gap='medium'>
      <Box direction='column' gap='medium' margin={{ bottom: 'medium' }}>
        <Heading margin='none'>Your Organizations</Heading>
        <Text>
          Organizations help you manage clusters and apps for different
          purposes, projects, or teams. Learn more in our{' '}
          <a
            href={docs.organizationsExplainedURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            documentation{' '}
            <i
              className='fa fa-open-in-new'
              aria-hidden={true}
              role='presentation'
              aria-label='Opens in a new tab'
            />
          </a>
          .
        </Text>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell size='small' align='center'>
              Clusters
            </TableCell>
          </TableRow>
        </TableHeader>
        <Keyboard onSpace={handleRowKeyDown} onEnter={handleRowKeyDown}>
          <TableBody>
            {organizations?.map((org) => (
              <StyledTableRow
                key={org.name}
                role='button'
                tabIndex={0}
                onClick={() => onClickRow(org.name)}
              >
                <TableCell>{org.name}</TableCell>
                <TableCell size='small' align='center' justify='center'>
                  <ClusterDetailWidgetOptionalValue
                    value={org.clusterCount}
                    loaderWidth={18}
                  >
                    {(value) => <Text>{value}</Text>}
                  </ClusterDetailWidgetOptionalValue>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Keyboard>
      </Table>

      {createOrgOpen && (
        <Well>
          <Box
            direction='column'
            gap='small'
            margin={{ bottom: 'none' }}
            pad='small'
          >
            <Heading level={2} margin='none'>
              Create an organization
            </Heading>
            <Text margin={{ bottom: 'small' }}>
              This will create a new Organization CR and a namespace in the
              management cluster. Some name restrictions apply.
            </Text>
            <form onSubmit={handleSubmit}>
              <Box
                margin={{
                  bottom: !debouncedValidationMessage ? 'medium' : undefined,
                }}
              >
                <TextInput
                  label='Name'
                  onChange={onChangeOrgName}
                  value={newOrgName}
                  error={debouncedValidationMessage}
                  autoFocus={true}
                />
              </Box>

              <Box direction='row' margin={{ bottom: 'none' }}>
                <Button
                  bsStyle='primary'
                  type='submit'
                  loading={creating}
                  disabled={!isValid}
                >
                  Create
                </Button>
                {!creating && <Button onClick={resetForm}>Cancel</Button>}
              </Box>
            </form>
          </Box>
        </Well>
      )}

      {!createOrgOpen && (
        <Box>
          <Button
            bsStyle='default'
            onClick={() => {
              setCreateOrgOpen(true);
            }}
          >
            <i
              className='fa fa-add-circle'
              aria-hidden={true}
              role='presentation'
            />{' '}
            Add Organization
          </Button>
        </Box>
      )}
    </Box>
  );
};

OrganizationListPage.propTypes = {
  organizations: PropTypes.array.isRequired,
  onClickRow: PropTypes.func.isRequired,
  onCreateOrg: PropTypes.func.isRequired,
};

export default OrganizationListPage;
