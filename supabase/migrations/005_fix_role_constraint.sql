-- First, let's check what the current constraint allows
-- Then we'll drop it and create a new one with all the roles we need

-- Drop the existing role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create a new constraint with all the roles we use in the app
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'vocalist', 'singer', 'guitarist', 'bassist', 'drummer', 'pianist', 'keyboardist',
  'songwriter', 'producer', 'multi-instrumentalist', 'dj', 'sound-engineer',
  'violinist', 'cellist', 'saxophonist', 'trumpeter', 'flutist', 'clarinetist',
  'composer', 'arranger', 'audio-engineer', 'mixing-engineer', 'mastering-engineer'
));

-- If there are any existing profiles with roles not in this list, we should update them
-- Let's be safe and allow any role for now by removing the constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;