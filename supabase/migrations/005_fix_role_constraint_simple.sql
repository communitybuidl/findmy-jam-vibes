-- Remove the role constraint temporarily to allow our sample data
-- You can run this if you want to keep the constraint loose for testing
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Or, update the constraint to include the roles we're using:
-- (Uncomment the lines below if you want to keep a constraint)

/*
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'vocalist', 'guitarist', 'bassist', 'drummer', 'pianist', 'keyboardist',
  'songwriter', 'producer', 'multi-instrumentalist', 'dj', 'sound-engineer'
));
*/