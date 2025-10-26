# Announcements System

## Overview
A lightweight, scalable announcement system for Vaultopolis that supports featured banners and a notification center.

## Components

### 1. AnnouncementContext (`src/context/AnnouncementContext.js`)
Manages all announcements and their state:
- Stores announcements list
- Tracks dismissed banners in localStorage
- Tracks last read time in localStorage
- Provides helper functions for featured announcements and unread counts

### 2. NotificationCenter Component (`src/components/NotificationCenter.js`)
The bell icon in the header with dropdown:
- Shows red dot when unread announcements exist
- Opens dropdown panel with all announcements
- Marks announcements as read when opened
- Links to full details

### 3. Featured Banner (in `src/pages/Swap.js`)
Shows the most important announcement as a banner:
- Only shows announcements marked as `featured: true`
- Dismissible via X button
- Persists in localStorage until dismissed

## How to Add Announcements

Edit `src/context/AnnouncementContext.js` and add to the `announcements` array:

```javascript
{
  id: 'unique-id',           // Unique identifier
  title: 'Your Title',       // Display title
  snippet: 'Short desc',     // Brief description
  link: '/path#anchor',      // Where to link
  date: new Date('2025-01-15'), // When it was published
  featured: true,            // Show in banner? (only one should be featured)
  category: 'Campaign'       // Category name
}
```

## Adding New Announcements

### Regular Announcements (Non-Featured)
Set `featured: false`. They'll only appear in the notification center.

### Featured Announcements  
Set `featured: true`. This will appear in the homepage banner. **Only one announcement should be featured at a time.**

Example for vault reseeding:
```javascript
{
  id: 'vault-reseed-jan',
  title: '🏀 Vault Reseed Complete',
  snippet: 'New Moments added to TSHOT vault. Check out the latest additions.',
  link: '/vaults/tshot',
  date: new Date('2025-01-20'),
  featured: true,
  category: 'Vault'
}
```

## User Experience

1. **New User**: Sees banner for featured announcement
2. **Existing User Who Dismissed**: Banner is hidden, but can access via bell icon
3. **Returning User**: Red dot appears on bell if there are unread announcements
4. **Notification Center**: All announcements are always accessible via the bell icon

## Technical Details

- **Storage**: Uses localStorage (works for anonymous users)
- **Read State**: Tracks timestamp of last read
- **Dismissed State**: Tracks which featured banners have been dismissed
- **No Database**: All state is local to the user's browser

## Future Enhancements

- Add `/news` page as archive for detailed posts
- Support multiple featured announcements (rotating)
- Time-limited featured announcements (auto-remove after X days)
- Priority levels (critical, important, regular)

