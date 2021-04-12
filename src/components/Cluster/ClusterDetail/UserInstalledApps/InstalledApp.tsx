import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';

const App = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.foreground};
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.foreground};

  &:hover {
    cursor: pointer;
    border: 1px solid rgb(92, 127, 154);
  }

  img {
    width: 36px;
    height: 36px;
    margin-right: 16px;
    float: left;
    position: relative;
    top: 3px;
    border-radius: 5px;
    background-color: #fff;
  }

  small {
    font-size: 12px;
  }
`;

interface IAppMetadata {
  name: string;
}

interface IAppSpec {
  version?: string;
}

interface IApp {
  logoUrl?: string;
  metadata: IAppMetadata;
  spec?: IAppSpec;
}

interface IInstalledAppProps {
  app: IApp;
  iconErrors?: object;
  onIconError: () => void;
  onClick: (e: React.MouseEvent) => void;
}

const InstalledApp: React.FC<IInstalledAppProps> = ({
  app,
  iconErrors,
  onIconError,
  onClick,
  ...rest
}) => {
  let img = null;
  if (app.logoUrl && !iconErrors?.hasOwnProperty(app.logoUrl)) {
    img = (
      <img
        alt={`${app.metadata.name} icon`}
        onError={onIconError}
        src={app.logoUrl}
      />
    );
  }

  return (
    <App onClick={onClick} {...rest}>
      <div className='details'>
        {img}
        {app.metadata.name}
        <small>Chart version: {app.spec?.version ?? <NotAvailable />}</small>
      </div>
    </App>
  );
};

InstalledApp.propTypes = {
  app: (PropTypes.object as PropTypes.Requireable<IApp>).isRequired,
  iconErrors: PropTypes.object,
  onIconError: PropTypes.any,
  onClick: PropTypes.any,
};

export default InstalledApp;
