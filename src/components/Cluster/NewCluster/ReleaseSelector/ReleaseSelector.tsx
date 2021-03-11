import PropTypes from 'prop-types';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { Constants } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { getUserIsAdmin } from 'stores/main/selectors';
import {
  getReleases,
  getReleasesError,
  getReleasesIsFetching,
  getSortedReleaseVersions,
} from 'stores/releases/selectors';
import {
  getKubernetesReleaseEOLStatus,
  isPreRelease,
} from 'stores/releases/utils';
import styled from 'styled-components';
import {
  ListToggler,
  SelectedDescription,
  SelectedItem,
  SelectedWrapper,
} from 'UI/Controls/ExpandableSelector/Selector';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';

import ReleaseRow from './ReleaseRow';

interface IReleaseSelector {
  selectRelease(releaseVersion: string): void;

  selectedRelease: string;
  collapsible?: boolean;
  autoSelectLatest?: boolean;
  versionFilter?: (version: string) => boolean;
}

const K8sReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin-left: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: 0;
`;

const ReleaseSelector: FC<IReleaseSelector> = ({
  selectRelease,
  selectedRelease,
  collapsible,
  autoSelectLatest,
  versionFilter,
}) => {
  const allReleases = useSelector(getReleases);
  let sortedReleaseVersions = useSelector(getSortedReleaseVersions);
  const releasesIsFetching = useSelector(getReleasesIsFetching);
  const releasesError = useSelector(getReleasesError);

  const isAdmin = useSelector(getUserIsAdmin);

  let releases = allReleases;
  if (versionFilter) {
    releases = Object.keys(releases)
      .filter(versionFilter)
      .reduce((acc: typeof releases, releaseVersion: string) => {
        acc[releaseVersion] = releases[releaseVersion];

        return acc;
      }, {});

    sortedReleaseVersions = sortedReleaseVersions.filter(versionFilter);
  }

  const selectedKubernetesVersion = useMemo(() => {
    const currentRelease = allReleases[selectedRelease];
    if (!currentRelease) return null;

    const { kubernetesVersion, k8sVersionEOLDate } = currentRelease;

    if (
      k8sVersionEOLDate &&
      !kubernetesVersion?.endsWith(Constants.APP_VERSION_EOL_SUFFIX)
    ) {
      const { isEol } = getKubernetesReleaseEOLStatus(k8sVersionEOLDate);
      if (isEol) {
        return `${kubernetesVersion} ${Constants.APP_VERSION_EOL_SUFFIX}`;
      }
    }

    return kubernetesVersion;
  }, [allReleases, selectedRelease]);

  useEffect(() => {
    if (autoSelectLatest && sortedReleaseVersions.length !== 0) {
      const firstActiveRelease = getLatestReleaseVersion(
        sortedReleaseVersions,
        allReleases
      );
      if (firstActiveRelease !== null) {
        selectRelease(firstActiveRelease);
      }
    }
  }, [allReleases, selectRelease, sortedReleaseVersions, autoSelectLatest]);

  const [collapsed, setCollapsed] = useState(collapsible as boolean);

  const handleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  const handleTabSelect = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      handleCollapse();
    }
  };

  if (releasesError) {
    return (
      <div>
        <p>
          There was an error loading releases.
          <br />
          {releasesError.toString()}
          <br />
          Please try again later or contact support: support@giantswarm.io
        </p>
      </div>
    );
  } else if (!selectedKubernetesVersion) {
    return (
      <div>
        <p>There is no active release currently available for this platform.</p>
      </div>
    );
  }

  return (
    <LoadingOverlay loading={releasesIsFetching}>
      <SelectedWrapper>
        <SelectedItem
          aria-label={`The currently selected version is ${selectedRelease}`}
        >
          <i className='fa fa-version-tag' /> {selectedRelease}
        </SelectedItem>
        <SelectedDescription>
          This release contains:
          <K8sReleaseComponentLabel
            name='kubernetes'
            version={selectedKubernetesVersion}
          />
        </SelectedDescription>
      </SelectedWrapper>
      <div>
        <RUMActionTarget
          name={
            collapsed ? RUMActions.ExpandReleases : RUMActions.CollapseReleases
          }
        >
          <ListToggler
            role='button'
            id='release-selector__toggler'
            aria-expanded={!collapsed}
            aria-labelledby='available-releases-label'
            tabIndex={0}
            onClick={handleCollapse}
            collapsible={collapsible as boolean}
            onKeyDown={handleTabSelect}
            title='Show/hide available releases'
          >
            {collapsible && (
              <i
                className={`fa fa-caret-${collapsed ? 'right' : 'bottom'}`}
                aria-hidden='true'
                aria-label='Toggle'
                role='presentation'
              />
            )}
            <span id='available-releases-label'>Available releases</span>
          </ListToggler>
        </RUMActionTarget>
      </div>
      {!collapsed && (
        <>
          {isAdmin && (
            <p>
              <i className='fa fa-warning' /> Light font color indicates an
              inactive or wip release only available to Giant Swarm staff
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell />
                <TableCell>Version</TableCell>
                <TableCell align='center'>Released</TableCell>
                <TableCell align='center'>Kubernetes</TableCell>
                <TableCell align='center'>Components</TableCell>
                <TableCell align='center'>Notes</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody
              role='radiogroup'
              tabIndex={-1}
              aria-labelledby='release-selector__toggler'
            >
              {sortedReleaseVersions.map((version) => (
                <ReleaseRow
                  key={version}
                  {...releases[version]}
                  isSelected={version === selectedRelease}
                  selectRelease={selectRelease}
                />
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </LoadingOverlay>
  );
};

ReleaseSelector.propTypes = {
  selectRelease: PropTypes.func.isRequired,
  selectedRelease: PropTypes.string.isRequired,
  collapsible: PropTypes.bool,
  autoSelectLatest: PropTypes.bool,
  versionFilter: PropTypes.func,
};

ReleaseSelector.defaultProps = {
  collapsible: true,
  autoSelectLatest: true,
};

export default ReleaseSelector;

function getLatestReleaseVersion(
  releaseVersions: string[],
  releaseMap: IReleases
): string | null {
  if (releaseVersions.length < 1) return null;

  for (const version of releaseVersions) {
    if (releaseMap[version]?.active && !isPreRelease(version)) {
      return version;
    }
  }

  return releaseVersions[0];
}
