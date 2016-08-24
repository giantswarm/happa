"use strict";

import React from 'react';
import { connect } from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { modalHide } from '../../actions/modalActions';

class Modal extends React.Component {
  close() {
    this.props.dispatch(modalHide());
  }

  confirm(e) {
    if (e) {
      e.preventDefault();
    }
  }

  render() {
    switch(this.props.modal.template) {
      return (
        <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>Create an Organization</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
            <h4>Organization Name:</h4>
            <form onSubmit={this.confirm.bind(this)} >
              <input autoFocus type="text"/>
            </form>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button bsStyle="primary" onClick={this.confirm.bind(this)}>Create Organization</Button>
            <Button bsStyle="link" onClick={this.close.bind(this)}>Cancel</Button>
          </BootstrapModal.Footer>
        </BootstrapModal>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    modal: state.modal
  };
}

export default connect(mapStateToProps)(Modal);