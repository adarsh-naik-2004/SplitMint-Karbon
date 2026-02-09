export default function Dashboard({ summary, user, onLogout }) {
  return (
    <header className="dashboard">
      <div className="dashboard-header">
        <div className="brand">
          <span className="brand-icon">💎</span>
          <h2>SplitMint</h2>
        </div>
        
        <div className="user-menu">
          <span className="user-name">👋 {user.name}</span>
          <button onClick={onLogout} className="logout-btn">
            <span>Logout</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <SummaryCard
          icon="💰"
          label="Total Spent"
          value={`₹${summary.totalSpent.toFixed(2)}`}
          gradient="from-emerald-500 to-teal-600"
        />
        <SummaryCard
          icon="📤"
          label="You Owe"
          value={`₹${Math.max(-summary.ownerNet, 0).toFixed(2)}`}
          gradient="from-rose-500 to-pink-600"
        />
        <SummaryCard
          icon="📥"
          label="Owed To You"
          value={`₹${Math.max(summary.ownerNet, 0).toFixed(2)}`}
          gradient="from-blue-500 to-indigo-600"
        />
      </div>
    </header>
  );
}

function SummaryCard({ icon, label, value, gradient }) {
  return (
    <div className={`summary-card ${gradient}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <p className="card-label">{label}</p>
        <h3 className="card-value">{value}</h3>
      </div>
      <div className="card-shine"></div>
    </div>
  );
}