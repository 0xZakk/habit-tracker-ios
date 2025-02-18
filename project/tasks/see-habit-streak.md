---
Name: See the streak for that habit
Status: To Do
---

## Description

Add an expandable streak visualization to each habit in the list view.

### Interaction
- Clicking anywhere on the habit item (except the checkbox) should toggle an expanded view below
- The expanded view should slide down/up smoothly

### Streak Visualization
- Show a calendar-style streak counter that displays:
  - Last 30 days OR
  - All days since habit creation (if less than 30 days)
- Each day should be represented as a box/circle that is:
  - Filled/colored for completed days
  - Grey/empty for missed days

### Statistics
- Above the streak visualization, show a rolling adherence rate
- Format: "X/Y days completed" where:
  - X = number of completions in the last 30 days
  - Y = total possible days (30 or days since creation if less)
- Example: "21/30 days completed"

### Technical Requirements
- Efficient loading of completion data
- Smooth animations for expand/collapse
- Maintain visual consistency with the rest of the app
- Handle edge cases (new habits, no completions)

