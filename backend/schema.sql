-- One destination key owns exactly one journey document.
CREATE TABLE IF NOT EXISTS destination_journeys (
  destination_id text PRIMARY KEY CHECK (destination_id ~ '^[a-z][a-z0-9-]{0,79}$'),
  journey jsonb NOT NULL CHECK (
    jsonb_typeof(journey) = 'object'
    AND journey ?& ARRAY['id', 'name', 'scenes', 'questions']
    AND jsonb_typeof(journey->'id') = 'string'
    AND journey->>'id' = destination_id
    AND jsonb_typeof(journey->'name') = 'string'
    AND jsonb_typeof(journey->'scenes') = 'array'
    AND jsonb_typeof(journey->'questions') = 'array'
  )
);
