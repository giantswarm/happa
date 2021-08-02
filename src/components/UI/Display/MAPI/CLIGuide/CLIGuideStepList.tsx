import { Box } from 'grommet';
import React from 'react';

interface ICLIGuideStepListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const CLIGuideStepList: React.FC<ICLIGuideStepListProps> = (props) => {
  return <Box direction='column' gap='small' {...props} />;
};

CLIGuideStepList.propTypes = {};

export default CLIGuideStepList;
