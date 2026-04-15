/**
 * Paths passed to pino's `redact` option. Any matching value in the log
 * record is replaced with the configured censor string before serialisation
 * reaches any destination (console, file, database). Paths support pino's
 * own glob-ish syntax: `*` matches a single path segment, bracket-notation
 * handles keys that contain `-` or quotes.
 *
 * Keep this list conservative but complete — every sensitive field that
 * could be logged at any depth of `req` / `res` / custom objects.
 */
export const DEFAULT_REDACT_PATHS = [
  // Request body — credentials
  'req.body.password',
  'req.body.oldPassword',
  'req.body.newPassword',
  'req.body.confirmPassword',
  'req.body.currentPassword',
  'req.body.pin',

  // Request body — auth tokens
  'req.body.token',
  'req.body.accessToken',
  'req.body.refreshToken',
  'req.body.idToken',
  'req.body.apiKey',
  'req.body.api_key',
  'req.body.secret',
  'req.body.clientSecret',
  'req.body.client_secret',

  // Request body — financial PII
  'req.body.creditCard',
  'req.body.cardNumber',
  'req.body.cvv',
  'req.body.cvc',

  // Request body — identity PII
  'req.body.ssn',
  'req.body.nationalId',

  // Headers
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-auth-token"]',
  'res.headers["set-cookie"]',

  // Wildcards catch the same fields under arbitrary nesting
  '*.password',
  '*.oldPassword',
  '*.newPassword',
  '*.confirmPassword',
  '*.currentPassword',
  '*.pin',
  '*.secret',
  '*.clientSecret',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.idToken',
  '*.apiKey',
  '*.api_key',
  '*.ssn',
  '*.nationalId',
  '*.creditCard',
  '*.cardNumber',
  '*.cvv',
  '*.cvc',
];

/** Placeholder that replaces redacted values in serialized output. */
export const REDACT_CENSOR = '[REDACTED]';
