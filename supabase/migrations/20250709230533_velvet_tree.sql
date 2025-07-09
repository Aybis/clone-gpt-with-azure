/*
  # Add user subscription system

  1. New Tables
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan` (text, 'free' or 'plus')
      - `chat_limit` (integer, default 5 for free, unlimited for plus)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_subscriptions` table
    - Add policy for users to read/update their own subscription

  3. Functions
    - Function to check if user can create new chat
    - Trigger to create default subscription for new users
*/

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  chat_limit integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to check chat limit
CREATE OR REPLACE FUNCTION check_chat_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
  user_limit integer;
  current_count integer;
BEGIN
  -- Get user's subscription info
  SELECT plan, chat_limit INTO user_plan, user_limit
  FROM user_subscriptions
  WHERE user_id = auth.uid();
  
  -- If no subscription found, create default free subscription
  IF user_plan IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan, chat_limit)
    VALUES (auth.uid(), 'free', 5);
    user_plan := 'free';
    user_limit := 5;
  END IF;
  
  -- Plus users have unlimited chats
  IF user_plan = 'plus' THEN
    RETURN true;
  END IF;
  
  -- Count current chats for free users
  SELECT COUNT(*) INTO current_count
  FROM chats
  WHERE user_id = auth.uid();
  
  RETURN current_count < user_limit;
END;
$$;

-- Create function to get user subscription info
CREATE OR REPLACE FUNCTION get_user_subscription()
RETURNS TABLE(plan text, chat_limit integer, current_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.plan, 'free') as plan,
    COALESCE(us.chat_limit, 5) as chat_limit,
    COALESCE(chat_count.count, 0) as current_count
  FROM (
    SELECT auth.uid() as user_id
  ) u
  LEFT JOIN user_subscriptions us ON us.user_id = u.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM chats
    WHERE user_id = auth.uid()
    GROUP BY user_id
  ) chat_count ON chat_count.user_id = u.user_id;
END;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_user_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscription_updated_at();

-- Create trigger to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, chat_limit)
  VALUES (NEW.id, 'free', 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();