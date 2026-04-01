ALTER TABLE module_metadata
ADD COLUMN IF NOT EXISTS director_video_url TEXT;

UPDATE module_metadata
SET director_video_url = '/Pau_Llacer.mov'
WHERE director_video_url IS NULL;
