import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, user, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states matching user screenshot
  const [firstName, setFirstName] = useState('Auditor First');
  const [lastName, setLastName] = useState('Auditor Last');
  const [email, setEmail] = useState('dharshana@gmail.com');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('Select Role...');
  const [password, setPassword] = useState('DemoSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect directly into the dashboard
  if (user && !isLoading) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Pre-configured role profiles
  const handleSelectRole = (roleKey: string) => {
    setSelectedRole(roleKey);
    setIsRoleDropdownOpen(false);
    setError(null);

    // In Sign In mode, autofill demo accounts for convenience
    if (mode === 'signin') {
      if (roleKey === 'Administrator' || roleKey === 'SuperAdmin') {
        setFirstName('Sam');
        setLastName('Administrator');
        setEmail('admin@acme.com');
        setPassword('DemoSecure2026!');
        setPhoneNumber('(555) 019-2831');
      } else if (roleKey === 'Reviewer' || roleKey === 'Auditor') {
        setFirstName('Auditor');
        setLastName('First');
        setEmail('reviewer@acme.com');
        setPassword('DemoSecure2026!');
        setPhoneNumber('(555) 234-5678');
      } else if (roleKey === 'Creator' || roleKey === 'Test role') {
        setFirstName('Alex');
        setLastName('Creator');
        setEmail('creator@acme.com');
        setPassword('DemoSecure2026!');
        setPhoneNumber('(555) 987-6543');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please provide your corporate work email.');
      return;
    }
    if (!password) {
      setError('Please provide your password.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await login(trimmedEmail, password);
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || trimmedEmail.split('@')[0];
        // Public signup creates Creator accounts only. Reviewer and Administrator accounts are created by an administrator.
        const roleEnum: 'CREATOR' | 'REVIEWER' | 'ADMINISTRATOR' = 'CREATOR';

        await signup({
          email: trimmedEmail,
          password,
          full_name: fullName,
          role: roleEnum,
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.message || (mode === 'signup' ? 'Registration failed.' : 'Authentication failed.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signin-page-wrapper">
      {/* ── 3D Geometric Floating Scene (matching screenshot) ── */}
      <div className="signin-geom-scene" aria-hidden="true">
        {/* Top-Left 3D Torus */}
        <div className="geom-torus-tl">
          <svg width="140" height="140" viewBox="0 0 150 150" fill="none">
            <defs>
              <radialGradient id="torusTLGrad" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#5b86ff" />
                <stop offset="50%" stopColor="#2c5bf0" />
                <stop offset="100%" stopColor="#14349a" />
              </radialGradient>
              <filter id="torusTLShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="-6" dy="14" stdDeviation="16" floodColor="#1a2d72" floodOpacity="0.45" />
              </filter>
            </defs>
            <g filter="url(#torusTLShadow)">
              <path
                d="M 75 18 C 108 18 134 42 134 75 C 134 108 108 132 75 132 C 42 132 16 108 16 75 C 16 42 42 18 75 18 Z M 75 48 C 60 48 48 60 48 75 C 48 90 60 102 75 102 C 90 102 102 90 102 75 C 102 60 90 48 75 48 Z"
                fill="url(#torusTLGrad)"
                transform="rotate(-15 75 75)"
              />
            </g>
          </svg>
        </div>

        {/* Bottom-Left 3D Torus */}
        <div className="geom-torus-bl">
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
            <g filter="url(#torusTLShadow)">
              <path
                d="M 75 18 C 108 18 134 42 134 75 C 134 108 108 132 75 132 C 42 132 16 108 16 75 C 16 42 42 18 75 18 Z M 75 48 C 60 48 48 60 48 75 C 48 90 60 102 75 102 C 90 102 102 90 102 75 C 102 60 90 48 75 48 Z"
                fill="url(#torusTLGrad)"
                transform="rotate(-30 75 75)"
              />
            </g>
          </svg>
        </div>

        {/* Top-Right 3D Cube */}
        <div className="geom-cube-tr">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <defs>
              <linearGradient id="cTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7da2ff" />
                <stop offset="100%" stopColor="#4f79f5" />
              </linearGradient>
              <linearGradient id="cLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b66e8" />
                <stop offset="100%" stopColor="#254bc4" />
              </linearGradient>
              <linearGradient id="cRight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2950d6" />
                <stop offset="100%" stopColor="#1a359e" />
              </linearGradient>
              <filter id="cShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="8" dy="16" stdDeviation="14" floodColor="#1e327b" floodOpacity="0.4" />
              </filter>
            </defs>
            <g filter="url(#cShadow)">
              <polygon points="70,18 122,46 70,74 18,46" fill="url(#cTop)" />
              <polygon points="18,46 70,74 70,126 18,98" fill="url(#cLeft)" />
              <polygon points="70,74 122,46 122,98 70,126" fill="url(#cRight)" />
            </g>
          </svg>
        </div>

        {/* Bottom-Right 3D Pyramid / Octahedron */}
        <div className="geom-pyramid-br">
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="pyrTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5580f8" />
                <stop offset="100%" stopColor="#2c5bf0" />
              </linearGradient>
              <linearGradient id="pyrSide" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1f44c4" />
                <stop offset="100%" stopColor="#132c86" />
              </linearGradient>
            </defs>
            <polygon points="50,15 88,68 50,88" fill="url(#pyrTop)" />
            <polygon points="50,15 12,68 50,88" fill="url(#pyrSide)" />
          </svg>
        </div>

        {/* Floating Depth Sphere */}
        <div className="geom-sphere-br" />

        {/* Sparkle Star Bottom Right */}
        <div className="geom-sparkle-br">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <path d="M 20 0 Q 20 20 40 20 Q 20 20 20 40 Q 20 20 0 20 Q 20 20 20 0 Z" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      </div>

      {/* ── Top Bar matching screenshot ── */}
      <div className="signin-top-bar">
        {/* Back to Home Pill Button */}
        <button
          type="button"
          className="signin-back-pill"
          onClick={() => navigate('/')}
        >
          <span style={{ fontSize: 15 }}>←</span> Back to Home
        </button>

        {/* Floating Center/Right Pill Navbar */}
        <div className="signin-nav-pill">
          <div className="signin-nav-brand" onClick={() => navigate('/')}>
            <span className="signin-brand-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 5, background: '#4f46e5', color: '#fff', fontSize: 11, fontWeight: 800 }}>BS</span>
            <span className="signin-brand-title">BrandShield AI</span>
          </div>

          <div className="signin-nav-links">
            <button type="button" className="signin-nav-item" onClick={() => navigate('/')}>
              Features
            </button>
            <button type="button" className="signin-nav-item" onClick={() => navigate('/')}>
              Integrations
            </button>
            <button type="button" className="signin-nav-item" onClick={() => navigate('/')}>
              Governance
            </button>
            <button type="button" className="signin-nav-item" onClick={() => navigate('/')}>
              Solutions
            </button>
            <button
              type="button"
              className="signin-nav-item"
              onClick={() => setShowSupportModal(true)}
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Dual-Card Container ── */}
      <div className="signin-main-container">
        {/* Global Error Banner */}
        {error && (
          <div className="signin-error-toast" role="alert">
            <span style={{ fontSize: 14, fontWeight: 700, padding: '2px 6px', background: '#ef4444', color: '#fff', borderRadius: '50%' }}>!</span>
            <div style={{ flex: 1 }}>{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              X
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-cards-grid">
          {/* ══════ LEFT CARD: USER DETAILS ══════ */}
          <div className="signin-glass-card signin-card-left">
            <h2 className="card-section-heading">USER DETAILS</h2>

            {/* Field: First Name */}
            <fieldset className="legend-fieldset">
              <legend className="legend-tag">First Name</legend>
              <input
                type="text"
                className="legend-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </fieldset>

            {/* Field: Last Name */}
            <fieldset className="legend-fieldset">
              <legend className="legend-tag">Last Name</legend>
              <input
                type="text"
                className="legend-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
              />
            </fieldset>

            {/* Field: Email */}
            <fieldset className="legend-fieldset">
              <legend className="legend-tag">Email</legend>
              <input
                type="email"
                className="legend-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                required
                autoComplete="email"
              />
            </fieldset>

            {/* Split Row: Country Code + Phone Number */}
            <div className="split-phone-row">
              {/* Country Code */}
              <fieldset className="legend-fieldset country-fieldset" ref={countryDropdownRef}>
                <legend className="legend-tag">Country Code</legend>
                <div
                  className="country-dropdown-btn"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <span className="code-text">{countryCode}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {showCountryDropdown && (
                  <div className="country-menu">
                    <div
                      className="country-option"
                      onClick={() => { setCountryCode('+1'); setShowCountryDropdown(false); }}
                    >
                      United States (+1)
                    </div>
                    <div
                      className="country-option"
                      onClick={() => { setCountryCode('+44'); setShowCountryDropdown(false); }}
                    >
                      United Kingdom (+44)
                    </div>
                    <div
                      className="country-option"
                      onClick={() => { setCountryCode('+49'); setShowCountryDropdown(false); }}
                    >
                      Germany (+49)
                    </div>
                    <div
                      className="country-option"
                      onClick={() => { setCountryCode('+91'); setShowCountryDropdown(false); }}
                    >
                      India (+91)
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Phone Number */}
              <fieldset className="legend-fieldset phone-fieldset">
                <legend className="legend-tag">Phone Number</legend>
                <div className="phone-input-wrap">
                  <input
                    type="tel"
                    className="legend-input phone-inner-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
              </fieldset>
            </div>

            {/* Bottom notice */}
            <div className="left-card-footer-note">
              {mode === 'signup' ? (
                <>
                  <span style={{ color: '#10b981', marginRight: 4, fontWeight: 700 }}>•</span> Self-Serve Access · Sign up enabled
                </>
              ) : (
                <>
                  <span className="orange-dot">•</span> Managed Access · Public registration enabled
                </>
              )}
            </div>
          </div>

          {/* ══════ RIGHT CARD: SIGN IN / SIGN UP ══════ */}
          <div className="signin-glass-card signin-card-right">
            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: mode === 'signin' ? '#ffffff' : 'transparent',
                  color: mode === 'signin' ? '#1e293b' : 'var(--text-secondary)',
                  boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  if (email === 'dharshana@gmail.com' || email.includes('@acme.com')) {
                    setEmail('');
                    setFirstName('');
                    setLastName('');
                    setPassword('');
                    setSelectedRole('Test role');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: mode === 'signup' ? '#ffffff' : 'transparent',
                  color: mode === 'signup' ? '#1e293b' : 'var(--text-secondary)',
                  boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Sign Up
              </button>
            </div>

            <h1 className="signin-main-heading">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h1>

            {mode === 'signup' ? (
              <div className="role-section-wrapper">
                <label className="role-eyebrow-label">ROLE</label>
                <div className="role-select-box" style={{ background: 'rgba(255, 255, 255, 0.85)', cursor: 'default' }}>
                  <span className="role-selected-text">Creator</span>
                  <span className="role-item-tag creator" style={{ marginLeft: 8 }}>CREATOR ONLY</span>
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                  Public sign up creates Creator accounts only. Reviewer and Administrator accounts are provisioned by an administrator.
                </div>
              </div>
            ) : (
              <div className="role-section-wrapper" ref={roleDropdownRef}>
                <label className="role-eyebrow-label">ROLE</label>

                {/* Role Dropdown Box */}
                <div
                  className={`role-select-box ${isRoleDropdownOpen ? 'role-box-open' : ''}`}
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                >
                  <span className="role-selected-text">{selectedRole}</span>
                  <span className="role-arrow">▼</span>
                </div>

                {/* Role Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div className="role-dropdown-menu">
                    <div
                      className={`role-menu-item ${selectedRole === 'Creator' || selectedRole === 'Test role' ? 'active' : ''}`}
                      onClick={() => handleSelectRole('Creator')}
                    >
                      <span className="role-item-name">Creator</span>
                      <span className="role-item-tag creator">CREATOR</span>
                    </div>

                    <div
                      className={`role-menu-item ${selectedRole === 'Reviewer' || selectedRole === 'Auditor' ? 'active' : ''}`}
                      onClick={() => handleSelectRole('Reviewer')}
                    >
                      <span className="role-item-name">Reviewer</span>
                      <span className="role-item-tag reviewer">REVIEWER</span>
                    </div>

                    <div
                      className={`role-menu-item ${selectedRole === 'Administrator' || selectedRole === 'SuperAdmin' ? 'active' : ''}`}
                      onClick={() => handleSelectRole('Administrator')}
                    >
                      <span className="role-item-name">Administrator</span>
                      <span className="role-item-tag admin">ADMIN</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seamless Password Field (integrated fieldset) */}
            <fieldset className="legend-fieldset password-fieldset">
              <legend className="legend-tag">Password</legend>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="legend-input password-inner-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </fieldset>

            {/* Action Button */}
            <button
              type="submit"
              className="create-account-or-signin-btn"
              disabled={submitting}
            >
              {submitting
                ? (mode === 'signup' ? 'Creating Account…' : 'Authenticating…')
                : (mode === 'signup' ? 'Create Account & Sign In   →' : 'Sign In   →')}
            </button>

            {/* Mode Switcher & Support Footer */}
            <div className="signin-support-footer">
              {mode === 'signin' ? (
                <>
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="contact-support-link"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      if (email === 'dharshana@gmail.com' || email.includes('@acme.com')) {
                        setEmail('');
                        setFirstName('');
                        setLastName('');
                        setPassword('');
                        setSelectedRole('Test role');
                      }
                    }}
                    style={{ fontWeight: 700, color: '#4f46e5' }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    className="contact-support-link"
                    onClick={() => { setMode('signin'); setError(null); }}
                    style={{ fontWeight: 700, color: '#4f46e5' }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ── Contact Support Workspace Modal ── */}
      {showSupportModal && (
        <div className="modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="support-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 800 }}>BS</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Workspace Access &amp; Support
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSupportModal(false)}
              >
                X
              </button>
            </div>
            <div className="support-modal-body">
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 16 }}>
                BrandShield AI uses <strong>Managed Role-Based Access</strong>. Public self-registration
                is disabled to prevent unauthorized compliance clearance.
              </p>
              <div className="support-box">
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Request New Access
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  Email your designated organization administrator or reach support at:{' '}
                  <a href="mailto:support@brandshield.ai" style={{ color: '#4f46e5', fontWeight: 600 }}>
                    support@brandshield.ai
                  </a>
                </div>
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
                <em>Authorized test accounts:</em> Select <strong>SuperAdmin</strong>, <strong>Auditor</strong>, or <strong>Test role</strong> in the role dropdown to sign in instantly.
              </div>
            </div>
            <div className="support-modal-footer">
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setShowSupportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
