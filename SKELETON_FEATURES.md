# Skeleton Loading Features

## Overview
The Role List page now includes professional skeleton loading states to enhance user experience during data fetching and operations.

## Features Implemented

### 1. **Initial Page Load Skeleton**
- Displays when the page first loads and fetches roles from the API
- Shows skeleton placeholders for:
  - Page title
  - Add Role button
  - Table header (S.No, Role Name, Status, Actions)
  - 6 skeleton rows with proper column sizing

### 2. **Operation Loading Overlay**
- Shows a semi-transparent overlay during CRUD operations
- Displays "Processing..." message in the center
- Prevents user interaction during operations
- Applied during:
  - Creating new roles
  - Updating existing roles
  - Deleting roles

### 3. **Skeleton Design Features**
- **Professional Animation**: Shimmer effect with gradient animation
- **Accurate Sizing**: Skeleton elements match actual content dimensions
- **Dark Theme**: Consistent with the application's dark theme
- **Responsive**: Adapts to different screen sizes

## Technical Implementation

### CSS Classes Added:
- `.skeleton-container` - Container for skeleton content
- `.skeleton-row` - Individual skeleton table rows
- `.skeleton-cell` - Individual skeleton cells with different sizes
- `.skeleton-table` - Skeleton table structure
- `.table-loading-overlay` - Overlay for operation loading
- `@keyframes loading` - Shimmer animation

### JavaScript Features:
- Separate `RolesSkeleton` component for reusability
- `operationLoading` state for granular loading control
- Proper key generation for skeleton elements
- Disabled states for buttons during operations

## User Experience Benefits

1. **Perceived Performance**: Users see immediate visual feedback
2. **Loading Context**: Clear indication of what content is loading
3. **Professional Feel**: Smooth animations and proper styling
4. **Non-blocking**: Operations show overlay without hiding content
5. **Accessibility**: Loading states are clearly communicated

## Usage

The skeleton automatically displays:
- On initial page load (when `loading` is true)
- During operations (when `operationLoading` is true)
- Falls back gracefully if data loading fails

The implementation follows React best practices and maintains consistency with the existing dark theme design.
