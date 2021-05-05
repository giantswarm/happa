import { validateAppName } from 'Apps/AppDetail/InstallAppModal/utils';
import GenericModal from 'components/Modals/GenericModal';
import { push } from 'connected-react-router';
import yaml from 'js-yaml';
import useDebounce from 'lib/hooks/useDebounce';
import RoutePath from 'lib/routePath';
import lunr from 'lunr';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { installApp } from 'stores/appcatalog/actions';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { selectIsClusterAwaitingUpgrade } from 'stores/cluster/selectors';
import { isClusterCreating, isClusterUpdating } from 'stores/cluster/utils';
import { selectOrganizationByID } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import ClusterPicker from './ClusterPicker';
import InstallAppForm from './InstallAppForm';

function selectClusters(state: IState) {
  const clusters: Record<
    string,
    React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters'][0]
  > = {};

  for (const cluster of Object.values(state.entities.clusters.items)) {
    if (cluster.delete_date) continue;

    const isUpdating =
      isClusterUpdating(cluster) ||
      selectIsClusterAwaitingUpgrade(cluster.id)(state);
    const isCreatingOrUpdating = isClusterCreating(cluster) || isUpdating;

    const organizationID =
      selectOrganizationByID(cluster.owner)(state)?.id ?? cluster.owner;

    clusters[cluster.id] = {
      id: cluster.id,
      name: cluster.name!,
      owner: organizationID,
      isAvailable: !isCreatingOrUpdating,
    };
  }

  return clusters;
}

const SEARCH_DEBOUNCE_RATE = 250; // In ms.

const CLUSTER_PICKER_PAGE = 0;
const APP_FORM_PAGE = 1;
const pages: ReadonlyArray<number> = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];

interface IInstallAppModalApp {
  catalog: string;
  name: string;
  versions: IAppCatalogAppVersion[];
}

interface IInstallAppModalProps {
  app: IInstallAppModalApp;
  selectedClusterID: string | null;
}

