# Specification: Christmas Wishlist Application

## 1. Overview

A React-based web application allowing users to manage Christmas wishlists and coordinate gift-giving with friends. The core value proposition is preventing duplicate gifts while maintaining the element of surprise for the recipient.

## 2. User Roles

- **User (Wisher)**: Manages their own list, adds friends.
- **Friend (Gifter)**: Views lists, marks items as purchased, suggests ideas.

## 3. Functional Requirements

### 3.1 Authentication & User Management

- Users must register and login (Email/Password or Google Auth).
- Users can search for other users by email/username to add them as friends.

### 3.2 Wishlist Management (The "Wisher")

- Users can Create, Read, Update, and Delete (CRUD) items on their own wishlist.
- Item fields: Title, Description, URL (optional), Price (optional), Priority.
- **Constraint**: The Wisher CANNOT see the "Taken" status of their own items.

### 3.3 Friend Interaction (The "Gifter")

- Friends can view a user's wishlist.
- **Claiming Gifts**: Friends can mark an item as "Taken".
  - When marked "Taken", the UI shows _who_ took it (e.g., "Taken by Alice").
  - This prevents other friends from buying the same item.
  - This status is visible to all friends but HIDDEN from the Wisher.
- **Suggestions**: Friends can add "Suggested Items" to a user's list.
  - These items are visible to all friends.
  - These items are COMPLETELY HIDDEN from the Wisher.

## 4. Data Privacy & Security

- **Wisher Privacy**: The system must enforce that a user cannot fetch the "taken" status of their own items via the API/Database rules (preventing spoilers via network inspection).
- **Friend Access**: Only confirmed friends can view wishlists and claim items.

## 5. User Interface

- **Dashboard**: Shows own wishlist and list of friends.
- **Friend's View**: Shows the friend's wishlist with "Mark as Taken" buttons and "Add Suggestion" form.
- **Own View**: Shows own wishlist with edit controls, hiding all "Taken" indicators.
