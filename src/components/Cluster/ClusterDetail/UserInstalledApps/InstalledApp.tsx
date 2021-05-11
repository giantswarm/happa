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

interface IInstalledAppProps {
  name: string;
  version: string;
  onIconError: React.ReactEventHandler<HTMLImageElement>;
  onClick: (e: React.MouseEvent) => void;
  logoUrl?: string;
  iconErrors?: Record<string, boolean>;
}

const InstalledApp: React.FC<IInstalledAppProps> = ({
  name,
  logoUrl,
  version,
  iconErrors,
  onIconError,
  onClick,
  ...rest
}) => {
  return (
    <App onClick={onClick} {...rest}>
      <div className='details'>
        {logoUrl && !iconErrors?.hasOwnProperty(logoUrl) && (
          <img alt={`${name} icon`} onError={onIconError} src={logoUrl} />
        )}

        <span>{name}</span>

        <small>Chart version: {version || <NotAvailable />}</small>
      </div>
    </App>
  );
};

InstalledApp.propTypes = {
  name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  onIconError: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  logoUrl: PropTypes.string,
  iconErrors: PropTypes.object as PropTypes.Requireable<
    Record<string, boolean>
  >,
};

export default InstalledApp;
