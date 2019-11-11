import * as userActions from 'actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import Auth from 'lib/auth0';
import BaseTransition from 'styles/transitions/BaseTransition';
import PropTypes from 'prop-types';
import React from 'react';

class OAuthCallback extends React.Component {
  state = {
    error: null,
  };

  constructor(props) {
    super(props);

    const auth = new Auth();

    if (/id_token|error/.test(props.location.hash)) {
      auth.handleAuthentication((err, authResult) => {
        if (err === null) {
          // Login user officially
          props.actions
            .auth0Login(authResult)
            .then(() => {
              props.dispatch(push('/'));
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          this.setState({ error: err });
        }
      });
    } else {
      this.setState({
        error: {
          error: 'unauthorized',
          errorDescription:
            'Invalid or empty response from the authentication provider.',
        },
      });
    }
  }

  errorMessage = () => {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{this.state.error.errorDescription}</p>
        <Link to='/admin-login'>Try again</Link>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <BaseTransition
          in={true}
          appear={true}
          timeout={{
            appear: 200,
            enter: 200,
            exit: 200,
          }}
          classNames='login_form--transition'
        >
          <div className='login_form--container col-4 login_form--admin'>
            {this.state.error ? (
              this.errorMessage()
            ) : (
              <img className='loader' src={spinner} />
            )}
          </div>
        </BaseTransition>
      </div>
    );
  }
}

OAuthCallback.propTypes = {
  actions: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  flashMessages: PropTypes.object,
  params: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: state.app.loggedInUser,
    flashMessages: state.flashMessages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OAuthCallback);
