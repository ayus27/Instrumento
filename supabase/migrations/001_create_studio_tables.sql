-- projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL DEFAULT 'Untitled',
  bpm integer DEFAULT 120,
  time_signature text DEFAULT '4/4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- tracks table
CREATE TABLE tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'instrument' | 'drums' | 'midi' | 'audio'
  instrument_id text,
  name text,
  volume real DEFAULT 0.8,
  pan real DEFAULT 0,
  mute boolean DEFAULT false,
  solo boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- clips table  
CREATE TABLE clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  start_beat real NOT NULL DEFAULT 0,
  duration_beats real NOT NULL DEFAULT 4,
  audio_storage_path text,
  created_at timestamptz DEFAULT now()
);

-- midi_events table
CREATE TABLE midi_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id uuid REFERENCES clips(id) ON DELETE CASCADE,
  beat real NOT NULL,
  note text NOT NULL,
  velocity real DEFAULT 0.8,
  duration_beats real DEFAULT 0.25,
  type text DEFAULT 'note' -- 'note' | 'cc'
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE midi_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own tracks" ON tracks FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users see own clips" ON clips FOR ALL USING (track_id IN (SELECT id FROM tracks WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())));
CREATE POLICY "Users see own midi events" ON midi_events FOR ALL USING (clip_id IN (SELECT id FROM clips WHERE track_id IN (SELECT id FROM tracks WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))));
