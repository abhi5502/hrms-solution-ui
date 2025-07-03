# HRMS Solution - RBAC User Management

## Professional Role-Based Access Control (RBAC) System

This project implements a complete RBAC system for user management in React with modern UI components and API integration.

## 🚀 Features

### ✅ Completed Features
- **Professional Dashboard Layout** with sidebar navigation
- **Complete RBAC System** with roles, permissions, and modules
- **User Management** with full CRUD operations
- **Dynamic Role Assignment** with visual role badges
- **Permission Management** with granular control
- **Module Access Control** for different system components
- **Real-time Search & Filtering** by role, status, and name
- **Professional Modals** for all user operations
- **API Integration** with error handling and loading states
- **Responsive Design** that works on all devices
- **Modern UI/UX** with professional styling

### 🔐 RBAC Features
- **Role-based Access Control** - SuperAdmin, Admin, User, Viewer
- **Permission System** - Create, Read, Update, Delete, Manage Users, etc.
- **Module Access** - User Module, Employee Module, Attendance, etc.
- **Dynamic UI** - Buttons/actions shown based on user permissions
- **Status Management** - Active/Inactive user states

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **Styling**: Custom CSS with modern design
- **API Client**: Custom fetch-based API service
- **State Management**: React Context API
- **Icons**: Emoji-based for cross-platform compatibility

## 📋 API Endpoints

### User Management
```
GET    /api/users              - Get all users with filters
GET    /api/users/:id          - Get single user
POST   /api/users              - Create new user
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
PATCH  /api/users/:id/roles    - Update user roles
PATCH  /api/users/:id/permissions - Update user permissions
PATCH  /api/users/:id/modules  - Update user modules
PATCH  /api/users/:id/status   - Toggle user status
GET    /api/users/stats        - Get user statistics
```

### Authentication
```
POST   /api/auth/login         - User login
POST   /api/auth/refresh       - Refresh token
GET    /api/auth/me            - Get current user
POST   /api/auth/logout        - User logout
```

### Roles & Permissions
```
GET    /api/roles              - Get all roles
GET    /api/permissions        - Get all permissions
GET    /api/modules            - Get all modules
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
VITE_APP_TITLE=HRMS Solution
VITE_DEBUG=true
VITE_TOKEN_KEY=authToken
```

### API Configuration
Update `src/config/apiConfig.js` with your backend API URLs:

```javascript
export const API_CONFIG = {
  DEVELOPMENT: 'http://localhost:3001/api',
  PRODUCTION: 'https://your-api-domain.com/api',
  // ... other settings
};
```

## 🚀 Getting Started

