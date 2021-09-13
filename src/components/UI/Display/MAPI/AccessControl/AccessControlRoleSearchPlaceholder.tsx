import { Card, CardBody, Heading, Text } from 'grommet';
import * as React from 'react';

interface IAccessControlRoleSearchPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Card> {}

const AccessControlRoleSearchPlaceholder: React.FC<IAccessControlRoleSearchPlaceholderProps> =
  (props) => {
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
                className='fa fa-info'
                role='presentation'
                aria-hidden='true'
              />
            </Text>
            No roles found for your search
          </Heading>
          <Text color='text-weak'>
            Please verify that your search query is correct.
          </Text>
        </CardBody>
      </Card>
    );
  };

export default AccessControlRoleSearchPlaceholder;
