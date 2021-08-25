import { Box, Keyboard, Text } from 'grommet';
import { compare } from 'lib/semver';
import React, { FC, useEffect, useMemo, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { Constants } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
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

function getLatestReleaseVersion(
  releaseVersions: string[],
  releases: Record<string, IRelease>
): string | null {
  if (releaseVersions.length < 1) return null;

  for (const version of releaseVersions) {
    if (releases[version]?.active && !isPreRelease(version)) {
      return version;
    }
  }

  return releaseVersions[0];
}

const K8sReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin-left: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: 0;
`;

export interface IReleaseComponent {
  name: string;
  version: string;
}

export interface IRelease {
  components: IReleaseComponent[];
  version: string;
  active: boolean;
  timestamp: string;
  kubernetesVersion?: string;
  releaseNotesURL?: string;
  k8sVersionEOLDate?: string;
}

interface IReleaseSelectorProps {
  selectRelease: (releaseVersion: string) => void;
  releases: Record<string, IRelease>;
  selectedRelease: string;
  isLoading?: boolean;
  errorMessage?: string;
  isAdmin?: boolean;
  collapsible?: boolean;
  autoSelectLatest?: boolean;
  versionFilter?: (version: string) => boolean;
}

const ReleaseSelector: FC<IReleaseSelectorProps> = ({
  selectRelease,
  selectedRelease,
  collapsible,
  autoSelectLatest,
  versionFilter,
  releases,
  isLoading,
  errorMessage,
  isAdmin,
}) => {
  const sortedReleaseVersions = useMemo(() => {
    let releaseCollection = Object.keys(releases);
    if (versionFilter) {
      releaseCollection = releaseCollection.filter(versionFilter);
    }

    return releaseCollection.sort((a, b) => compare(b, a));
  }, [releases, versionFilter]);

  const allReleases = useMemo(() => {
    return sortedReleaseVersions.reduce(
      (acc: typeof releases, releaseVersion: string) => {
        acc[releaseVersion] = releases[releaseVersion];

        return acc;
      },
      {}
    );
  }, [releases, sortedReleaseVersions]);

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

  const handleKeyDownCancel = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setCollapsed(true);
  };

  if (errorMessage) {
    return (
      <div>
        <Text>
          There was an error loading releases.
          <br />
          {errorMessage}
          <br />
          Please try again later or contact support: support@giantswarm.io
        </Text>
      </div>
    );
  } else if (!selectedKubernetesVersion) {
    return (
      <div>
        <Text>
          There is no active release currently available for this platform.
        </Text>
      </div>
    );
  }

  return (
    <LoadingOverlay loading={isLoading}>
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
            <Box margin={{ vertical: 'xsmall' }}>
              <Text size='small' color='text-weak'>
                <i
                  className='fa fa-warning'
                  aria-hidden={true}
                  role='presentation'
                />{' '}
                Light font color indicates an inactive or wip release only
                available to Giant Swarm staff
              </Text>
            </Box>
          )}
          <Keyboard onEsc={handleKeyDownCancel}>
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
                    {...allReleases[version]}
                    isSelected={version === selectedRelease}
                    selectRelease={selectRelease}
                  />
                ))}
              </TableBody>
            </Table>
          </Keyboard>
        </>
      )}
    </LoadingOverlay>
  );
};

ReleaseSelector.defaultProps = {
  collapsible: true,
  autoSelectLatest: true,
};

export default ReleaseSelector;
