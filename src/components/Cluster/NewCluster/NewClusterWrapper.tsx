import { RELEASES_LOAD_REQUEST } from 'actions/actionTypes';
import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import useValidatingInternalValue from 'hooks/useValidatingInternalValue';
import { hasAppropriateLength } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import {
  getFirstNodePoolsRelease,
  getProvider,
} from 'selectors/mainInfoSelectors';
import cmp from 'semver-compare';
import { Constants, Providers } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
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

interface INewClusterWrapper {
  activeSortedReleases: string[];
  breadcrumbPathname: string;
  releases: IReleases;
  selectableReleases: IRelease[];
  selectedOrganization: string;
}

const NewClusterWrapper: FC<INewClusterWrapper> = ({
  activeSortedReleases,
  breadcrumbPathname,
  releases,
  selectableReleases,
  selectedOrganization,
}) => {
  const provider = useSelector(getProvider);
  const firstNodePoolsRelease = useSelector(getFirstNodePoolsRelease);
  const releasesLoadError = useSelector((state) =>
    selectErrorByAction(state, RELEASES_LOAD_REQUEST)
  );

  const [
    {
      internalValue: clusterName,
      isValid: clusterNameIsValid,
      validationError: clusterNameValidationError,
    },
    setClusterName,
  ] = useValidatingInternalValue('Unnamed cluster', clusterNameLengthValidator);
  const [selectedRelease, setSelectedRelease] = useState(
    activeSortedReleases[0]
  );

  const CreationForm = useMemo(() => {
    let semVerCompare = -1;
    if (selectedRelease && firstNodePoolsRelease) {
      semVerCompare = cmp(selectedRelease, firstNodePoolsRelease);
    }

    return semVerCompare < 0 ||
      provider === Providers.AZURE ||
      provider === Providers.KVM
      ? CreateRegularCluster // new v4 form
      : CreateNodePoolsCluster; // new v5 form
  }, [provider, firstNodePoolsRelease, selectedRelease]);

  const creationCapabilities = useMemo(
    () => computeCapabilities(selectedRelease, provider),
    [selectedRelease, provider]
  );

  const dispatch = useDispatch();

  const closeForm = () => {
    dispatch(push(AppRoutes.Home));
  };

  return (
    <Breadcrumb
      data={{
        title: 'CREATE CLUSTER',
        pathname: breadcrumbPathname,
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
                validationError={releasesLoadError}
              >
                <ReleaseSelector
                  selectRelease={setSelectedRelease}
                  selectedRelease={selectedRelease}
                  selectableReleases={selectableReleases}
                  releases={releases}
                />
              </StyledInput>
            </Section>
          </FlexColumn>
          <CreationForm
            allowSubmit={clusterNameIsValid}
            selectedOrganization={selectedOrganization}
            selectedRelease={selectedRelease}
            releases={releases}
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
  breadcrumbPathname: PropTypes.string.isRequired,
  selectedOrganization: PropTypes.string.isRequired,
  activeSortedReleases: PropTypes.arrayOf(PropTypes.string.isRequired)
    .isRequired,
  // @ts-ignore
  releases: PropTypes.object.isRequired,
  selectableReleases: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      changelog: PropTypes.arrayOf(
        PropTypes.shape({
          component: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
      components: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          version: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,
};

export default NewClusterWrapper;
