import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Overlay } from 'react-bootstrap';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants } from 'shared/constants';
import { getKubernetesReleaseEOLStatus } from 'stores/releases/utils';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';

const EolLabel = styled.span`
  background: ${({ theme }) => theme.colors.darkBlueDarker3};
  color: ${({ theme }) => theme.colors.darkBlueLighter4};
  padding: 1px ${({ theme }) => theme.spacingPx}px;
  border-radius: 3px;
  margin-left: 5px;
  font-weight: 400;
`;

interface IKubernetesVersionLabelProps {
  version?: string;
  hidePatchVersion?: boolean;
  eolDate?: string;
  hideIcon?: boolean;
}

const KubernetesVersionLabel: React.FC<IKubernetesVersionLabelProps> = ({
  version,
  hidePatchVersion,
  eolDate,
  hideIcon,
}) => {
  let versionLabel = version || <NotAvailable />;
  if (version && hidePatchVersion) {
    const v = version.split('.');
    versionLabel = `${v[0]}.${v[1]}`;
  }

  const labelRef = useRef<HTMLSpanElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const eolStatus = getKubernetesReleaseEOLStatus(eolDate as string);
  const isEol = eolStatus.isEol && Boolean(version);

  const tryToToggleTooltip = (open: boolean) => () => {
    if (open && eolStatus.message) {
      setIsTooltipVisible(true);

      return;
    }

    setIsTooltipVisible(false);
  };

  return (
    <>
      <span
        ref={labelRef}
        onMouseEnter={tryToToggleTooltip(true)}
        onMouseLeave={tryToToggleTooltip(false)}
        onFocus={tryToToggleTooltip(true)}
        onBlur={tryToToggleTooltip(false)}
        aria-label={`Kubernetes version: ${versionLabel}`}
      >
        {!hideIcon && (
          <>
            <i
              className='fa fa-kubernetes'
              title='Kubernetes version'
              role='presentation'
              aria-hidden={true}
            />{' '}
          </>
        )}

        {versionLabel}

        {isEol && (
          <EolLabel aria-label={Constants.K8s_VERSION_EOL_EXPLANATION}>
            {Constants.K8s_VERSION_EOL_LABEL}
          </EolLabel>
        )}
      </span>
      <Overlay
        placement='top'
        target={labelRef.current as HTMLSpanElement}
        show={isTooltipVisible}
      >
        <Tooltip id='tooltip'>{eolStatus.message}</Tooltip>
      </Overlay>
    </>
  );
};

KubernetesVersionLabel.propTypes = {
  version: PropTypes.string,
  hidePatchVersion: PropTypes.bool,
  eolDate: PropTypes.string,
  hideIcon: PropTypes.bool,
};

KubernetesVersionLabel.defaultProps = {
  version: '',
  hidePatchVersion: true,
  eolDate: '',
  hideIcon: false,
};

export default KubernetesVersionLabel;
