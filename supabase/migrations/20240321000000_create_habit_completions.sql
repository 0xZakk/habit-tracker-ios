create table public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- Create an index for faster queries
create index habit_completions_habit_id_idx on public.habit_completions(habit_id);
create index habit_completions_user_id_idx on public.habit_completions(user_id);
create index habit_completions_completed_at_idx on public.habit_completions(completed_at);

-- Add RLS policies
alter table public.habit_completions enable row level security;

create policy "Users can view their own habit completions"
  on public.habit_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habit completions"
  on public.habit_completions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own habit completions"
  on public.habit_completions for delete
  using (auth.uid() = user_id); 