-- Expand default_currency constraint to include MXN, SEK, INR, NGN
-- These currencies are used by es-MX, sv-SE, hi-IN, en-NG locales
ALTER TABLE user_defaults DROP CONSTRAINT valid_default_currency;
ALTER TABLE user_defaults ADD CONSTRAINT valid_default_currency CHECK (
  default_currency IN ('USD', 'GBP', 'CAD', 'AUD', 'EUR', 'BRL', 'JPY', 'KRW', 'CNY', 'MXN', 'SEK', 'INR', 'NGN')
);
