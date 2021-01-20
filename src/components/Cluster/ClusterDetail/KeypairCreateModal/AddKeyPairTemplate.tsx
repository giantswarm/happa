import ExpiryHoursPicker from 'Cluster/ClusterDetail/ExpiryHoursPicker';
import PropTypes from 'prop-types';
import React, { ChangeEventHandler } from 'react';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import TwoInputArea, { InnerTwoInputArea } from 'UI/Layout/TwoInputArea';

interface IAddKeyPairTemplateProps {
  email: string;
  provider: PropertiesOf<typeof Providers>;

  cnPrefix: string;
  cnPrefixError: string | null;
  handleCNPrefixChange: ChangeEventHandler<HTMLInputElement>;

  certificateOrganizations: string;
  handleCertificateOrganizationsChange: ChangeEventHandler<HTMLInputElement>;

  description: string;
  handleDescriptionChange: ChangeEventHandler<HTMLInputElement>;

  expireTTL: number;
  handleTTLChange: (ttl: number) => void;

  useInternalAPI: boolean;
  handleUseInternalAPIChange: ChangeEventHandler<HTMLInputElement>;

  ingressBaseDomain: string;
}

const AddKeyPairTemplate: React.FC<IAddKeyPairTemplateProps> = ({
  provider,
  email,
  cnPrefix,
  cnPrefixError,
  handleCNPrefixChange,
  certificateOrganizations,
  handleCertificateOrganizationsChange,
  description,
  handleDescriptionChange,
  expireTTL,
  handleTTLChange,
  useInternalAPI,
  handleUseInternalAPIChange,
  ingressBaseDomain,
}) => {
  const getCnPrefixOrEmail = (): string => {
    if (cnPrefix === '') {
      return email;
    }

    return cnPrefix;
  };

  return (
    <>
      <p>A key pair grants you access to the Kubernetes API of this cluster.</p>
      <p>
        Kubernetes uses the common name of the certificate as the username, and
        assigns the Organizations as groups. This allows you to set up role
        based access rights.
      </p>
      <TwoInputArea>
        <InnerTwoInputArea>
          <label htmlFor='cnPrefix'>Common Name Prefix:</label>
          <input
            id='cnPrefix'
            autoFocus
            onChange={handleCNPrefixChange}
            type='text'
            value={cnPrefix}
          />
          <div className='text-field-hint'>
            {cnPrefixError === null ? (
              `${getCnPrefixOrEmail()}.user.api.clusterdomain`
            ) : (
              <span className='error'>
                <i className='fa fa-warning' /> {cnPrefixError}
              </span>
            )}
          </div>
        </InnerTwoInputArea>
        <InnerTwoInputArea>
          <label htmlFor='organizations'>Organizations:</label>
          <input
            id='organizations'
            onChange={handleCertificateOrganizationsChange}
            type='text'
            value={certificateOrganizations}
          />
          <div className='text-field-hint'>
            Comma seperated values. e.g.: admin,blue-team,staging
          </div>
        </InnerTwoInputArea>
      </TwoInputArea>
      <br />
      <div>
        <label htmlFor='description'>Description:</label>
        <input
          id='description'
          onChange={handleDescriptionChange}
          type='text'
          value={description}
        />
      </div>
      <br />
      <label>Expires:</label>
      <ExpiryHoursPicker
        initialValue={expireTTL}
        maxSafeValueHours={Constants.KEYPAIR_MAX_SAFE_TTL}
        onChange={handleTTLChange}
      />

      {provider === Providers.AWS && (
        <>
          <br />

          <label>Kubernetes API Endpoint:</label>
          <input
            id='internalApi'
            type='checkbox'
            checked={useInternalAPI}
            onChange={handleUseInternalAPIChange}
          />
          <label htmlFor='internalApi' className='checkbox-label'>
            Use alternative internal api endpoint.
          </label>
          <small>
            When this is selected, the server entry of the created kubeconfig
            will be https://internal-api.
            {ingressBaseDomain}
          </small>
          <small>This is preferred in some restricted environments.</small>

          <br />
        </>
      )}
    </>
  );
};

AddKeyPairTemplate.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  email: PropTypes.string.isRequired,
  cnPrefix: PropTypes.string.isRequired,
  cnPrefixError: PropTypes.string,
  handleCNPrefixChange: PropTypes.func.isRequired,
  certificateOrganizations: PropTypes.string.isRequired,
  handleCertificateOrganizationsChange: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  handleDescriptionChange: PropTypes.func.isRequired,
  expireTTL: PropTypes.number.isRequired,
  handleTTLChange: PropTypes.func.isRequired,
  useInternalAPI: PropTypes.bool.isRequired,
  handleUseInternalAPIChange: PropTypes.func.isRequired,
  ingressBaseDomain: PropTypes.string.isRequired,
};

export default AddKeyPairTemplate;
