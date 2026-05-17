# Delivery Man Portal - AgriConnect

## Overview
Complete delivery management system with 5 core pages for delivery personnel.

## Pages Implemented

### 1. Delivery Dashboard (`/delivery/dashboard`)
- Real-time statistics (total, pending, today's deliveries, avg time)
- Quick action buttons to assigned deliveries and history
- Recent activity feed showing last 5 completed deliveries
- Status indicators with visual cards

### 2. Assigned Deliveries (`/delivery/assigned`)
- Real-time list of active delivery assignments
- Status flow: assigned → accepted → picked_up → on_the_way → delivered
- Action buttons for each status transition
- Filter by status and search functionality
- Detailed pickup and delivery information
- Accept/Reject delivery with reason modal

### 3. Delivery History (`/delivery/history`)
- Complete history of delivered, cancelled, and rejected orders
- Date range filtering and search
- Delivery time calculations
- Export to CSV functionality
- Monthly summary statistics

### 4. Notifications (`/delivery/notifications`)
- Real-time notification system
- Types: new_delivery, cancellation, admin_message, system_alert
- Mark as read/unread functionality
- Delete notifications
- Filter by type and read status
- Unread count badge

### 5. Profile Settings (`/delivery/profile`)
- Personal information management
- Vehicle information (type, license plate)
- Availability status toggle (available/busy/offline)
- Account statistics display
- Profile photo upload support
- Logout functionality

## Firebase Collections

### deliveries
```javascript
{
  id: string,
  orderId: string,
  deliveryManId: string,
  deliveryManName: string,
  farmerId: string,
  farmerName: string,
  farmerPhone: string,
  farmerAddress: string,
  consumerId: string,
  consumerName: string,
  consumerPhone: string,
  consumerAddress: string,
  productName: string,
  quantity: number,
  totalPrice: number,
  status: 'assigned' | 'accepted' | 'rejected' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled',
  assignedAt: Timestamp,
  acceptedAt?: Timestamp,
  pickedUpAt?: Timestamp,
  onTheWayAt?: Timestamp,
  deliveredAt?: Timestamp,
  rejectionReason?: string,
  deliveryNotes?: string
}
```

### notifications
```javascript
{
  id: string,
  userId: string,
  type: 'new_delivery' | 'cancellation' | 'admin_message' | 'system_alert',
  title: string,
  message: string,
  read: boolean,
  createdAt: Timestamp,
  relatedDeliveryId?: string
}
```

### users (updated fields)
```javascript
{
  // existing fields...
  role: 'farmer' | 'consumer' | 'admin' | 'delivery_man',
  phone?: string,
  vehicleType?: string,
  vehiclePlate?: string,
  availabilityStatus?: 'available' | 'busy' | 'offline',
  totalDeliveries?: number,
  successRate?: number,
  avgRating?: number
}
```

## Updated Components

### AuthContext
- Added `delivery_man` role support
- Updated type definitions for signup and user data

### Navbar
- Added delivery man navigation links
- Conditional rendering based on user role

### ProtectedRoute
- Added `delivery_man` role to protected route types

### App.tsx
- Added 5 delivery portal routes with role protection

### Dashboard.tsx
- Added routing logic for delivery_man role

### Signup.tsx
- Added "Delivery Man" option in role selection

## Features

✅ Real-time data synchronization with Firebase
✅ Status-based workflow management
✅ Search and filter capabilities
✅ Notification system with read/unread tracking
✅ CSV export for delivery history
✅ Responsive design with Tailwind CSS
✅ Toast notifications for user feedback
✅ Protected routes with role-based access
✅ Profile management with vehicle information

## Usage

1. **Sign up** as a delivery man from the signup page
2. **Login** and get redirected to the delivery dashboard
3. **View assigned deliveries** and accept/reject them
4. **Update delivery status** as you progress through pickups and deliveries
5. **Check notifications** for new assignments and updates
6. **View history** of all completed deliveries
7. **Manage profile** and availability status

## Next Steps for Admin

Admins need to implement:
- Delivery man assignment feature in Order Management
- Create delivery records when assigning orders
- Send notifications to delivery personnel
- View delivery man performance metrics
