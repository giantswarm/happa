import { Box, DataTable, Heading, Text } from 'grommet';
import useDebounce from 'lib/hooks/useDebounce';
import {
  OrganizationNameStatusMessage,
  validateOrganizationName,
} from 'lib/organizationValidation';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';
import Well from 'UI/Layout/Well';

const VALIDATION_ERROR_DEBOUNCE_MS = 500;

interface IOrganizationIndexDataTableRow {
  name: string;
  clusters?: number;
  oldest_release?: string;
  newest_release?: string;
  oldest_k8s_version?: string;
  newest_k8s_version?: string;
  apps?: number;
  app_deployments?: number;
}
interface IOrganizationIndexPageProps {
  onClickRow: (name: string) => void;
  data: IOrganizationIndexDataTableRow[];
  createOrg: (name: string) => void;
}

const OrganizationListPage: React.FC<IOrganizationIndexPageProps> = (props) => {
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const orgNameInput = useRef<HTMLInputElement>(null);
  const [firstOpen, setFirstOpen] = useState(true);

  const validationResult = validateOrganizationName(newOrgName);
  let { statusMessage } = validationResult;
  const { valid } = validationResult;

  if (firstOpen) statusMessage = OrganizationNameStatusMessage.Ok;
  const debouncedStatusMessage = useDebounce(
    statusMessage,
    VALIDATION_ERROR_DEBOUNCE_MS
  );

  const resetForm = () => {
    setFirstOpen(true);
    setCreateOrgOpen(false);
    setNewOrgName('');
  };

  const onChangeOrgName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstOpen(false);
    setNewOrgName(e.target.value);
  };

  return (
    <>
      <Box direction='column' gap='small' margin={{ bottom: 'large' }}>
        <Heading margin='none'>Your Organizations</Heading>
        <Text margin={{ bottom: 'large' }}>
          Organizations help you manage clusters and apps for different
          purposes, projects, or teams. Learn more in our documentation
        </Text>

        <DataTable
          sortable={true}
          onClickRow={(e) => {
            e.preventDefault();
            props.onClickRow(e.datum.name);
          }}
          columns={[
            {
              property: 'name',
              header: 'Name',
              primary: true,
            },
            {
              property: 'clusters',
              header: 'Clusters',
              align: 'center',
            },
            {
              property: 'oldest_release',
              header: 'Oldest release',
              align: 'center',
            },
            {
              property: 'newest_release',
              header: 'Newest release',
              align: 'center',
            },
            {
              property: 'oldest_k8s_version',
              header: 'Oldest K8S Version',
              align: 'center',
            },
            {
              property: 'newest_k8s_version',
              header: 'Newest K8S Version',
              align: 'center',
            },
            {
              property: 'apps',
              header: 'Apps',
              align: 'center',
            },
            {
              property: 'app_deployments',
              header: 'App Deployments',
              align: 'center',
            },
          ]}
          data={props.data}
        />
      </Box>

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
              management cluster. Some name restrictins apply.
            </Text>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (valid) {
                  props.createOrg(newOrgName);
                  resetForm();
                  setNewOrgName('');
                  if (orgNameInput && orgNameInput.current) {
                    orgNameInput.current.blur();
                  }
                }
              }}
            >
              <TextInput
                label='Name'
                onChange={onChangeOrgName}
                value={newOrgName}
                info={!debouncedStatusMessage && <>&nbsp;</>}
                error={debouncedStatusMessage}
                autoFocus={true}
                id='orgname'
              />

              <Box direction='row' margin={{ bottom: 'none' }}>
                <Button
                  bsStyle='primary'
                  type='submit'
                  disabled={Boolean(debouncedStatusMessage) || !valid}
                >
                  Create
                </Button>
                <Button onClick={resetForm}>Cancel</Button>
              </Box>
            </form>
          </Box>
        </Well>
      )}

      {!createOrgOpen && (
        <Button
          bsStyle='default'
          onClick={() => {
            setCreateOrgOpen(true);
          }}
        >
          <i className='fa fa-add-circle' /> Add Organization
        </Button>
      )}
    </>
  );
};

OrganizationListPage.propTypes = {
  onClickRow: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  createOrg: PropTypes.func.isRequired,
};

export default OrganizationListPage;
