-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create optimized RLS policies using (select auth.uid()) for better performance
-- This prevents auth.uid() from being re-evaluated for each row

-- Policy for SELECT: Allow users to view all profiles (keeping current behavior)
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT 
USING (true);

-- Policy for INSERT: Allow users to insert only their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated 
WITH CHECK ((select auth.uid()) = user_id);

-- Policy for UPDATE: Allow users to update only their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Optional: Add DELETE policy for completeness (users can delete their own profile)
CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);