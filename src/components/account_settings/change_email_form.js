import React from 'react';
import Gravatar from 'react-gravatar';
import Button from '../button';
import GiantSwarm from '../../lib/giantswarm_client_wrapper';
import update from 'react-addons-update';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

var changeEmailForm = React.createClass({
  getInitialState: function(props) {
    return {
      changeEmailFormValid: false,
      changeEmailFormSubmitting: false,
      changeEmailSuccess: false,
      buttonVisible: false,
      fields: {
        email: {
          value: this.props.user.email
        }
      }
    };
  },

  resetForm: function() {
    this.setState({

    });
  },

  validateEmail: function(e) {
    var email = e.target.value;
    var buttonVisible;

    if (email !== this.props.user.email) {
      buttonVisible = true;
    } else {
      buttonVisible = false;
    }

    var newState = update(this.state, {
      changeEmailSuccess: {$set: false},
      buttonVisible: {$set: buttonVisible},

      fields: {
        email: {
          value: {$set: email}
        }
      }
    });

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
      newState = update(newState, {
        changeEmailFormValid: {$set: true},
        changeEmailFormError: {$set: false},
      });
    } else {
      newState = update(newState, {
        changeEmailFormValid: {$set: false},
        changeEmailFormError: {$set: false},
      });
    };

    this.setState(newState);
  },

  submit: function(e) {
    e.preventDefault();

    // Don't submit the form if nothing changed.
    if (this.props.user.email != this.state.fields.email.value) {
      var authToken = this.props.user.authToken;
      var giantSwarm = new GiantSwarm.Client(authToken);

      this.setState({
        changeEmailFormSubmitting: true,
        changeEmailFormError: false
      });

      giantSwarm.changeEmail({
        old_email: this.props.user.email,
        new_email: this.state.fields.email.value
      })
      .then((response) => {
        this.setState({
          changeEmailFormSubmitting: false,
          changeEmailSuccess: true,
          buttonVisible: false
        });
      })
      .then(() => {
        return this.props.actions.refreshUserInfo();
      })
      .catch((error) => {
        var errorMessage;

        if (error.body && error.body.status_code && error.body.status_code === 10009) {
          errorMessage = <span>This e-mail is in already in use by a different user. Please choose a different e-mail address</span>;
        } else {
          errorMessage = <span>Something went wrong while trying to update your e-mail address.
            Perhaps our servers are down. Could you try again later,
            or contact support otherwise:
            &nbsp;
            <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
          </span>;
        }

        this.setState({
          changeEmailFormSubmitting: false,
          changeEmailFormError: true,
          buttonVisible: false,
          errorMessage: errorMessage
        });
      });
    }
  },

  render: function() {
    return (
      <div>
        <form className="change_email_form" onSubmit={this.submit}>
          <input ref='new_email' onChange={this.validateEmail} type="text" value={this.state.fields.email.value}/>

          <div className="button-area">
            <ReactCSSTransitionGroup
              transitionName='slide-right'
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}>

              {
                this.state.buttonVisible ?

                <Button type='submit'
                        bsStyle='primary'
                        disabled={!this.state.changeEmailFormValid}
                        loading={this.state.changeEmailFormSubmitting}
                        loadingMessage="Saving...">
                  Set New Email
                </Button>

                : null
              }
            </ReactCSSTransitionGroup>


            <ReactCSSTransitionGroup
              transitionName='slide-right'
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}>
              {
                this.state.changeEmailSuccess
                ?
                  <div className='form-success'><i className='fa fa-check-circle' />Saved Succesfully</div>
                :
                  null
              }
            </ReactCSSTransitionGroup>


            <ReactCSSTransitionGroup
              transitionName='slide-right'
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}>
            {
              this.state.changeEmailFormError
              ?
                <div className='flash-messages--flash-message flash-messages--danger'>
                  {this.state.errorMessage}
                </div>
              :
                null
            }
            </ReactCSSTransitionGroup>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = changeEmailForm;