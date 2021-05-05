import ClusterPicker from 'Apps/AppDetail/InstallAppModal/ClusterPicker';
import InstallAppForm from 'Apps/AppDetail/InstallAppModal/InstallAppForm';
import { validateAppName } from 'Apps/AppDetail/InstallAppModal/utils';
import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import GenericModal from 'components/Modals/GenericModal';
import { push } from 'connected-react-router';
import yaml from 'js-yaml';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import useDebounce from 'lib/hooks/useDebounce';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { IState } from 'stores/state';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import { createApp, filterClusters } from './utils';

function mapClusterToClusterPickerInput(
  cluster: capiv1alpha3.ICluster
): React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters'][0] {
  return {
    id: cluster.metadata.name,
    name: capiv1alpha3.getClusterDescription(cluster),
    owner: capiv1alpha3.getClusterOrganization(cluster) ?? '',
    isAvailable: true,
  };
}

const SEARCH_DEBOUNCE_RATE = 250; // In ms.

const CLUSTER_PICKER_PAGE = 0;
const APP_FORM_PAGE = 1;
const pages: ReadonlyArray<number> = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];

interface IAppInstallModalApp {
  catalog: string;
  name: string;
  versions: IAppCatalogAppVersion[];
}

interface IAppInstallModalProps {
  app: IAppInstallModalApp;
  selectedClusterID: string | null;
}

const AppInstallModal: React.FC<IAppInstallModalProps> = (props) => {
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

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const clusterListClient = useRef(clientFactory());
  const { data: clusterList, error: clusterListError } = useSWR<
    capiv1alpha3.IClusterList,
    GenericResponse
  >(
    () => capiv1alpha3.getClusterListKey(),
    () => capiv1alpha3.getClusterList(clusterListClient.current, auth)
  );

  useEffect(() => {
    if (clusterListError) {
      new FlashMessage(
        'There was a problem loading clusters.',
        messageType.ERROR,
        messageTTL.FOREVER
      );
    }
  }, [clusterListError]);

  const [filteredClusters, setFilteredClusters] = useState<
    React.ComponentPropsWithoutRef<typeof ClusterPicker>['clusters']
  >([]);

  useEffect(() => {
    const clusterCollection = filterClusters(
      clusterList?.items ?? [],
      debouncedQuery
    ).map(mapClusterToClusterPickerInput);

    setFilteredClusters(clusterCollection);
  }, [debouncedQuery, clusterList]);

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
        setValuesYAML(yaml.dump(parsedYAML));
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
        setSecretsYAML(yaml.dump(parsedYAML));
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

  const installApp = async () => {
    if (!clusterID) return;

    const cluster = clusterList?.items.find(
      (c) => c.metadata.name === clusterID
    );
    if (!cluster) return;

    const organization = capiv1alpha3.getClusterOrganization(cluster);
    if (!organization) return;

    try {
      setLoading(true);

      await createApp(clientFactory(), auth, clusterID, {
        name: name,
        catalogName: props.app.catalog,
        chartName: props.app.name,
        version: version,
        namespace: namespace,
        configMapContents: valuesYAML ?? '',
        secretContents: secretsYAML ?? '',
      });

      setLoading(false);
      onClose();

      const clusterDetailPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Apps,
        {
          orgId: organization,
          clusterId: clusterID,
        }
      );

      dispatch(push(clusterDetailPath));
    } catch (error) {
      let errorMessage = '';
      switch (true) {
        case metav1.isStatusError(
          error?.data,
          metav1.K8sStatusErrorReasons.Invalid
        ):
          errorMessage = `Your input appears to be invalid. Please make sure all fields are filled in correctly.`;

          break;

        case metav1.isStatusError(
          error?.data,
          metav1.K8sStatusErrorReasons.NotFound
        ):
          errorMessage = `The cluster is not yet ready for app installation. Please try again in 5 to 10 minutes.`;

          break;

        case metav1.isStatusError(
          error?.data,
          metav1.K8sStatusErrorReasons.AlreadyExists
        ):
          errorMessage = `An app called <code>${name}</code> already exists on cluster <code>${clusterID}</code>`;

          break;

        default:
          errorMessage = `Something went wrong while trying to install your app. Please try again later or contact support: support@giantswarm.io`;
      }

      new FlashMessage(errorMessage, messageType.ERROR, messageTTL.LONG);

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
                footer={
                  <>
                    <Button
                      bsStyle='primary'
                      disabled={anyValidationErrors()}
                      loading={loading}
                      onClick={installApp}
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

AppInstallModal.propTypes = {
  app: (PropTypes.object as PropTypes.Requireable<IAppInstallModalApp>)
    .isRequired,
  selectedClusterID: PropTypes.string,
};

export default AppInstallModal;
