import { Text } from 'grommet';
import * as docs from 'lib/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface ICreateKeyPairGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {}

const CreateKeyPairGuide: React.FC<ICreateKeyPairGuideProps> = ({
  ...props
}) => {
  return (
    <CLIGuide
      title='Create a key pair via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'Creating key pairs via the Management API',
              href: docs.creatingWorkloadClusterKeyPairsURL,
              external: true,
            },
            {
              label: 'Management API introduction',
              href: docs.managementAPIIntroduction,
              external: true,
            },
          ]}
        />
      }
      {...props}
    >
      <CLIGuideStepList>
        <Text>
          We provide a detailed guide in our docs which explains the necessary
          steps.
        </Text>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default CreateKeyPairGuide;
