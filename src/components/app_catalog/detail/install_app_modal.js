import { connect } from 'react-redux';
import Button from '../../shared/button';
import ClusterIDLabel from '../../shared/cluster_id_label';
import ClusterPicker from './cluster_picker';
import GenericModal from '../../modals/generic_modal';
import InstallAppForm from './install_app_form';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const InstallAppModal = props => {
  const CLUSTER_PICKER_PAGE = 'CLUSTER_PICKER_PAGE';
  const APP_FORM_PAGE = 'APP_FORM_PAGE';

  const pages = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clusterID, setClusterID] = useState('');

  const next = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  // const previous = () => {
  //   if (page > 0) {
  //     setPage(page - 1);
  //   }
  // };

  const onClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    setPage(0);
    setVisible(true);
  };

  const onSelectCluster = clusterID => {
    setClusterID(clusterID);
    next();
  };

  const createApp = () => {
    console.log('creating app');
    console.log(clusterID);
    onClose();
  };

  return (
    <React.Fragment>
      <Button onClick={openModal} bsStyle='primary'>
        Configure &amp; Install
      </Button>
      {(() => {
        switch (pages[page]) {
          case CLUSTER_PICKER_PAGE:
            return (
              <GenericModal
                {...props}
                visible={visible}
                onClose={onClose}
                title={'Install an App: Pick a cluster'}
                footer={
                  <React.Fragment>
                    <Button bsStyle='primary' onClick={next}>
                      Next
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </React.Fragment>
                }
              >
                <ClusterPicker
                  selectedClusterID={clusterID}
                  clusters={props.clusters}
                  onSelectCluster={onSelectCluster}
                />
              </GenericModal>
            );

          case APP_FORM_PAGE:
            return (
              <GenericModal
                {...props}
                visible={visible}
                onClose={onClose}
                title={
                  <React.Fragment>
                    Install an App on <ClusterIDLabel clusterID={clusterID} />
                  </React.Fragment>
                }
                footer={
                  <React.Fragment>
                    <Button bsStyle='primary' onClick={createApp}>
                      Install App
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </React.Fragment>
                }
              >
                <InstallAppForm />
              </GenericModal>
            );
        }
      })()}
    </React.Fragment>
  );
};

InstallAppModal.propTypes = {
  className: PropTypes.string,
  clusters: PropTypes.array,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

function mapStateToProps(state) {
  let clusters = Object.keys(state.entities.clusters.items).map(clusterID => {
    return {
      id: clusterID,
      name: state.entities.clusters.items[clusterID].name,
      owner: state.entities.clusters.items[clusterID].owner,
    };
  });

  return { clusters };
}

export default connect(mapStateToProps)(InstallAppModal);
