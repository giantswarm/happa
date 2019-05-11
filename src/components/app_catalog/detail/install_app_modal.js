import Button from '../../shared/button';
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
    setPage(0);
    setVisible(true);
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
                title={'Install an App'}
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
                <ClusterPicker />
              </GenericModal>
            );

          case APP_FORM_PAGE:
            return (
              <GenericModal
                {...props}
                visible={visible}
                onClose={onClose}
                title={'Install an App'}
                footer={
                  <React.Fragment>
                    <Button bsStyle='primary' onClick={previous}>
                      Previous
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
  onClose: PropTypes.func,
  visible: PropTypes.bool,
  className: PropTypes.string,
};

export default InstallAppModal;
