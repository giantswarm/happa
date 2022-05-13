import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import { Box } from 'grommet';
import { Constants, Providers } from 'model/constants';
import { MainRoutes } from 'model/constants/routes';
import { computeCapabilities } from 'model/stores/cluster/utils';
import {
  getFirstNodePoolsRelease,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import { selectOrganizationByID } from 'model/stores/organization/selectors';
import {
  getReleases,
  getReleasesError,
  getReleasesIsFetching,
} from 'model/stores/releases/selectors';
import React, { FC, useMemo, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import Headline from 'UI/Display/Cluster/ClusterCreation/Headline';
import InputGroup from 'UI/Inputs/InputGroup';
import TextInput from 'UI/Inputs/TextInput';
import { FlexColumn } from 'UI/Layout/FlexDivs';
import { hasAppropriateLength } from 'utils/helpers';
import useValidatingInternalValue from 'utils/hooks/useValidatingInternalValue';
import { compare } from 'utils/semver';

import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';
import ReleaseSelector from './ReleaseSelector/ReleaseSelector';

const clusterNameLengthValidator: IValidationFunction = (value) => {
  const { isValid, message } = hasAppropriateLength(
    value,
    Constants.MIN_NAME_LENGTH,
    Constants.MAX_NAME_LENGTH
  );

  return {
    isValid,
    validationError: message,
  };
};

interface INewClusterWrapperProps {}

const NewClusterWrapper: FC<
  React.PropsWithChildren<INewClusterWrapperProps>
> = () => {
  const match = useRouteMatch<{ orgId: string }>();
  const { orgId } = match.params;

  const provider = window.config.info.general.provider;
  const firstNodePoolsRelease = useSelector(getFirstNodePoolsRelease);

  const [
    {
      internalValue: clusterName,
      isValid: clusterNameIsValid,
      validationError: clusterNameValidationError,
    },
    setClusterName,
  ] = useValidatingInternalValue('Unnamed cluster', clusterNameLengthValidator);
  const [selectedRelease, setSelectedRelease] = useState('');
  const makeCapabilities = useSelector(computeCapabilities);

  const CreationForm = useMemo(() => {
    if (provider === Providers.KVM) {
      return CreateRegularCluster;
    }

    if (
      firstNodePoolsRelease !== '' &&
      compare(selectedRelease, firstNodePoolsRelease) >= 0
    ) {
      return CreateNodePoolsCluster;
    }

    return CreateRegularCluster;
  }, [provider, firstNodePoolsRelease, selectedRelease]);

  const creationCapabilities = useMemo(
    () => makeCapabilities(selectedRelease, provider),
    [selectedRelease, provider, makeCapabilities]
  );

  const dispatch = useDispatch();

  const closeForm = () => {
    dispatch(push(MainRoutes.Home));
  };

  const releases = useSelector(getReleases);
  const releasesIsFetching = useSelector(getReleasesIsFetching);
  const releasesError = useSelector(getReleasesError);

  const isAdmin = useSelector(getUserIsAdmin);

  const selectedOrganization = useSelector(selectOrganizationByID(orgId));
  const selectedOrganizationName =
    selectedOrganization?.name ?? selectedOrganization?.id ?? '';

  return (
    <Breadcrumb
      data={{
        title: 'CREATE CLUSTER',
        pathname: match.url,
      }}
    >
      <DocumentTitle title={`Create Cluster | ${orgId}`}>
        <>
          <Headline>Create a Cluster</Headline>
          <FlexColumn>
            <Box direction='column' gap='medium'>
              <InputGroup label='Name' htmlFor='cluster-name'>
                <TextInput
                  id='cluster-name'
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  error={clusterNameValidationError}
                  help='Give your cluster a name to recognize it among others.'
                />
              </InputGroup>
              <InputGroup label='Release version'>
                <ReleaseSelector
                  selectRelease={setSelectedRelease}
                  selectedRelease={selectedRelease}
                  releases={releases}
                  errorMessage={releasesError?.toString()}
                  isAdmin={isAdmin}
                  isLoading={releasesIsFetching}
                />
              </InputGroup>
            </Box>
          </FlexColumn>
          <CreationForm
            allowSubmit={clusterNameIsValid}
            selectedOrganization={selectedOrganizationName}
            selectedRelease={selectedRelease}
            clusterName={clusterName}
            capabilities={creationCapabilities}
            closeForm={closeForm}
          />
        </>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default NewClusterWrapper;
