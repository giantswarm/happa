import styled from '@emotion/styled';
import { V5ClusterLabelsProperty } from 'giantswarm';
import PropTypes from 'prop-types';
import React, { FC, HTMLAttributes, useState } from 'react';
import LabelWrapper from 'UI/ClusterLabels/LabelWrapper';

import DeleteLabelButton from './DeleteLabelButton';
import EditLabelTooltip from './EditLabelTooltip';

interface IClusterLabelsProps {
  clusterId: string;
  labels: V5ClusterLabelsProperty;
}

const ClusterLabelsWrapper = styled.div`
  display: grid;
  grid-template: 'title labels' '. help';
  grid-template-columns: 203px 1fr;
`;

const LabelsWrapper = styled.div`
  grid-area: labels;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
`;

const LabelsTitle = styled.span`
  grid-area: title;
  margin: 5px;
`;

const HelpText = styled.span`
  grid-area: help;
  font-size: 13px;
  u {
    text-decoration-style: dotted;
  }
`;

const NoLabels = styled.div`
  grid-area: labels;
`;

const ClusterLabels: FC<
  IClusterLabelsProps & HTMLAttributes<HTMLDivElement>
> = ({
  className,
  // clusterId,
  labels,
}) => {
  const [allowEditing, setAllowEditing] = useState(true);

  const noLabels = Object.keys(labels).length === 0;

  return (
    <ClusterLabelsWrapper className={className}>
      <LabelsTitle>Labels:</LabelsTitle>
      {noLabels ? (
        <NoLabels>
          This cluster has no labels. You can add a label by clicking the{' '}
          <EditLabelTooltip
            allowInteraction={allowEditing}
            label=''
            onOpen={(isOpen) => setAllowEditing(isOpen)}
            onSave={() => setAllowEditing(true)}
            value=''
          />{' '}
          button.
        </NoLabels>
      ) : (
        <>
          <LabelsWrapper>
            {Object.entries(labels).map(([label, value]) => (
              <LabelWrapper key={label}>
                <EditLabelTooltip
                  allowInteraction={allowEditing}
                  label={label}
                  onOpen={(isOpen) => setAllowEditing(isOpen)}
                  onSave={() => setAllowEditing(true)}
                  value={value}
                />
                <DeleteLabelButton
                  allowInteraction={allowEditing}
                  onOpen={(isOpen) => setAllowEditing(isOpen)}
                  onDelete={() => {}}
                >
                  &times;
                </DeleteLabelButton>
              </LabelWrapper>
            ))}
            <EditLabelTooltip
              allowInteraction={allowEditing}
              label=''
              onOpen={(isOpen) => setAllowEditing(isOpen)}
              onSave={() => setAllowEditing(true)}
              value=''
            />
          </LabelsWrapper>
          <HelpText>
            Click the <u>underlined</u> text to modify label keys and values.
          </HelpText>
        </>
      )}
    </ClusterLabelsWrapper>
  );
};

ClusterLabels.propTypes = {
  className: PropTypes.string,
  clusterId: PropTypes.string.isRequired,
  // @ts-ignore
  labels: PropTypes.object.isRequired,
};

export default ClusterLabels;
