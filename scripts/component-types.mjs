/**
 * component-types.mjs
 *
 * Resolves every type a component's props reference, so the published
 * contract is closed: an agent reading `steps: AgentPlanStep[]` also gets
 * what an AgentPlanStep is, and what each type inside that refers to, all
 * the way down. Before this, the prop reference named types it never
 * defined, and an agent could not build a required prop without guessing.
 *
 * The walk uses the TypeScript checker, never a regex over the type text:
 * a prop's declared type node is walked for type references, each
 * reference is resolved through the checker (imports followed to their
 * declaration), and a declaration in this repo becomes an entry in the
 * component's `types` map, whose own declaration is walked in turn. A
 * declaration outside the repo (React's ReactNode, TypeScript's Record)
 * is not expanded: it is named in `externalTypes` with the package it
 * comes from, so every name a reader meets is accounted for one way or
 * the other. validate-component-api.mjs holds that closure.
 *
 * One kind of type is not expanded: a component's props interface (a name
 * ending in Props or OwnProps whose stem is a documented component). It
 * becomes a pointer, `{ kind: 'component-props', component, see }`, the
 * call that returns that component's props, so the map stays the types a
 * prop needs rather than every interface a composed child declares. The
 * caller decides which names are components (pointerFor).
 *
 * Two failures are the generator's own, so a gap never ships quietly:
 *   - a reference the checker cannot resolve at all
 *   - two different declarations with the same name in one component's
 *     closure (the map is keyed by name, so one would silently replace
 *     the other)
 *
 * Deterministic: definitions are source text with CRLF normalised, and
 * every map and list is sorted.
 */
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';

import { repoRoot } from './component-docgen.mjs';
import { onClearMemos } from './lib/memo.mjs';

const lf = (value) => value.replace(/\r\n/g, '\n');

let cached;
onClearMemos(() => {
  cached = undefined;
});

