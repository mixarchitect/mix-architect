-- Add document_type to quotes table (quote vs invoice)
-- Both share the same table, payment flow, and Stripe integration.

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'quote'
    CHECK (document_type IN ('quote', 'invoice'));

CREATE INDEX IF NOT EXISTS idx_quotes_document_type ON quotes(document_type);
