CREATE TABLE IF NOT EXISTS module_metadata (
  module_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  director TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  completion INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  unlock_time TEXT
);

INSERT INTO module_metadata (module_id, name, director, description, thumbnail, completion, locked, unlock_time)
VALUES
  ('methodology', 'METHODOLOGY', 'Pau Llacer', 'Concepts of Football', '/football-tactics-whiteboard-strategy.jpg', 27, FALSE, NULL),
  ('modern-footy', 'MODERN FOOTY', 'Pau Llacer', 'World Class Modern Style', '/modern-football-barcelona-style-play.jpg', 53, FALSE, NULL),
  ('physical-prep', 'PHYSICAL PREP', 'Pau Llacer', 'Prevent Injuries & Prepare Body', '/soccer-player-fitness-training-gym.jpg', 92, FALSE, NULL),
  ('positions', 'POSITIONS', 'Pau Llacer', 'Master Your Position', '/soccer-field-positions-diagram.jpg', 17, FALSE, NULL),
  ('video-analysis', 'VIDEO ANALYSIS', 'Pau Llacer', 'Concepts of Football', '/football-video-analysis-screen-tactical.jpg', 72, FALSE, NULL),
  ('wims-select', 'WIMS SELECT', 'Pau Llacer', 'Exclusive Content', '/vip-exclusive-premium-soccer-content.jpg', 0, TRUE, 'Unlock at 7 Months')
ON CONFLICT (module_id) DO UPDATE
SET
  name = EXCLUDED.name,
  director = EXCLUDED.director,
  description = EXCLUDED.description,
  thumbnail = EXCLUDED.thumbnail,
  completion = EXCLUDED.completion,
  locked = EXCLUDED.locked,
  unlock_time = EXCLUDED.unlock_time;
