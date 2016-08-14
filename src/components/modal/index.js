"use strict";

import React from 'react';
import {connect} from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import {modalHide} from '../../actions/modalActions';

class Modal extends React.Component {
  close() {
    this.props.dispatch(modalHide());
  }

  render() {
    return (
      <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Modal heading</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <h4>Text in a modal</h4>
          <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button onClick={this.close.bind(this)}>Close</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    modal: state.modal
  };
}

export default connect(mapStateToProps)(Modal);