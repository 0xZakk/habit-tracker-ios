---
Name: Create habit detail view
Status: To Do
---

## Description

Create a detailed view for individual habits that shows comprehensive information about the habit and its completion history.

### Navigation
- Add a "More Details" link in the expanded view of habits on the homepage
- Link should navigate to a dedicated habit detail page

### Header Section
- Display habit title
- Show a graph visualizing the habit streak over time

### Completion Log
- Display a paginated log of habit completions
- Initially show the 10 most recent completions
- Include a "Load More" button that:
  - Loads the next 10 entries when clicked
  - Continues to work until all entries are loaded
  - Should be hidden when all entries are loaded
- Each log entry should show:
  - Date of completion

### Action Buttons
- Add an "Edit Habit" button that allows modifying the habit
- Add a "Delete Habit" button for removing the habit

### Technical Requirements
- Implement pagination for the completion log
- Ensure efficient loading of completion data
- Maintain consistent state between list view and detail view
- Handle loading and error states appropriately 