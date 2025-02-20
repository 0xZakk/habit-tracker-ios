---
Name: Fix app routing structure
Status: Done
---

## Description

Simplify and fix the app's routing structure to have a clear, straightforward navigation flow.

### Core Routes
- `@index.tsx` - Main habits list (home screen)
- `@[id].tsx` - Habit detail view
- `@new.tsx` - New habit form
- `@auth.tsx` - Authentication screen

### Authentication Flow
- Unauthenticated users should be redirected to `@auth.tsx`
- After successful sign-in, users should be redirected to the index page
- All other routes should require authentication

### Technical Requirements
- Remove tab-based navigation in favor of simple stack navigation
- Ensure proper route protection based on authentication state
- Clean up any duplicate route files
- Update all navigation calls to use the new routing structure
- Handle loading states during authentication checks

### Implementation Steps
1. Remove tab-based navigation and associated files
2. Set up proper authentication redirection in root layout
3. Update navigation links and handlers throughout the app
4. Test all navigation flows and edge cases 