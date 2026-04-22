import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, resetPassword, forceReset } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.forceReset) {
        // Stay on page — forceReset flag shows password reset form
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(newPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Force reset password form
  if (forceReset) {
    return (
      <div className="login-page">
        <div className="login-bg">
          <div className="login-orb login-orb1" />
          <div className="login-orb login-orb2" />
          <div className="login-orb login-orb3" />
        </div>
        <div className="login-container" style={{ justifyContent: 'center' }}>
          <div className="login-right">
            <div className="login-card">
              <div className="login-card-header">
                <h3>Set New Password</h3>
                <p>This is your first login. Please set a secure password to continue.</p>
              </div>
              <form onSubmit={handleResetPassword} className="login-form">
                <div className="form-group">
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="login-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
                  {loading ? (
                    <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                  {loading ? 'Saving...' : 'Set Password & Continue'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb1" />
        <div className="login-orb login-orb2" />
        <div className="login-orb login-orb3" />
      </div>

      <div className="login-container">
        {/* Left panel */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-logo">A</div>
            <div>
              <h1 className="login-brand-name">AttendX</h1>
              <p className="login-brand-sub">Smart Attendance System</p>
            </div>
          </div>
          <h2 className="login-tagline">
            Track. Monitor.<br />
            <span>Empower.</span>
          </h2>
          <p className="login-desc">
            A unified platform for GPS-verified attendance, overtime tracking, group communication, and leave management.
          </p>
          <div className="login-feature-list">
            {[
              'GPS-verified check-in & check-out',
              'Real-time team attendance monitoring',
              'Leave management & approvals',
              'Group chat & notifications',
            ].map(f => (
              <div key={f} className="login-feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h3>Welcome Back</h3>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    className="input input-with-icon"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input input-with-icon input-with-toggle"
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
                {loading ? (
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
