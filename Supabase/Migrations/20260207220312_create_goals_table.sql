/*
  # Create goals table for Convogoal app

  1. New Tables
    - `goals`
      - `id` (uuid, primary key) - Unique identifier for each goal
      - `user_id` (uuid) - User identifier for multi-user support
      - `title` (text) - Goal title/description
      - `completed` (boolean) - Completion status
      - `created_at` (timestamptz) - When goal was created
      - `completed_at` (timestamptz, nullable) - When goal was completed
  
  2. Security
    - Enable RLS on `goals` table
    - Add policies for authenticated users to manage their own goals
    
  3. Notes
    - Uses UUIDs for scalability
    - Includes timestamp tracking for analytics
    - Boolean flag for simple completion tracking
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_created_at_idx ON goals(created_at DESC);