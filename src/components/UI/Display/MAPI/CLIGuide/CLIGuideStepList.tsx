import { Box } from 'grommet';
import React from 'react';

interface ICLIGuideStepListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const CLIGuideStepList: React.FC<
  React.PropsWithChildren<ICLIGuideStepListProps>
> = (props) => {
  return <Box direction='column' gap='medium' {...props} />;
};

export default CLIGuideStepList;
