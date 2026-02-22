ALTER TABLE players
  ALTER COLUMN highlights TYPE INTEGER
  USING CASE
    WHEN highlights IS NULL THEN 0
    WHEN highlights::text ~ '^[0-9]+$' THEN highlights::integer
    ELSE 0
  END;

ALTER TABLE players
  ALTER COLUMN highlights SET DEFAULT 0;

UPDATE players
SET highlights = COALESCE(highlights, 0);

ALTER TABLE players
  ALTER COLUMN highlights SET NOT NULL;
