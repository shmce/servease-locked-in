// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function renderReport() {
  const { LookerStudioReport } = await import('./LookerStudioReport');
  render(<LookerStudioReport />);
}

describe('Looker Studio report page', () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL;
  });

  it('shows a missing configuration message when no embed URL is set', async () => {
    await renderReport();

    expect(screen.getByText('Data Studio')).toBeInTheDocument();
    expect(screen.getByText('Missing report URL')).toBeInTheDocument();
    expect(
      screen.getByText(/NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL/),
    ).toBeInTheDocument();
  });

  it('renders the configured Looker Studio iframe', async () => {
    process.env.NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL =
      'https://lookerstudio.google.com/embed/reporting/c2f923c7-6956-405c-b289-338a310db567/page/p_qgibixhw3d';

    await renderReport();

    expect(screen.getByTitle('Looker Studio analytics report')).toHaveAttribute(
      'src',
      process.env.NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL,
    );
    expect(
      screen.getByRole('link', { name: /open in looker studio/i }),
    ).toHaveAttribute(
      'href',
      'https://lookerstudio.google.com/reporting/c2f923c7-6956-405c-b289-338a310db567/page/p_qgibixhw3d',
    );
  });
});
