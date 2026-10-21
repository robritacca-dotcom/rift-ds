/**
 * docgen-scoped-defaults.mjs
 *
 * A patch to react-docgen-typescript, applied on import, shared by every
 * surface that parses the component props: scripts/component-docgen.mjs (the
 * generated API, the prop-docs and prop-vocabulary validators) and
 * .storybook/main.ts (the props tables). Both load the one deduped copy of the
 * parser, so patching its prototype here reaches both, and the surfaces keep
 * seeing the same parse.
 *
 * Why: the parser (2.4.0) collects code defaults from the destructuring of
 * *every* function statement in a file, not only the component's own, merging
 * them in file order. In a file with two components the later one's defaults
 * land on the earlier one's props of the same name, and a prop with a default
 * is reported as not required, so the contract published the wrong default
 * and the wrong required flag (NotificationItem's required `title` came out
 * optional with NotificationCenter's "Notifications"; RadioGroup's `value`
 * took RadioButton's empty string).
 *
 * The patch restricts the default-prop search to the statement that declares
 * the component (plus any `<Component>.defaultProps = …` assignment to it).
 * When the declaring statement cannot be found in the file the parser's own
 * behaviour stands. Applying it twice is a no-op.
 */
import { Parser } from 'react-docgen-typescript';
import ts from 'typescript';

export function scopeDefaultsToOwnStatement() {
  const original = Parser.prototype.extractDefaultPropsFromComponent;
  if (original.scoped) return;
  const scoped = function (symbol, source) {
    let own = symbol?.valueDeclaration;
    if (own && ts.isVariableDeclaration(own)) own = own.parent?.parent;
    if (!own || !source.statements.includes(own)) {
      return original.call(this, symbol, source);
    }
    const assignsDefaultProps = (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isBinaryExpression(statement.expression) &&
      ts.isPropertyAccessExpression(statement.expression.left) &&
      statement.expression.left.name.text === 'defaultProps' &&
      this.checker.getSymbolAtLocation(statement.expression.left.expression) === symbol;
    const statements = [own, ...source.statements.filter(assignsDefaultProps)];
    const narrowed = Object.create(source, { statements: { value: statements } });
    return original.call(this, symbol, narrowed);
  };
  scoped.scoped = true;
  Parser.prototype.extractDefaultPropsFromComponent = scoped;
}

scopeDefaultsToOwnStatement();
