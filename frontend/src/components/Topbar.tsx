interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">
        <span className="badge badge-success">● API Connected</span>
        <span className="badge badge-info">v1.0.0</span>
        <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, cursor: 'pointer' }}>A</div>
      </div>
    </header>
  )
}
