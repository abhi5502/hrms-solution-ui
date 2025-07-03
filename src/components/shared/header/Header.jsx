import "./Header.css"; // Import the CSS for the header

export const Header = () => {
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      // Add your search logic here
    }
  };

  const handleSearchClick = () => {
    const searchInput = document.querySelector(".search-input");
    if (searchInput.value.trim()) {
      // Add your search logic here
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-header">
          <div className="logo-container">
            <div className="logo-icon">HR</div>
            <div className="logo-text">
              <span className="company-name">HRMS</span>
              <span className="company-tagline">Human Resource Management</span>
            </div>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search employees, departments, reports..."
            className="search-input"
            onKeyUp={handleSearch}
          />
          <button className="search-btn" onClick={handleSearchClick}>
            🔍
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="action-btn">🌐</button>
          <button className="action-btn">🌙</button>
          <button className="action-btn notification-btn">
            🔔 <span className="notification-badge">5</span>
          </button>

          <button className="action-btn">💬</button>
          <button className="action-btn">⚙️</button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">JS</div>
        </div>
      </div>
    </header>
  );
};
