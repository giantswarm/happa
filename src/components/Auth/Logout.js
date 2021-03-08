import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as mainActions from 'stores/main/actions';
import BaseTransition from 'styles/transitions/BaseTransition';

import { withAuthProvider } from './MAPI/MapiAuthProvider';

class Logout extends React.Component {
  componentDidMount() {
    const auth = this.props.authProvider;
    this.props.actions.logout(auth);
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <>
        <BaseTransition
          in={true}
          appear={true}
          timeout={{
            appear: 400,
            enter: 200,
            exit: 200,
          }}
          classNames='logout--mask--transition'
        >
          <div className='logout--mask' />
        </BaseTransition>
        <div className='logout--container'>
          <img className='loader' src={spinner} />
        </div>
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
