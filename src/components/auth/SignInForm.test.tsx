import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { SignInForm } from './SignInForm';

function renderWithAuth(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('SignInForm User-Centric Tests', () => {
  it('renders the form with an accessible email input queried by label text', () => {
    renderWithAuth(<SignInForm />);

    // Renders and queries strictly via getByLabelText (user-centric)
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeDefined();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDefined();

    // Prove absence initially: no validation error present before submission
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('displays a validation error when submitted with an empty input', async () => {
    const user = userEvent.setup();
    renderWithAuth(<SignInForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Validation error appears with role="alert"
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage.textContent).toMatch(/email address is required/i);
  });

  it('displays a validation error when typing an invalid email and disappears when corrected', async () => {
    const user = userEvent.setup();
    renderWithAuth(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Type invalid email and submit
    await user.type(emailInput, 'invalid-email-format');
    await user.click(submitButton);

    expect(screen.getByRole('alert').textContent).toMatch(/please enter a valid email address/i);

    // Prove absence: typing valid input clears the error immediately
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');

    // queryByRole returns null once conditional error element is gone
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('waits for async response data with findBy upon valid submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithAuth(<SignInForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'alex@engineer.com');
    await user.click(submitButton);

    // Async test that waits for data with findBy (findByText / findByRole)
    const successStatus = await screen.findByRole('status');
    expect(successStatus.textContent).toContain('Session initialized for alex@engineer.com');

    const successMessage = await screen.findByText(/welcome back/i);
    expect(successMessage).toBeDefined();

    // Verify callback was invoked
    expect(onSuccess).toHaveBeenCalled();
  });

  it('handles rapid typing edge-case cleanly without dropping characters or corrupting input', async () => {
    const user = userEvent.setup();
    renderWithAuth(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;

    // Rapid typing simulation
    await user.type(emailInput, 'rapid.typing.tester@company.co');
    expect(emailInput.value).toBe('rapid.typing.tester@company.co');

    // Hit enter to submit directly from keyboard
    await user.keyboard('{Enter}');

    const statusBanner = await screen.findByRole('status');
    expect(statusBanner.textContent).toContain('rapid.typing.tester@company.co');
  });
});
