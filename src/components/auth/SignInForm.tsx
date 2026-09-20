import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asyncData, setAsyncData] = useState<string | null>(null);
  const { signIn } = useAuth();

  const validateEmail = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Email address is required.';
    }
    // Basic standard email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleChange = (newVal: string) => {
    setEmail(newVal);
    // Clearing error when user corrects input (allows proving absence with queryBy*)
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setAsyncData(null);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Async operation: simulate authentication / loading user profile data
      await new Promise((resolve) => setTimeout(resolve, 300));

      const trimmedEmail = email.trim();
      signIn(trimmedEmail);
      setAsyncData(`Welcome back! Session initialized for ${trimmedEmail}`);

      if (onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sign-in-form" noValidate>
      <div className="form-group">
        <label htmlFor="auth-email-input" className="form-label">
          Email Address
        </label>
        <input
          id="auth-email-input"
          type="email"
          className={`form-input ${error ? 'input-error' : ''}`}
          placeholder="developer@example.com"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isSubmitting}
          autoComplete="email"
        />
      </div>

      {/* Validation error with role="alert" */}
      {error && (
        <p role="alert" className="form-error-banner">
          {error}
        </p>
      )}

      {/* Async resolved data with role="status" */}
      {asyncData && (
        <div role="status" className="form-success-banner">
          {asyncData}
        </div>
      )}

      <button
        type="submit"
        className="form-submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
