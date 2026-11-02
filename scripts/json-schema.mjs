/**
 * json-schema.mjs
 *
 * The one place the validators compile a JSON Schema. Every published
 * schema in website/public/schema/ is a draft 2020-12 document, and the
 * generated files that declare one must pass it on every build; this helper
 * gives each validator the same strict compiler so a misspelled keyword or
 * an unknown format fails the build instead of silently matching nothing.
 *
 * Not a validator itself and not in any chain: validate-json-schemas.mjs
 * (the component schemas and the token values) and validate-token-values.mjs
 * import it.
 */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

/** A strict 2020-12 compiler with the standard formats registered. */
export function createAjv() {
  // strictRequired is off: an if/then rule names a `required` property its
  // parent object defines (the enum/values pairing), which strict mode
  // would otherwise read as an undefined property. Every other strict check
  // stays on.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  return ajv;
}

/**
 * Validates `data` against `schema` and returns the failures as messages in
 * the chain's one-error-per-line shape, prefixed with `label` so a failure
 * names the file. An empty array means the document is valid.
 */
export function schemaErrors(ajv, schema, data, label) {
  const validate = ajv.compile(schema);
  if (validate(data)) return [];
  return (validate.errors ?? []).map(
    (error) => `${label}${error.instancePath || '/'}: ${error.message ?? 'invalid'}` +
      (error.params && Object.keys(error.params).length > 0
        ? ` (${JSON.stringify(error.params)})`
        : '')
  );
}
