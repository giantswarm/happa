import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import { hasAppropriateLength } from 'lib/helpers';
import useValidatingInternalValue from 'lib/hooks/useValidatingInternalValue';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Constants, Providers } from 'shared/constants';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import { computeCapabilities } from 'stores/cluster/utils';
import { getFirstNodePoolsRelease, getProvider } from 'stores/main/selectors';
import Headline from 'UI/Display/Cluster/ClusterCreation/Headline';
import NameInput from 'UI/Display/Cluster/ClusterCreation/NameInput';
import Section from 'UI/Display/Cluster/ClusterCreation/Section';
import StyledInput, {
  AdditionalInputHint,
} from 'UI/Display/Cluster/ClusterCreation/StyledInput';
import { FlexColumn } from 'UI/Layout/FlexDivs';

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

interface INewClusterWrapperProps extends RouteComponentProps<{}> {}

const NewClusterWrapper: FC<INewClusterWrapperProps> = ({
  location,
  match,
}) => {
  const provider = useSelector(getProvider);
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

  const selectedOrganization = useMemo(() => {
    const route = RoutePath.parseWithTemplate(
      OrganizationsRoutes.Clusters.New,
      location.pathname
    );

    return route.params.orgId;
  }, [location.pathname]);

  const dispatch = useDispatch();

  const closeForm = () => {
    dispatch(push(MainRoutes.Home));
  };

  return (
    <Breadcrumb
      data={{
        title: 'CREATE CLUSTER',
        pathname: match.url,
      }}
    >
      <DocumentTitle title={`Create Cluster | ${selectedOrganization}`}>
        <>
          <Headline>Create a Cluster</Headline>
          <FlexColumn>
            <Section>
              <NameInput
                label='Name'
                inputId='cluster-name'
                value={clusterName}
                onChange={setClusterName}
                validationError={clusterNameValidationError}
              />
              <AdditionalInputHint>
                Give your cluster a name to recognize it among others.
              </AdditionalInputHint>
            </Section>
            <Section>
              <StyledInput
                inputId='release-version'
                label='Release version'
                // "breaking space" hides the hint
                hint={<>&#32;</>}
              >
                <ReleaseSelector
                  selectRelease={setSelectedRelease}
                  selectedRelease={selectedRelease}
                />
              </StyledInput>
            </Section>
          </FlexColumn>
          <CreationForm
            allowSubmit={clusterNameIsValid}
            selectedOrganization={selectedOrganization}
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

NewClusterWrapper.propTypes = {
  // @ts-ignore
  location: PropTypes.object.isRequired,
  // @ts-ignore
  match: PropTypes.object.isRequired,
};

export default NewClusterWrapper;
