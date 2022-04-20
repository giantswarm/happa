import React from 'react';
import FileBlock from 'UI/Display/Documentation/FileBlock';

interface IAddKeyPairSuccessTemplateProps {
  kubeconfig: string;
}

const AddKeyPairSuccessTemplate: React.FC<
  React.PropsWithChildren<IAddKeyPairSuccessTemplateProps>
> = ({ kubeconfig }) => {
  return (
    <>
      <p>
        Copy the text below and save it to a text file named kubeconfig on your
        local machine. Caution: You won&apos;t see the key and certificate
        again!
      </p>
      <p>
        <b>Important:</b> Make sure that only you have access to this file, as
        it enables for complete administrative access to your cluster.
      </p>

      <FileBlock fileName='config.yaml'>{kubeconfig}</FileBlock>
    </>
  );
};

export default AddKeyPairSuccessTemplate;