/** One program over tsconfig.app.json, the same config docgen reads. */
function program() {
  if (cached) return cached;
  const configPath = join(repoRoot, 'tsconfig.app.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath));
  const built = ts.createProgram(parsed.fileNames, parsed.options);
  cached = { program: built, checker: built.getTypeChecker() };
  return cached;
}

/** True for a declaration this repo owns (not node_modules, not a lib file). */
const isLocal = (sourceFile) => {
  const path = sourceFile.fileName.replaceAll('\\', '/');
  return path.startsWith(repoRoot.replaceAll('\\', '/') + '/src/') && !path.includes('/node_modules/');
};

/** The package an outside declaration ships in: `react` for @types/react, `typescript` for a lib file. */
function packageOf(sourceFile) {
  const path = sourceFile.fileName.replaceAll('\\', '/');
  const at = path.lastIndexOf('/node_modules/');
  if (at === -1) return 'typescript';
  const rest = path.slice(at + '/node_modules/'.length).split('/');
  const name = rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
  if (name === 'typescript') return 'typescript';
  return name.startsWith('@types/') ? name.slice('@types/'.length) : name;
}

const isTypeDeclaration = (node) =>
  ts.isInterfaceDeclaration(node) ||
  ts.isTypeAliasDeclaration(node) ||
  ts.isEnumDeclaration(node) ||
  ts.isClassDeclaration(node);

const kindOf = (node) =>
  ts.isInterfaceDeclaration(node) ? 'interface'
    : ts.isTypeAliasDeclaration(node) ? 'type'
      : ts.isEnumDeclaration(node) ? 'enum'
        : 'class';

/** The type-reference names a node mentions, as identifier nodes. */
function referenceNames(node) {
  const names = [];
  const walk = (current) => {
    if (ts.isTypeReferenceNode(current)) names.push(current.typeName);
    else if (ts.isExpressionWithTypeArguments(current)) names.push(current.expression);
    else if (ts.isTypeQueryNode(current)) {
      // `typeof X` names a value, not a type: its text stands as written.
      return;
    }
    ts.forEachChild(current, walk);
  };
  walk(node);
  return names;
}

/** A reference resolved to its declaration, or null for a type parameter. */
function resolve(checker, nameNode) {
  let symbol = checker.getSymbolAtLocation(nameNode);
  if (!symbol) return { unresolved: true };
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  if (symbol.flags & ts.SymbolFlags.TypeParameter) return null;
  const declaration = (symbol.declarations ?? []).find(isTypeDeclaration) ?? symbol.declarations?.[0];
  if (!declaration) return { unresolved: true };
  return { symbol, declaration };
}

/** A declaration's own JSDoc summary, or undefined. */
function descriptionOf(checker, symbol) {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  return text ? lf(text) : undefined;
}

/** The declaration's source text without its `export`/`declare` keywords. */
function definitionOf(declaration) {
  return lf(declaration.getText()).replace(/^(export\s+)?(default\s+)?(declare\s+)?/, '');
}

/**
 * The component's props as checker property symbols, keyed by prop name.
 * The component's first call signature's first parameter is the props
 * type, for a function component, a forwardRef or a memo alike.
 */
function propSymbols(checker, sourceFile, componentName) {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return new Map();
  let exported = checker.getExportsOfModule(moduleSymbol).find((s) => s.name === componentName);
  if (!exported) return new Map();
  if (exported.flags & ts.SymbolFlags.Alias) exported = checker.getAliasedSymbol(exported);
  const declaration = exported.valueDeclaration ?? exported.declarations?.[0];
  if (!declaration) return new Map();
  const type = checker.getTypeOfSymbolAtLocation(exported, declaration);
  const signature = type.getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return new Map();
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
  return new Map(propsType.getProperties().map((p) => [p.name, p]));
}

/**
 * The closed type map for one entry's documented exports.
 *
 * `exportsByFile` is [{ file, component, props: [{ name }] }]. Returns
 * { types, externalTypes, propRefs }, where propRefs maps
 * `${component}.${prop}` to the sorted local names that prop's type mentions.
 */
export function resolveComponentTypes(exportsList, pointerFor = () => null) {
  const { program: built, checker } = program();
  const types = new Map(); // name -> { declaration, entry }
  const externalTypes = new Map();
  const propRefs = new Map();
  const queue = [];

  const visitRefs = (node, where, seen = new Set()) => {
    const local = new Set();
    // `ButtonGroupProps['buttons']` names a props interface that becomes a
    // pointer, but the prop's real type is that one member's: walk the
    // member's declared type too, so what it names is defined here.
    const walkIndexed = (current) => {
      if (ts.isIndexedAccessTypeNode(current) && ts.isLiteralTypeNode(current.indexType)) {
        const key = current.indexType.literal.text;
        const property = checker.getTypeFromTypeNode(current.objectType).getProperty(key);
        for (const declaration of property?.declarations ?? []) {
          if (seen.has(declaration) || !('type' in declaration) || !declaration.type) continue;
          seen.add(declaration);
          for (const ref of visitRefs(declaration.type, where, seen)) local.add(ref);
        }
      }
      ts.forEachChild(current, walkIndexed);
    };
    walkIndexed(node);
    for (const nameNode of referenceNames(node)) {
      const resolved = resolve(checker, nameNode);
      if (resolved === null) continue;
      const shown = nameNode.getText();
      if (resolved.unresolved) {
        throw new Error(
          `component-types: ${where} references ${shown}, which the checker cannot resolve. ` +
            `Export or import the type so the published contract can define it.`
        );
      }
      const { symbol, declaration } = resolved;
      const sourceFile = declaration.getSourceFile();
      if (!isLocal(sourceFile)) {
        // `React.ReactNode` is named by its last segment, the way a reader meets it.
        externalTypes.set(shown.split('.').pop(), packageOf(sourceFile));
        continue;
      }
      if (!isTypeDeclaration(declaration)) continue;
      const name = symbol.name;
      const existing = types.get(name);
      if (existing && existing.declaration !== declaration) {
        throw new Error(
          `component-types: two different types named ${name} meet in one contract ` +
            `(${relative(repoRoot, existing.declaration.getSourceFile().fileName)} and ` +
            `${relative(repoRoot, sourceFile.fileName)}). Rename one so the published types map can hold both.`
        );
      }
      local.add(name);
      if (!existing) {
        types.set(name, { declaration, symbol });
        queue.push(name);
      }
    }
    return [...local].sort();
  };

  for (const { file, component, props } of exportsList) {
    const sourceFile = built.getSourceFile(file);
    if (!sourceFile) throw new Error(`component-types: ${file} is not in tsconfig.app.json's program.`);
    const symbols = propSymbols(checker, sourceFile, component);
    for (const prop of props) {
      // A prop of a discriminated union of props types is declared once per
      // member (Timeline's `items` is TimelineItem[] in one layout and
      // TimelineCompany[] in the other), so every declaration is walked.
      const declarations = symbols.get(prop.name)?.declarations ?? [];
      const refs = new Set();
      for (const declaration of declarations) {
        const typeNode = 'type' in declaration ? declaration.type : undefined;
        if (!typeNode) continue;
        for (const ref of visitRefs(typeNode, `${component}.${prop.name}`)) refs.add(ref);
      }
      if (refs.size > 0) propRefs.set(`${component}.${prop.name}`, [...refs].sort());
    }
  }

  const resolved = new Map();
  while (queue.length > 0) {
    const name = queue.shift();
    const { declaration, symbol } = types.get(name);
    // Another component's whole props interface is a pointer, never its
    // definition: ChatWidget names a dozen of them (AiButtonOwnProps,
    // ComposerOwnProps …), and their definitions made one response 166KB.
    // The pointer names the component and the call that returns its props.
    const pointer = pointerFor(name);
    if (pointer) {
      resolved.set(name, { kind: 'component-props', ...pointer });
      continue;
    }
    const refs = visitRefs(declaration, name).filter((ref) => ref !== name);
    const entry = { kind: kindOf(declaration), definition: definitionOf(declaration) };
    const description = descriptionOf(checker, symbol);
    if (description) entry.description = description;
    if (refs.length > 0) entry.refs = refs;
    resolved.set(name, entry);
  }

  const sorted = (map) =>
    Object.fromEntries([...map].sort(([a], [b]) => a.localeCompare(b, 'en')));
  return { types: sorted(resolved), externalTypes: sorted(externalTypes), propRefs };
}

/**
 * The prop's declared type as written, when the declaration is a union the
 * checker collapsed. `tabs?: boolean | ReactNode` reaches docgen as
 * `ReactNode`, because ReactNode already includes boolean, and the contract
 * then hides that `true` is a supported value. Returns the source text when
 * the annotation is a union and docgen's string has lost its bars, or null.
 * `string | ReactNode` is kept as written too: the string member is how an
 * icon prop says it takes a Material Symbol name.
 */
export function declaredUnionText(file, component, propName) {
  const { program: built, checker } = program();
  const sourceFile = built.getSourceFile(file);
  if (!sourceFile) return null;
  const symbol = propSymbols(checker, sourceFile, component).get(propName);
  const declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  const typeNode = declaration && 'type' in declaration ? declaration.type : undefined;
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  // `React.ReactNode` is printed the way docgen prints it everywhere else.
  return lf(typeNode.getText()).replace(/\s+/g, ' ').replace(/\bReact\./g, '');
}

/**
 * The props whose code default is a string literal, as a map from prop name
 * to the string. Docgen reports such a default without its quotes
 * (`closeLabel = 'Close chat'` comes back as `Close chat`) but reports a
 * JSDoc `@default 'Button'` with them, and an identifier default such as
 * `DEFAULT_LOCALE` bare, so its text alone cannot say which is a string.
 * The destructuring in the component's own declaration can: a string
 * literal, or a constant whose type is one string.
 */
export function stringLiteralDefaults(file, component) {
  const { program: built, checker } = program();
  const found = new Map();
  const sourceFile = built.getSourceFile(file);
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return found;
  let exported = checker.getExportsOfModule(moduleSymbol).find((s) => s.name === component);
  if (!exported) return found;
  if (exported.flags & ts.SymbolFlags.Alias) exported = checker.getAliasedSymbol(exported);
  const declaration = exported.valueDeclaration ?? exported.declarations?.[0];
  if (!declaration) return found;
  // The first destructured parameter under the declaration: the props of a
  // function component, or of the function a forwardRef or memo wraps.
  let pattern;
  const walk = (node) => {
    if (pattern) return;
    if (ts.isParameter(node) && ts.isObjectBindingPattern(node.name)) {
      pattern = node.name;
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(declaration);
  for (const element of pattern?.elements ?? []) {
    const key = element.propertyName ?? element.name;
    if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) continue;
    const init = element.initializer;
    if (!init) continue;
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
      found.set(key.text, init.text);
      continue;
    }
    // A constant (`panelId = CHAT_PANEL_ID`, `locale = DEFAULT_LOCALE`),
    // which docgen reports as the string it holds, unquoted.
    const type = checker.getTypeAtLocation(init);
    if (type.isStringLiteral()) found.set(key.text, type.value);
  }
  return found;
}