const InstallAppModal: React.FC<IInstallAppModalProps> = (props) => {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clusterID, setClusterID] = useState(props.selectedClusterID);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [namespace, setNamespace] = useState('');
  const [namespaceError, setNamespaceError] = useState('');

  const [valuesYAML, setValuesYAML] = useState<string | null>(null);
  const [valuesYAMLError, setValuesYAMLError] = useState('');

  const [secretsYAML, setSecretsYAML] = useState<string | null>(null);
  const [secretsYAMLError, setSecretsYAMLError] = useState('');

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_RATE);

  const [version, setVersion] = useState(props.app.versions[0].version);

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const next = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const onClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    if (clusterID) {
      setPage(1);
    } else {
      setPage(0);
    }
    setName(props.app.name);
    setNameError('');
    setNamespace(props.app.name);
    setNamespaceError('');
    setVisible(true);
  };

  const onSelectCluster = (newClusterID: string) => {
    setClusterID(newClusterID);
    next();
  };

  const clusters = useSelector(selectClusters);
  const [filteredClusters, setFilteredClusters] = useState<
    React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters']
  >([]);

  const lunrIndex = useMemo(
    () =>
      lunr(function (this: lunr.Builder) {
        // eslint-disable-next-line react/no-this-in-sfc
        this.ref('id');
        // eslint-disable-next-line react/no-this-in-sfc
        this.field('name');
        // eslint-disable-next-line react/no-this-in-sfc
        this.field('owner');
        // eslint-disable-next-line react/no-this-in-sfc
        this.field('id');

        for (const cluster of Object.values(clusters)) {
          this.add(cluster);
        }
      }),
    [clusters]
  );

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setFilteredClusters(Object.values(clusters));

      return;
    }

    const clusterCollection = lunrIndex
      .search(`${debouncedQuery.trim()} ${debouncedQuery.trim()}*`)
      .map((result) => clusters[result.ref]);

    setFilteredClusters(clusterCollection);
  }, [lunrIndex, debouncedQuery, clusters]);

  const updateNamespace = useCallback(
    (ns) => {
      setNamespace(ns);
      setNamespaceError(validateAppName(ns).message);
    },
    [setNamespace, setNamespaceError]
  );

  const updateName = (newName: string) => {
    if (namespace === name) {
      // If name and namespace are synced up, keep them that way.
      updateNamespace(newName);
    }
    setName(newName);

    setNameError(validateAppName(newName).message);
  };

  const updateVersion = (newVersion: string) => {
    setVersion(newVersion);
  };

  const updateValuesYAML = (files: FileList | null) => {
    if (!files || files.length < 1) {
      setValuesYAML(null);
      setValuesYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const input = (e.target?.result as string) ?? '';
        const parsedYAML = yaml.load(input) as string;
        setValuesYAML(parsedYAML);
        setValuesYAMLError('');
      } catch {
        setValuesYAMLError('Unable to parse valid YAML from this file.');
      }
    };

    reader.readAsText(files[0]);
  };

  const updateSecretsYAML = (files: FileList | null) => {
    if (!files || files.length < 1) {
      setSecretsYAML(null);
      setSecretsYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const input = (e.target?.result as string) ?? '';
        const parsedYAML = yaml.load(input) as string;
        setSecretsYAML(parsedYAML);
        setSecretsYAMLError('');
      } catch {
        setSecretsYAMLError('Unable to parse valid YAML from this file.');
      }
    };

    reader.readAsText(files[0]);
  };

  const anyValidationErrors = () => {
    if (namespaceError !== '' || nameError !== '' || valuesYAMLError !== '') {
      return true;
    }

    return false;
  };

  const createApp = async () => {
    if (!clusterID) return;

    setLoading(true);

    try {
      await dispatch(
        installApp({
          app: {
            name: name,
            catalog: props.app.catalog,
            chartName: props.app.name,
            version: version,
            namespace: namespace,
            valuesYAML: valuesYAML ?? '',
            secretsYAML: secretsYAML ?? '',
          },
          clusterId: clusterID,
        })
      );

      const cluster = clusters[clusterID];
      const clusterDetailPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Apps,
        {
          orgId: cluster.owner,
          clusterId: clusterID,
        }
      );

      onClose();
      dispatch(push(clusterDetailPath));
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <>
      <Button bsStyle='primary' onClick={openModal}>
        <i className='fa fa-add-circle' />
        Install in Cluster
      </Button>
      {(() => {
        switch (pages[page]) {
          case CLUSTER_PICKER_PAGE:
            return (
              <GenericModal
                {...props}
                footer={
                  <Button bsStyle='link' onClick={onClose}>
                    Cancel
                  </Button>
                }
                onClose={onClose}
                title={`Install ${props.app.name}: Pick a cluster`}
                visible={visible}
              >
                <ClusterPicker
                  clusters={filteredClusters}
                  onChangeQuery={setQuery}
                  onSelectCluster={onSelectCluster}
                  query={query}
                  selectedClusterID={clusterID}
                />
              </GenericModal>
            );

          case APP_FORM_PAGE:
            return (
              <GenericModal
                {...props}
                footer={
                  <>
                    <Button
                      bsStyle='primary'
                      disabled={anyValidationErrors()}
                      loading={loading}
                      onClick={createApp}
                    >
                      Install App
                    </Button>
                    <Button bsStyle='link' onClick={previous}>
                      Pick a different Cluster
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </>
                }
                onClose={onClose}
                title={
                  <>
                    {`Install ${props.app.name} on`}{' '}
                    <ClusterIDLabel clusterID={clusterID} />
                  </>
                }
                visible={visible}
              >
                <InstallAppForm
                  appName={props.app.name}
                  name={name}
                  nameError={nameError}
                  namespace={namespace}
                  namespaceError={namespaceError}
                  version={version}
                  availableVersions={props.app.versions}
                  onChangeName={updateName}
                  onChangeNamespace={updateNamespace}
                  onChangeSecretsYAML={updateSecretsYAML}
                  onChangeValuesYAML={updateValuesYAML}
                  onChangeVersion={updateVersion}
                  secretsYAMLError={secretsYAMLError}
                  valuesYAMLError={valuesYAMLError}
                />
              </GenericModal>
            );
        }

        return null;
      })()}
    </>
  );
};

InstallAppModal.propTypes = {
  app: (PropTypes.object as PropTypes.Requireable<IInstallAppModalApp>)
    .isRequired,
  selectedClusterID: PropTypes.string,
};

export default InstallAppModal;
