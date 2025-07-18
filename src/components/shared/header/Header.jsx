import "./Header.css"; // Import the CSS for the header

// Helper to get user initials from localStorage
function getUserInitials() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      if (firstName || lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
    }
  } catch {
    // ignore error
  }
  return "U";
}

function getUserFullName() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
  } catch {
    // ignore error
  }
  return "User";
}

export const Header = () => {
  const navigateToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
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

  const initials = getUserInitials();
  const fullName = getUserFullName();
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
          <div className="user-avatar" title={fullName}>{initials}</div>
          <button className="logout-btn" onClick={navigateToLogin} title="Logout">Logout</button>
        </div>
      </div>
    </header>
  );
};
