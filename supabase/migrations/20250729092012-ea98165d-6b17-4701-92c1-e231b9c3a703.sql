-- Grant admin privileges to the test user
INSERT INTO user_roles (user_id, role) 
VALUES ('cc81953c-95bf-4060-94dd-68d3948b71c6', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;