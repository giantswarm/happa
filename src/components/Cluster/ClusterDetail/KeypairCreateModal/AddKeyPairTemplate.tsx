import { Text } from 'grommet';
import React, { ChangeEventHandler } from 'react';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import ExpiryHoursPicker from 'UI/Controls/ExpiryHoursPicker';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import TextInput from 'UI/Inputs/TextInput';
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
          <TextInput
            label='Common Name Prefix'
            id='cnPrefix'
            autoFocus={true}
            onChange={handleCNPrefixChange}
            value={cnPrefix}
            info={`${getCnPrefixOrEmail()}.user.api.clusterdomain`}
            error={cnPrefixError}
          />
        </InnerTwoInputArea>
        <InnerTwoInputArea>
          <TextInput
            id='organizations'
            label='Organizations'
            onChange={handleCertificateOrganizationsChange}
            value={certificateOrganizations}
            info='Comma seperated values. e.g.: admin,blue-team,staging'
          />
        </InnerTwoInputArea>
      </TwoInputArea>
      <br />
      <div>
        <TextInput
          label='Description'
          id='description'
          onChange={handleDescriptionChange}
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
        <CheckBoxInput
          id='internalApi'
          checked={useInternalAPI}
          onChange={handleUseInternalAPIChange}
          fieldLabel='Kubernetes API Endpoint'
          label='Use alternative internal api endpoint'
          help={
            <>
              <Text size='small' weight='normal' color='text-weak'>
                When this is selected, the server entry of the created
                kubeconfig will be https://internal-api.{ingressBaseDomain}
              </Text>
              <Text size='small' weight='normal' color='text-weak'>
                This is preferred in some restricted environments.
              </Text>
            </>
          }
        />
      )}
    </>
  );
};

export default AddKeyPairTemplate;
