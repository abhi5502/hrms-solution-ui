import "./Dashboard.css";

export const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Sales Dashboard</h1>
        <div className="date-filter">
          <span>2016-10-10 to 2016-10-20</span>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Products</h3>
            <div className="card-icon products">📦</div>
          </div>
          <div className="card-value">854</div>
          <div className="card-change positive">Increased By 2.56% ↑</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Users</h3>
            <div className="card-icon users">👥</div>
          </div>
          <div className="card-value">31,876</div>
          <div className="card-change positive">Increased By 0.34% ↑</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Revenue</h3>
            <div className="card-icon revenue">💰</div>
          </div>
          <div className="card-value">$34,241</div>
          <div className="card-change positive">Increased By 7.66% ↑</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Sales</h3>
            <div className="card-icon sales">📊</div>
          </div>
          <div className="card-value">1,76,586</div>
          <div className="card-change negative">Decreased By 0.74% ↓</div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Sales Overview</h3>
          <div className="chart-placeholder">
            <p>Chart will be displayed here</p>
          </div>
        </div>

        <div className="stats-container">
          <h3>Order Statistics</h3>
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">3,736</span>
              <span className="stat-change">↗ 0.57%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
