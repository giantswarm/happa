import styled from '@emotion/styled';
import { V5ClusterLabelsProperty } from 'giantswarm';
import PropTypes from 'prop-types';
import React, { FC, HTMLAttributes, useState } from 'react';
import Button from 'UI/Button';
import EditableValueLabel from 'UI/EditableValueLabel';
import ValueLabel from 'UI/ValueLabel';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

interface IClusterLabelsProps {
  clusterId: string;
  labels: V5ClusterLabelsProperty;
}

const DeleteLabelButton = styled(Button)`
  margin: 0;
  padding: 0;
`;

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

const LabelWrapper = styled.div`
  margin: 5px 5px 5px 0;
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

const StyledValueLabel = styled(ValueLabel)`
  margin-bottom: 0;
`;

const ClusterLabels: FC<
  IClusterLabelsProps & HTMLAttributes<HTMLDivElement>
> = ({
  className,
  // clusterId,
  labels,
}) => {
  const [allowEditing, setAllowEditing] = useState(true);

  return (
    <ClusterLabelsWrapper className={className}>
      <LabelsTitle>Labels:</LabelsTitle>
      <LabelsWrapper>
        {Object.entries(labels).map(([label, value]) => (
          <LabelWrapper key={label}>
            <StyledValueLabel
              label={
                <EditableValueLabel
                  allowEdit={allowEditing}
                  onCancel={() => setAllowEditing(true)}
                  onEdit={() => setAllowEditing(false)}
                  onSave={() => setAllowEditing(true)}
                  validationFunc={validateLabelKey}
                  value={label}
                />
              }
              value={
                <EditableValueLabel
                  allowEdit={allowEditing}
                  onCancel={() => setAllowEditing(true)}
                  onEdit={() => setAllowEditing(false)}
                  onSave={() => setAllowEditing(true)}
                  validationFunc={validateLabelValue}
                  value={value}
                />
              }
              key={label}
            />
            <DeleteLabelButton
              bsStyle='link'
              disabled={!allowEditing}
              className={!allowEditing ? 'invisible' : ''}
              onClick={() => {
                // onSave({ label, value: null });
              }}
            >
              &times;
            </DeleteLabelButton>
          </LabelWrapper>
        ))}
      </LabelsWrapper>
      <HelpText>
        Click the <u>underlined</u> text to modify label keys and values.
      </HelpText>
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
