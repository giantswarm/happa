const parseErrorMessages = (error) => {
  let heading = 'Could not log in';
  let message =
    'Something went wrong. Please try again later or contact support: support@giantswarm.io';

  if (
    error.response &&
    error.response.body &&
    error.response.body.code === 'INVALID_CREDENTIALS'
  ) {
    message = 'Credentials appear to be incorrect.';
  } else if (
    error.response &&
    error.response.body &&
    error.response.body.code === 'TOO_MANY_REQUESTS'
  ) {
    heading = 'Too many requests';
    message = 'Please wait 5 minutes and try again.';
  } else if (
    error.message &&
    error.message.includes('Access-Control-Allow-Origin')
  ) {
    message =
      'Please ensure you have installed the required certificates to talk to the API server.';
  }

  return [heading, message];
};

export { parseErrorMessages };
