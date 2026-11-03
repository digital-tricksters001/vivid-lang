/**
 * Vivid Test Suite
 * Author: Suman Kumar Das
 */

import assert from 'node:assert';
import test from 'node:test';
import {
  VividLexer,
  VividParser,
  SNAEngine,
  InvariantVerifier,
  MARPEngine,
  UniversalAIAdapter
} from '../dist/index.js';

test('Lexer tokenizes Vivid keywords and semantic addresses', () => {
  const code = 'module TestApp; intent Goal { vibe: "Fast" } @node_a#1234';
  const lexer = new VividLexer(code);
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, 'KEYWORD');
  assert.strictEqual(tokens[0].value, 'module');
  assert.ok(tokens.some(t => t.type === 'SNA_REF' && t.value === '@node_a#1234'));
});

test('Parser constructs complete AST with SNA hashes', () => {
  const code = `
module Shop;
intent CartFlow { vibe: "Simple" }
guard LimitGuard { ensure total <= 5000; }
model Product { id: UUID, price: Int > 0 }
lens CartLens(p: Product) { surface { title: "Cart" } }
`;
  const lexer = new VividLexer(code);
  const parser = new VividParser(lexer.tokenize());
  const program = parser.parse();

  assert.strictEqual(program.moduleName, 'Shop');
  assert.strictEqual(program.nodes.length, 4);

  const snaMap = SNAEngine.indexProgram(program);
  assert.strictEqual(Object.keys(snaMap).length, 4);
});

test('InvariantVerifier validates constraints and produces MARP on failure', () => {
  const guard = {
    type: 'GuardDeclaration',
    name: 'OrderSafety',
    invariants: [
      { kind: 'ensure', expression: 'total > 0' },
      { kind: 'ensure', expression: 'discount <= 50' }
    ]
  };

  const validState = { total: 100, discount: 20 };
  const passRes = InvariantVerifier.verifyGuards(guard, validState);
  assert.strictEqual(passRes.valid, true);

  const brokenState = { total: -10, discount: 80 };
  const failRes = InvariantVerifier.verifyGuards(guard, brokenState);
  assert.strictEqual(failRes.valid, false);
  assert.ok(failRes.marp);
  assert.strictEqual(failRes.marp.errorKind, 'InvariantViolation');
});

test('SNAEngine performs surgical semantic patch without line diff drift', () => {
  const code = `
module Core;
intent V1 { vibe: "Alpha" }
guard Guard1 { ensure balance >= 0 }
`;
  const parser = new VividParser(new VividLexer(code).tokenize());
  const program = parser.parse();

  const patchNode = {
    type: 'GuardDeclaration',
    name: 'Guard1',
    invariants: [{ kind: 'ensure', expression: 'balance >= 100' }]
  };

  const res = SNAEngine.applySemanticPatch(program, 'Guard1', patchNode);
  assert.strictEqual(res.success, true);
  const updatedGuard = program.nodes.find(n => n.name === 'Guard1');
  assert.strictEqual(updatedGuard.invariants[0].expression, 'balance >= 100');
});

test('UniversalAIAdapter synthesizes Vivid code from natural language vibe', async () => {
  const adapter = new UniversalAIAdapter();
  const res = await adapter.synthesizeVibe({
    userPrompt: 'Add coupon discount code up to 20%'
  });

  assert.ok(res.synthesizedCode.includes('CouponSafety'));
  assert.ok(res.affectedNodes.length > 0);
});
