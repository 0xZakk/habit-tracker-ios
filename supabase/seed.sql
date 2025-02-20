-- First, insert two habits
INSERT INTO habits (id, name, created_at, user_id)
VALUES 
  ('c47c3b10-9809-4c33-a1c5-2fb83f7741d4'::uuid, 'Morning Meditation', '2024-01-18T08:00:00Z', '4f9b2a76-bf75-4d74-89d8-80b5df2d8ad0'::uuid),
  ('f8b4c912-d767-4c5a-9f42-9c1b5e8c9f7a'::uuid, 'Evening Workout', '2024-01-18T08:00:00Z', '4f9b2a76-bf75-4d74-89d8-80b5df2d8ad0'::uuid);

-- Then, generate completions with some randomization
WITH RECURSIVE dates AS (
  SELECT '2025-01-18'::date AS date
  UNION ALL
  SELECT date + 1
  FROM dates
  WHERE date < '2025-02-18'
),
random_completions AS (
  SELECT 
    date,
    habit_id,
    -- Generate random true/false with 80% true for first habit, 70% for second
    CASE 
      WHEN habit_id = 'c47c3b10-9809-4c33-a1c5-2fb83f7741d4'::uuid THEN random() < 0.8
      ELSE random() < 0.7
    END as should_insert
  FROM dates
  CROSS JOIN (
    SELECT unnest(ARRAY[
      'c47c3b10-9809-4c33-a1c5-2fb83f7741d4'::uuid,
      'f8b4c912-d767-4c5a-9f42-9c1b5e8c9f7a'::uuid
    ]) as habit_id
  ) habits
)
INSERT INTO habit_completions (habit_id, user_id, completed_at)
SELECT 
  habit_id,
  '4f9b2a76-bf75-4d74-89d8-80b5df2d8ad0'::uuid as user_id,
  date + time '10:00:00' as completed_at
FROM random_completions
WHERE should_insert = true;