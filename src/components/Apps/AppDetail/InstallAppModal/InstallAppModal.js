import { validateAppName } from 'Apps/AppDetail/InstallAppModal/utils';
import GenericModal from 'components/Modals/GenericModal';
import { push } from 'connected-react-router';
import yaml from 'js-yaml';
import RoutePath from 'lib/routePath';
import lunr from 'lunr';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { installApp } from 'stores/appcatalog/actions';
import { selectIsClusterAwaitingUpgrade } from 'stores/cluster/selectors';
import { isClusterCreating, isClusterUpdating } from 'stores/cluster/utils';
import { selectOrganizationByID } from 'stores/organization/selectors';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import ClusterPicker from './ClusterPicker';
import InstallAppForm from './InstallAppForm';

const InstallAppModal = (props) => {
  const CLUSTER_PICKER_PAGE = 'CLUSTER_PICKER_PAGE';
  const APP_FORM_PAGE = 'APP_FORM_PAGE';

  const pages = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clusterID, setClusterID] = useState(props.selectedClusterID);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [namespace, setNamespace] = useState('');
  const [namespaceError, setNamespaceError] = useState('');

  const [valuesYAML, setValuesYAML] = useState(null);
  const [valuesYAMLError, setValuesYAMLError] = useState('');

  const [secretsYAML, setSecretsYAML] = useState(null);
  const [secretsYAMLError, setSecretsYAMLError] = useState('');

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const [version, setVersion] = useState(props.app.versions[0].version);

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

  const onSelectCluster = (newClusterID) => {
    setClusterID(newClusterID);
    next();
  };

  const lunrIndex = lunr(function () {
    // eslint-disable-next-line react/no-this-in-sfc
    this.ref('id');
    // eslint-disable-next-line react/no-this-in-sfc
    this.field('name');
    // eslint-disable-next-line react/no-this-in-sfc
    this.field('owner');
    // eslint-disable-next-line react/no-this-in-sfc
    this.field('id');

    props.clusters.forEach(function (cluster) {
      // eslint-disable-next-line react/no-this-in-sfc
      this.add(cluster);
    }, this);
  });

  let clusters = props.clusters;

  if (query !== '') {
    clusters = lunrIndex
      .search(`${query.trim()} ${query.trim()}*`)
      .map((result) => {
        return props.clusters.find((cluster) => cluster.id === result.ref);
      });
  }

  const updateNamespace = useCallback(
    (ns) => {
      setNamespace(ns);
      setNamespaceError(validateAppName(ns).message);
    },
    [setNamespace, setNamespaceError]
  );

  const updateName = (newName) => {
    if (namespace === name) {
      // If name and namespace are synced up, keep them that way.
      updateNamespace(newName);
    }
    setName(newName);

    setNameError(validateAppName(newName).message);
  };

  const updateVersion = (newVersion) => {
    setVersion(newVersion);
  };

  const updateValuesYAML = (files) => {
    if (!files || files.length < 1) {
      setValuesYAML(null);
      setValuesYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsedYAML = yaml.load(e.target.result);
        setValuesYAML(parsedYAML);
        setValuesYAMLError('');
      } catch {
        setValuesYAMLError('Unable to parse valid YAML from this file.');
      }
    };

    reader.readAsText(files[0]);
  };

  const updateSecretsYAML = (files) => {
    if (!files || files.length < 1) {
      setSecretsYAML(null);
      setSecretsYAMLError('');

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsedYAML = yaml.load(e.target.result);
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

  const createApp = () => {
    setLoading(true);

    props
      .dispatch(
        installApp({
          app: {
            name: name,
            catalog: props.app.catalog,
            chartName: props.app.name,
            version: version,
            namespace: namespace,
            valuesYAML: valuesYAML,
            secretsYAML: secretsYAML,
          },
          clusterId: clusterID,
        })
      )
      .then(() => {
        const installedApp = props.clusters.find((c) => c.id === clusterID);
        const clusterDetailPath = RoutePath.createUsablePath(
          OrganizationsRoutes.Clusters.Detail.Apps,
          {
            orgId: installedApp.owner,
            clusterId: clusterID,
          }
        );

        onClose();
        props.dispatch(push(clusterDetailPath));
      })
      .catch(() => {
        setLoading(false);
      });
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
                  clusters={clusters}
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
                  secretsYAML={secretsYAML}
                  secretsYAMLError={secretsYAMLError}
                  valuesYAML={valuesYAML}
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
  app: PropTypes.object,
  clusters: PropTypes.array,
  dispatch: PropTypes.func,
  selectedClusterID: PropTypes.string,
};

function mapStateToProps(state) {
  const clusters = Object.keys(state.entities.clusters.items)
    .map((clusterID) => {
      const cluster = state.entities.clusters.items[clusterID];

      const isUpdating =
        isClusterUpdating(cluster) ||
        selectIsClusterAwaitingUpgrade(clusterID)(state);
      const isCreatingOrUpdating = isClusterCreating(cluster) || isUpdating;

      const organizationID =
        selectOrganizationByID(cluster.owner)(state)?.id ?? cluster.owner;

      return {
        id: clusterID,
        name: cluster.name,
        owner: organizationID,
        isAvailable: !cluster.status || !isCreatingOrUpdating,
        isDeleted: Boolean(cluster.delete_date),
      };
    })
    .filter(({ isDeleted }) => !isDeleted);

  return { clusters };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstallAppModal);
