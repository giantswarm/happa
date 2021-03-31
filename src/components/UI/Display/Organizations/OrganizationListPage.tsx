import { Box, DataTable, Heading, Text } from 'grommet';
import { organizationsExplainedURL } from 'lib/docs';
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
import Truncated from 'UI/Util/Truncated';

const VALIDATION_ERROR_DEBOUNCE_MS = 500;

interface IOrganizationIndexDataTableRow {
  name: string;
  clusterCount?: string;
  oldestRelease?: string;
  newestRelease?: string;
  oldestK8sVersion?: string;
  newestK8sVersion?: string;
  apps?: number;
  appDeployments?: number;
}
interface IOrganizationIndexPageProps {
  onClickRow: (name: string) => void;
  data?: IOrganizationIndexDataTableRow[];
  createOrg: (name: string) => Promise<void>;
}

interface ITextOrNaProps {
  text?: string | number | undefined | null;
}

// Returns 'n/a' if props.text is empty.
const TextOrNA: React.FC<ITextOrNaProps> = (props) => {
  return <span>{props.text ? props.text : 'n/a'}</span>;
};

TextOrNA.propTypes = {
  text: PropTypes.string,
};

const OrganizationListPage: React.FC<IOrganizationIndexPageProps> = (props) => {
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
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
    setCreating(false);
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
          purposes, projects, or teams. Learn more in our{' '}
          {/* TODO: @oponder,@marians find a meaningful target for this documentation link. */}
          <a
            href={organizationsExplainedURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            documentation <i className='fa fa-open-in-new' />
          </a>
          .
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
              render: (datum) => <Truncated as='span'>{datum.name}</Truncated>,
            },
            {
              property: 'clusters',
              header: 'Clusters',
              align: 'center',
              render: (datum) => <TextOrNA text={datum.clusterCount} />,
            },
            // TODO: @oponder: enable these in another PR when we have the data.
            // {
            //   property: 'oldest_release',
            //   header: 'Oldest release',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.oldestRelease} />,
            // },
            // {
            //   property: 'newest_release',
            //   header: 'Newest release',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.newestRelease} />,
            // },
            // {
            //   property: 'oldest_k8s_version',
            //   header: 'Oldest K8S Version',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.oldestK8sVersion} />,
            // },
            // {
            //   property: 'newest_k8s_version',
            //   header: 'Newest K8S Version',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.newestK8sVersion} />,
            // },
            // {
            //   property: 'apps',
            //   header: 'Apps',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.apps} />,
            // },
            // {
            //   property: 'app_deployments',
            //   header: 'App Deployments',
            //   align: 'center',
            //   render: (datum) => <TextOrNA text={datum.appDeployments} />,
            // },
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
              management cluster. Some name restrictions apply.
            </Text>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (valid) {
                  setCreating(true);
                  await props.createOrg(newOrgName);
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
                  loading={creating}
                  disabled={Boolean(debouncedStatusMessage) || !valid}
                >
                  Create
                </Button>
                {creating ? undefined : (
                  <Button onClick={resetForm}>Cancel</Button>
                )}
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
  data: PropTypes.array,
  createOrg: PropTypes.func.isRequired,
};

export default OrganizationListPage;
