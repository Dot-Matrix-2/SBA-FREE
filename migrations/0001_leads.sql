CREATE TABLE leads (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  business_name TEXT NOT NULL,
  state         TEXT NOT NULL,
  quiz_json     TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_text  TEXT NOT NULL,
  consent_at    TEXT NOT NULL
);

CREATE TABLE deliveries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id       TEXT NOT NULL REFERENCES leads(id),
  lender        TEXT NOT NULL,
  status        TEXT NOT NULL, -- delivered | failed | skipped
  http_status   INTEGER,
  error         TEXT,
  attempted_at  TEXT NOT NULL
);

CREATE INDEX idx_deliveries_lead ON deliveries(lead_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
