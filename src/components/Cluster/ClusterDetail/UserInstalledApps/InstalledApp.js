import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const App = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #395c72;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #395c72;

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

const InstalledApp = ({ app, iconErrors, onIconError, onClick, ...rest }) => {
  return (
    <App onClick={onClick} {...rest}>
      <div className='details'>
        {app.logoUrl && !iconErrors[app.logoUrl] && (
          <img
            alt={`${app.metadata.name} icon`}
            onError={onIconError}
            src={app.logoUrl}
          />
        )}
        {app.metadata.name}
        <small>Chart Version: {app.spec?.version ?? 'n/a'}</small>
      </div>
    </App>
  );
};

InstalledApp.propTypes = {
  app: PropTypes.object,
  iconErrors: PropTypes.object,
  onIconError: PropTypes.func,
  onClick: PropTypes.func,
};

export default InstalledApp;
