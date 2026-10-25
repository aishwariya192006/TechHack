interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const navItems = [
  { id: 'dashboard',   icon: '⬡', label: 'Dashboard' },
  { id: 'analysis',    icon: '🔍', label: 'Brand Analysis' },
  { id: 'submissions', icon: '📄', label: 'Submissions' },
  { id: 'guidelines',  icon: '📋', label: 'Guidelines' },
  { id: 'audit',       icon: '🕵️', label: 'Audit Log' },
]

const bottomItems = [
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <div className="logo-text">BrandShield</div>
          <div className="logo-sub">AI Compliance</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>System</div>
        {bottomItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="avatar">A</div>
          <div>
            <div className="user-name">Admin User</div>
            <div className="user-role">ADMINISTRATOR</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>▸</span>
        </div>
      </div>
    </aside>
  )
}