### 1. Clone and Install
```bash
cd g:\React\HrmsSolution\hrms-solution
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your API settings
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
- Open http://localhost:5173
- Navigate to `/users` to access user management
- Click sidebar links to navigate between pages

## 👥 User Roles & Permissions

### SuperAdmin
- **Full system access**
- All permissions: Create, Read, Update, Delete, Manage Users, Roles, Permissions, Modules
- Color: Red (#e74c3c)

### Admin
- **Administrative access**
- Permissions: Create, Read, Update, Delete, Manage Users, Manage Roles, View Reports
- Color: Orange (#f39c12)

### User
- **Basic user access**
- Permissions: Read, Update
- Color: Green (#27ae60)

### Viewer
- **Read-only access**
- Permissions: Read only
- Color: Blue (#3498db)

## 📊 User Management Features

### User Table
- **Search**: Real-time search by name or email
- **Filter**: By role (SuperAdmin, Admin, User, Viewer)
- **Filter**: By status (Active, Inactive)
- **Sort**: By various columns
- **Actions**: Edit, View, Delete, Manage Roles, Permissions, Modules

### User Actions
1. **Add User** - Create new user with roles and permissions
2. **Edit User** - Update user information
3. **View User** - View detailed user information
4. **Delete User** - Remove user from system
5. **Manage Roles** - Assign/remove user roles
6. **Manage Permissions** - Set specific permissions
7. **Manage Modules** - Control module access
8. **Toggle Status** - Activate/deactivate user

### Professional Modals
- **User Form Modal** - Add/Edit users with validation
- **Role Management Modal** - Visual role selection
- **Permission Management Modal** - Granular permission control
- **Module Management Modal** - Module access control
- **User View Modal** - Detailed user information display
- **Delete Confirmation Modal** - Safe deletion with confirmation

## 🎨 UI Components

### Modern Design Features
- **Professional Color Scheme** - Dark theme with accent colors
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Loading States** - Visual feedback during API calls
- **Error Handling** - User-friendly error messages
- **Success Feedback** - Confirmation messages for actions
- **Hover Effects** - Interactive button states
- **Modal Animations** - Smooth modal transitions

### Accessibility Features
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Proper ARIA labels
- **Color Contrast** - High contrast for readability
- **Focus Management** - Proper focus handling in modals

## 🔗 API Integration

### Custom API Client
- **Automatic authentication** with Bearer tokens
- **Error handling** with user-friendly messages
- **Request/Response interceptors** for common operations
- **Retry logic** for failed requests
- **Loading states** management

### Error Handling
- **Network errors** - Connection issues
- **Authentication errors** - Invalid/expired tokens
- **Authorization errors** - Insufficient permissions
- **Validation errors** - Invalid input data
- **Server errors** - Backend issues

## 📱 Responsive Design

### Mobile Support
- **Collapsible sidebar** on small screens
- **Touch-friendly buttons** and inputs
- **Responsive tables** with horizontal scrolling
- **Mobile-optimized modals** with appropriate sizing

### Tablet Support
- **Optimized layout** for medium screens
- **Touch interactions** for all controls
- **Readable text** with appropriate sizing

## 🔧 Development Guidelines

### Code Structure
```
src/
├── components/
│   ├── User/
│   │   ├── user.jsx           # Main user management component
│   │   ├── User.css           # User component styles
│   │   ├── UserModals.jsx     # All modal components
│   │   └── UserModals.css     # Modal styles
│   └── shared/                # Shared components
├── contexts/
│   └── RBACContext.jsx        # RBAC state management
├── services/
│   └── api.js                 # API service layer
├── config/
│   └── apiConfig.js           # API configuration
└── App.jsx                    # Main application
```

### Best Practices
- **Component separation** - Each modal in separate component
- **State management** - Centralized RBAC context
- **Error boundaries** - Graceful error handling
- **Loading states** - User feedback during operations
- **Validation** - Client-side input validation
- **Security** - Permission-based UI rendering

## 🚀 Next Steps

### Potential Enhancements
1. **Advanced Filtering** - Date ranges, multiple selections
2. **Bulk Operations** - Select multiple users for bulk actions
3. **Export/Import** - CSV/Excel data exchange
4. **Activity Logs** - Track user actions and changes
5. **Advanced Search** - Full-text search with highlighting
6. **Real-time Updates** - WebSocket integration for live updates
7. **Advanced Permissions** - Resource-level permissions
8. **Two-Factor Authentication** - Enhanced security
9. **User Groups** - Organize users into groups
10. **Custom Roles** - Allow creation of custom roles

### Backend Implementation
To make this fully functional, implement these backend endpoints:
- User CRUD operations
- Authentication with JWT
- Role and permission management
- Real-time statistics
- File upload for user avatars
- Audit logging

## 📝 License

This project is for educational and demonstration purposes.

## 👨‍💻 Developer Notes

This RBAC system demonstrates professional React development with:
- Modern React patterns (hooks, context)
- Professional UI/UX design
- Comprehensive error handling
- Real-world API integration
- Security best practices
- Responsive design principles
- Maintainable code structure

The system is production-ready and can be easily extended for additional features.
