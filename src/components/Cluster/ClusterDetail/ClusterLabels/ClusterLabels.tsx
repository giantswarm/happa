import PropTypes from 'prop-types';
import React, { ComponentPropsWithoutRef, FC, useState } from 'react';
import styled from 'styled-components';
import LabelWrapper from 'UI/Display/Cluster/ClusterLabels/LabelWrapper';

import DeleteLabelButton from './DeleteLabelButton';
import EditLabelTooltip from './EditLabelTooltip';

const ClusterLabelsWrapper = styled.div`
  display: grid;
  grid-template: 'title labels' '. bottom';
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

const BottomAreaText = styled.span`
  grid-area: bottom;
  font-size: 13px;
`;

const HelpText = styled(BottomAreaText)`
  u {
    text-decoration-style: dotted;
  }
`;

const ErrorText = styled(BottomAreaText)`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
`;

const NoLabels = styled.div`
  grid-area: labels;
  display: flex;
  align-items: center;
`;

const NoLabelsEditLabelTooltip = styled(EditLabelTooltip)`
  margin-left: ${({ theme }) => theme.spacingPx * 2}px;
`;

interface IClusterLabelsProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  onChange: (patch: ILabelChange) => void;
  labels?: Record<string, string>;
  isLoading?: boolean;
  errorMessage?: string;
}

const ClusterLabels: FC<IClusterLabelsProps> = ({
  labels,
  onChange,
  isLoading,
  errorMessage,
  ...props
}) => {
  const [allowEditing, setAllowEditing] = useState(true);

  const noLabels = !labels || Object.keys(labels).length === 0;

  return (
    <ClusterLabelsWrapper {...props}>
      <LabelsTitle>Labels:</LabelsTitle>
      {noLabels ? (
        <NoLabels>
          This cluster has no labels.
          <NoLabelsEditLabelTooltip
            allowInteraction={!isLoading && allowEditing}
            label=''
            onOpen={(isOpen) => setAllowEditing(isOpen)}
            onSave={onChange}
            value=''
          />
        </NoLabels>
      ) : (
        <>
          <LabelsWrapper>
            {labels &&
              Object.entries(labels).map(([label, value]) => (
                <LabelWrapper key={label}>
                  <EditLabelTooltip
                    allowInteraction={!isLoading && allowEditing}
                    label={label}
                    onOpen={(isOpen) => setAllowEditing(isOpen)}
                    onSave={onChange}
                    value={value}
                  />
                  <DeleteLabelButton
                    allowInteraction={!isLoading && allowEditing}
                    onOpen={(isOpen) => setAllowEditing(isOpen)}
                    onDelete={() => {
                      onChange({ key: label, value: null });
                    }}
                    role='button'
                    aria-label={`Delete '${label}' label`}
                  >
                    &times;
                  </DeleteLabelButton>
                </LabelWrapper>
              ))}
            <EditLabelTooltip
              allowInteraction={!isLoading && allowEditing}
              label=''
              onOpen={(isOpen) => setAllowEditing(isOpen)}
              onSave={onChange}
              value=''
            />
          </LabelsWrapper>
          {errorMessage ? (
            <ErrorText>Could not save labels. Please try again.</ErrorText>
          ) : (
            <HelpText>
              Click the <u>underlined</u> text to modify label keys and values.
            </HelpText>
          )}
        </>
      )}
    </ClusterLabelsWrapper>
  );
};

ClusterLabels.propTypes = {
  onChange: PropTypes.func.isRequired,
  labels: PropTypes.object as PropTypes.Requireable<Record<string, string>>,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default ClusterLabels;
