import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import useValidatingInternalValue from 'hooks/useValidatingInternalValue';
import { hasAppropriateLength } from 'lib/helpers';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import {
  getFirstNodePoolsRelease,
  getProvider,
} from 'selectors/mainInfoSelectors';
import cmp from 'semver-compare';
import { Constants, Providers } from 'shared/constants';
import { AppRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import Headline from 'UI/ClusterCreation/Headline';
import NameInput from 'UI/ClusterCreation/NameInput';
import Section from 'UI/ClusterCreation/Section';
import StyledInput, {
  AdditionalInputHint,
} from 'UI/ClusterCreation/StyledInput';
import { FlexColumn } from 'UI/FlexDivs';
import { computeCapabilities } from 'utils/clusterUtils';

import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';
import ReleaseSelector from './ReleaseSelector/ReleaseSelector';

const clusterNameLengthValidator: IValidationFunction = (value) => {
  const [isValid, validationError] = hasAppropriateLength(
    value,
    Constants.MIN_NAME_LENGTH,
    Constants.MAX_NAME_LENGTH
  );

  return {
    isValid: isValid as boolean,
    validationError: validationError as string,
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
      cmp(selectedRelease, firstNodePoolsRelease) >= 0
    ) {
      return CreateNodePoolsCluster;
    }

    return CreateRegularCluster;
  }, [provider, firstNodePoolsRelease, selectedRelease]);

  const creationCapabilities = useMemo(
    () => makeCapabilities(selectedRelease, provider),
    [selectedRelease, provider]
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
    dispatch(push(AppRoutes.Home));
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
