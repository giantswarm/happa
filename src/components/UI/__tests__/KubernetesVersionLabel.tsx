import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import * as React from 'react';
import KubernetesVersionLabel from 'UI/KubernetesVersionLabel';

describe('KubernetesVersionLabel', () => {
  it('renders without crashing', () => {
    render(<KubernetesVersionLabel />);
  });

  it('renders the given version, or a placeholder, if the version is not given', () => {
    const { rerender } = render(<KubernetesVersionLabel />);
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();

    rerender(<KubernetesVersionLabel version='' />);
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();

    rerender(<KubernetesVersionLabel version='1.0.0' />);
    expect(screen.getByText(/1.0/i)).toBeInTheDocument();
  });

  it('can display the patch version of a given release', () => {
    render(<KubernetesVersionLabel version='1.0.0' hidePatchVersion={false} />);
    expect(screen.getByText(/1.0.0/i)).toBeInTheDocument();
  });

  it('can show or hide the kubernetes icon', () => {
    const { rerender } = render(<KubernetesVersionLabel version='1.0.0' />);
    expect(screen.getByTitle(/kubernetes version/i)).toBeInTheDocument();

    rerender(<KubernetesVersionLabel version='1.0.0' hideIcon={true} />);
    expect(screen.queryByTitle(/kubernetes version/i)).not.toBeInTheDocument();
  });

  it('can show if a version reached its EOL or not', async () => {
    const { rerender } = render(
      <KubernetesVersionLabel version='1.0.0' eolDate='1960-02-10' />
    );
    let versionLabel: HTMLElement | null = screen.getByText(/1.0 \(EOL\)/i);
    expect(versionLabel).toBeInTheDocument();

    let tooltipMessageRegexp = /This version reached its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );

    const now = new Date().toISOString();
    rerender(<KubernetesVersionLabel version='1.0.0' eolDate={now} />);
    versionLabel = screen.getByText(/1.0 \(EOL\)/i);
    expect(versionLabel).toBeInTheDocument();

    tooltipMessageRegexp = /This version reached its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );

    rerender(<KubernetesVersionLabel version='1.0.0' eolDate='2999-02-10' />);
    versionLabel = screen.queryByText(/1.0 \(EOL\)/i);
    expect(versionLabel).not.toBeInTheDocument();

    versionLabel = screen.getByText(/1.0/i);
    tooltipMessageRegexp = /This version will reach its end of life/i;
    fireEvent.mouseEnter(versionLabel);
    expect(screen.getByText(tooltipMessageRegexp)).toBeInTheDocument();
    fireEvent.mouseLeave(versionLabel);
    await waitForElementToBeRemoved(() =>
      screen.getByText(tooltipMessageRegexp)
    );
  });
});
