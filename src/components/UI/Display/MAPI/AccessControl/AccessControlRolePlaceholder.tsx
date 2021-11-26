import { Card, CardBody, Heading, Text } from 'grommet';
import * as React from 'react';

interface IAccessControlRolePlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Card> {}

const AccessControlRolePlaceholder: React.FC<
  IAccessControlRolePlaceholderProps
> = (props) => {
  return (
    <Card
      pad='medium'
      round='xsmall'
      elevation='none'
      background='background-contrast'
      {...props}
    >
      <CardBody>
        <Heading level={4} margin={{ top: 'none' }}>
          <Text size='xlarge' margin={{ right: 'small' }}>
            <i
              className='fa fa-close-circle'
              role='presentation'
              aria-hidden='true'
            />
          </Text>
          No roles available
        </Heading>
        <Text color='text-weak'>
          Please get in touch with your support engineer to set up one.
        </Text>
      </CardBody>
    </Card>
  );
};

export default AccessControlRolePlaceholder;
