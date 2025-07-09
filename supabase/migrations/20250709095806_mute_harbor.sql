/*
  # Chat System Database Schema

  1. New Tables
    - `chats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `preview` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `chat_id` (uuid, references chats)
      - `role` (text, 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  preview text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chats table
CREATE POLICY "Users can view own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats"
  ON chats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats"
  ON chats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can view messages from own chats"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own chats"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in own chats"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from own chats"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();