import GiantSwarm from 'giantswarm';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'react-addons-update';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';

class ChangeEmailForm extends React.Component {
  state = {
    fields: {
      email: {
        value: this.props.user.email,
      },
    },
    error: false,
    isValid: false,
    isSubmitting: false,
    isSuccess: false,
    isButtonVisible: false,
  };

  resetForm() {
    this.setState({});
  }

  validateEmail = e => {
    const email = e.target.value;
    let isButtonVisible = false;

    if (email !== this.props.user.email) {
      isButtonVisible = true;
    }

    let newState = update(this.state, {
      isSuccess: { $set: false },
      isButtonVisible: { $set: isButtonVisible },

      fields: {
        email: {
          value: { $set: email },
        },
      },
    });

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
      newState = update(newState, {
        isValid: { $set: true },
        error: { $set: false },
      });
    } else {
      newState = update(newState, {
        isValid: { $set: false },
        error: { $set: false },
      });
    }

    this.setState(newState);
  };

  submit = e => {
    e.preventDefault();

    // Don't submit the form if nothing changed.
    if (this.props.user.email !== this.state.fields.email.value) {
      const usersApi = new GiantSwarm.UsersApi();

      this.setState({
        isSubmitting: true,
        error: false,
      });

      usersApi
        .modifyUser(this.props.user.email, {
          email: this.state.fields.email.value,
        })
        .then(() => {
          this.setState({
            isSubmitting: false,
            isSuccess: true,
            isButtonVisible: false,
          });
        })
        .then(() => {
          return this.props.actions.refreshUserInfo();
        })
        .catch(error => {
          let errorMessage = null;

          if (
            error.body &&
            error.body.status_code &&
            // eslint-disable-next-line no-magic-numbers
            error.body.status_code === 10009
          ) {
            errorMessage = (
              <span>
                This e-mail is in already in use by a different user. Please
                choose a different e-mail address
              </span>
            );
          } else {
            errorMessage = (
              <span>
                Something went wrong while trying to update your e-mail address.
                Perhaps our servers are down. Could you try again later, or
                contact support otherwise: &nbsp;
                <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
              </span>
            );
          }

          this.setState({
            isSubmitting: false,
            error: true,
            isButtonVisible: false,
            errorMessage: errorMessage,
          });
        });
    }
  };

  render() {
    return (
      <div>
        <form className='change_email_form' onSubmit={this.submit}>
          <input
            onChange={this.validateEmail}
            ref={i => {
              this.new_email = i;
            }}
            type='text'
            value={this.state.fields.email.value}
          />

          <div className='button-area'>
            <SlideTransition in={this.state.isButtonVisible}>
              <Button
                bsStyle='primary'
                disabled={!this.state.isValid}
                loading={this.state.isSubmitting}
                loadingMessage='Saving...'
                type='submit'
              >
                Set New Email
              </Button>
            </SlideTransition>

            <SlideTransition in={this.state.isSuccess}>
              <div className='form-success'>
                <i className='fa fa-done' />
                Saved Succesfully
              </div>
            </SlideTransition>

            <SlideTransition in={this.state.error}>
              <div className='flash-messages--flash-message flash-messages--danger'>
                {this.state.errorMessage}
              </div>
            </SlideTransition>
          </div>
        </form>
      </div>
    );
  }
}

ChangeEmailForm.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
};

export default ChangeEmailForm;
