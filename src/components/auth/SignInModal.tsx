import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const { signIn } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      signIn(email);
      setEmail('');
      onClose();
    }
  };

  const handleQuickSignIn = (demoEmail: string) => {
    signIn(demoEmail);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Sign in to your account</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label htmlFor="auth-email" className="modal-label">
            Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            className="modal-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <button type="submit" className="modal-submit-btn">
            Sign In
          </button>
        </form>

        <div className="modal-quick-login">
          <p className="quick-login-label">Or quick sign in as:</p>
          <div className="quick-login-buttons">
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickSignIn('alex@example.com')}
            >
              alex@example.com
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickSignIn('sarah@developer.io')}
            >
              sarah@developer.io
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
