import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ShadowMask from 'shared/ShadowMask';
import * as mainActions from 'stores/main/actions';
import styled from 'styled-components';

import { withAuthProvider } from './MAPI/MapiAuthProvider';

const CenteredSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  position: fixed;

  img {
    vertical-align: middle;
    width: 25px;
  }
`;

class Logout extends React.Component {
  componentDidMount() {
    const auth = this.props.authProvider;
    this.props.actions.logout(auth);
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <>
        <ShadowMask />

        <CenteredSpinner>
          <img className='loader' src={spinner} />
        </CenteredSpinner>
      </>
    );
  }
}

Logout.propTypes = {
  actions: PropTypes.object,
  authProvider: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(withAuthProvider(Logout));
