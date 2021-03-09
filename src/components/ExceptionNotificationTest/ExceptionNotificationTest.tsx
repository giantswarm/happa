/* istanbul ignore file */

import ErrorReporter from 'lib/errors/ErrorReporter';
import React, { ReactNode } from 'react';
import Button from 'UI/Controls/Button';

function generateUncaughtException() {
  throw Error('Error thrown on purpose from /exception-notification-test/');
}

function reportException() {
  const errorReporter = ErrorReporter.getInstance();
  errorReporter.notify('test exception reported from Happa');
}

function ExceptionNotificationTest(): ReactNode {
  return (
    <>
      <h1>Exception Notification Tester</h1>
      <p>
        This page allows you to verify that the exception notification is
        working as intended.
      </p>

      <hr />
      <h3>Uncaught Exception</h3>
      <p>Click this button to generate an uncaught exception.</p>
      <Button onClick={generateUncaughtException}>Break Me</Button>
      <hr />
      <h3>Manually Reported Exception</h3>
      <p>
        Click this button to manually report an exception, this test ensures
        that communication between Happa, the API endpoint that recieves the
        notification, and Slack are working as expected. It does not actually
        generate an exception.
      </p>
      <Button onClick={reportException}>Report Exception</Button>
    </>
  );
}

export default ExceptionNotificationTest;
