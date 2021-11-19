import { spinner } from 'images';
import React from 'react';
import { PasswordStatusMessage } from 'utils/passwordValidation';

class StatusMessage extends React.Component {
  static statusMessage() {
    return {
      verify_started: <span>Verifying invite...</span>,
      verify_completed: (
        <span>
          Verifying invite... <span className='success'>VALID!</span>
        </span>
      ),
      verify_failed: (
        <span>
          Verifying invite... <span className='error'>FAILED!</span>
          <br /> The server appears to be down. Please try again later.
        </span>
      ),
      invalid_token: (
        <span>
          Verifying invite... <span className='error'>FAILED!</span>
          <br /> This invite token is not valid. Perhaps you already used it?
        </span>
      ),
      enter_password: <span>Please enter your desired password</span>,
      create_account_starting: <span>Creating account... </span>,
      create_account_started: <span>Creating account... </span>,
      create_account_completed: (
        <span>
          Creating account... <span className='success'>DONE!</span>
        </span>
      ),
      create_account_failed: (
        <span>
          Creating account... <span className='error'>FAILED!</span>
        </span>
      ),
      [PasswordStatusMessage.TooShort]: (
        <span>Please use at least 8 characters</span>
      ),
      [PasswordStatusMessage.JustNumbers]: (
        <span>Please add something else than only numbers</span>
      ),
      [PasswordStatusMessage.JustLetters]: (
        <span>Please add some more diverse characters.</span>
      ),
      password_confirmation_mismatch: (
        <span>Password confirmation does not match.</span>
      ),
      [PasswordStatusMessage.Ok]: <span>Password looks good.</span>,
      password_confirmation_ok: <span>Perfect match, nice!</span>,
      tos_intro: <span>Waiting for you to check that mark...</span>,
      tos_ok: <span>Thanks for accepting the TOS</span>,
      tos_not_accepted: (
        <span>Waiting for you to check that mark... again</span>
      ),
      all_good: <span>Ready to create your account!</span>,
    };
  }

  static showLoader() {
    return false;
  }

  render() {
    return (
      <div className='signup--status'>
        <div className='signup--status-text'>
          {StatusMessage.statusMessage()[this.props.status] || (
            <span>&nbsp;</span>
          )}
        </div>
        {StatusMessage.showLoader() ? (
          <img className='loader' src={spinner} />
        ) : null}
      </div>
    );
  }
}

export default StatusMessage;
