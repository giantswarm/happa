import React from 'react';
import { Tab, Tabs } from 'UI/Display/Tabs';

interface IPermissionsProps {}

const PermissionsOverview: React.FC<IPermissionsProps> = () => {
  return (
    <>
      <Tabs>
        <Tab title='Global' />
        <Tab title='For organizations' />
      </Tabs>
      <div>Permissions Overview</div>
    </>
  );
};

export default PermissionsOverview;
