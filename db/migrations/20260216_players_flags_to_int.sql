ALTER TABLE players
  ALTER COLUMN "continue" SET DEFAULT 0,
  ALTER COLUMN watching SET DEFAULT 0,
  ALTER COLUMN community SET DEFAULT 0,
  ALTER COLUMN your_posts SET DEFAULT 0,
  ALTER COLUMN favorites SET DEFAULT 0;

UPDATE players
SET
  "continue" = COALESCE("continue", 0),
  watching = COALESCE(watching, 0),
  community = COALESCE(community, 0),
  your_posts = COALESCE(your_posts, 0),
  favorites = COALESCE(favorites, 0);

ALTER TABLE players
  ALTER COLUMN "continue" SET NOT NULL,
  ALTER COLUMN watching SET NOT NULL,
  ALTER COLUMN community SET NOT NULL,
  ALTER COLUMN your_posts SET NOT NULL,
  ALTER COLUMN favorites SET NOT NULL;
