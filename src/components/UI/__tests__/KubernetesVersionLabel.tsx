import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { getComponentWithTheme, renderWithTheme } from 'testUtils/renderUtils';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';

describe('KubernetesVersionLabel', () => {
  it('renders without crashing', () => {
    renderWithTheme(KubernetesVersionLabel, {});
  });

  it('renders the given version, or a placeholder, if the version is not given', () => {
    const { rerender } = renderWithTheme(KubernetesVersionLabel, {});
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();

    rerender(getComponentWithTheme(KubernetesVersionLabel, { version: '' }));
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();

    rerender(
      getComponentWithTheme(KubernetesVersionLabel, { version: '1.0.0' })
    );
    expect(screen.getByText(/1.0/i)).toBeInTheDocument();
  });

  it('can display the patch version of a given release', () => {
    renderWithTheme(KubernetesVersionLabel, {
      version: '1.0.0',
      hidePatchVersion: false,
    });
    expect(screen.getByText(/1.0.0/i)).toBeInTheDocument();
  });

  it('can show or hide the kubernetes icon', () => {
    const { rerender } = renderWithTheme(KubernetesVersionLabel, {
      version: '1.0.0',
    });
    expect(screen.getByTitle(/kubernetes version/i)).toBeInTheDocument();

    rerender(
      getComponentWithTheme(KubernetesVersionLabel, {
        version: '1.0.0',
        hideIcon: true,
      })
    );
    expect(screen.queryByTitle(/kubernetes version/i)).not.toBeInTheDocument();
  });

  it('can show if a version reached its EOL or not', async () => {
    const { rerender } = renderWithTheme(KubernetesVersionLabel, {
      version: '1.0.0',
      eolDate: '1960-02-10',
    });
    let versionLabel: HTMLElement | null =
      screen.getByLabelText(/end of life/i);
    expect(versionLabel).toBeInTheDocument();

    let tooltipMessageRegexp =
      /This Kubernetes version reached its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );

    rerender(
      getComponentWithTheme(KubernetesVersionLabel, {
        version: '1.0.0',
        eolDate: new Date().toISOString(),
      })
    );
    versionLabel = screen.getByLabelText(/end of life/i);
    expect(versionLabel).toBeInTheDocument();

    tooltipMessageRegexp = /This Kubernetes version reached its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );

    rerender(
      getComponentWithTheme(KubernetesVersionLabel, {
        version: '1.0.0',
        eolDate: '2999-02-10',
      })
    );
    versionLabel = screen.queryByLabelText(/end of life/i);
    expect(versionLabel).not.toBeInTheDocument();

    versionLabel = screen.getByText(/1.0/i);
    tooltipMessageRegexp =
      /This Kubernetes version will reach its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );
  });
});
