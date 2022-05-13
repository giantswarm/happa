import { Box } from 'grommet';
import React from 'react';

interface IUnauthorizedMessageProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const UnauthorizedMessage: React.FC<
  React.PropsWithChildren<IUnauthorizedMessageProps>
> = ({ ...props }) => {
  return (
    <Box
      {...props}
      direction='row'
      align='baseline'
      gap='xsmall'
      margin={{ bottom: 'xsmall' }}
    >
      <i className='fa fa-ban' role='presentation' aria-hidden={true} />
      For following these instructions, you will require additional permissions.
      Please talk to your administrator.
    </Box>
  );
};

export default UnauthorizedMessage;
