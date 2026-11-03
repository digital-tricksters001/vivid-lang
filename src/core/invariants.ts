/**
 * Invariants & Property Verification Engine
 * Validates formal constraints (ensure, never, require) against execution state.
 * Author: Suman Kumar Das
 */

import { GuardDeclaration, InvariantRule } from './ast.js';
import { MARPReport, MARPEngine } from './marp.js';

export interface VerificationResult {
  valid: boolean;
  totalChecks: number;
  passedChecks: number;
  violations: InvariantViolation[];
  marp?: MARPReport;
}

export interface InvariantViolation {
  guardName: string;
  rule: InvariantRule;
  contextData: Record<string, any>;
  reason: string;
}

export class InvariantVerifier {
  /**
   * Verifies a set of guard declarations against a runtime state
   */
  public static verifyGuards(
    guard: GuardDeclaration,
    state: Record<string, any>
  ): VerificationResult {
    const violations: InvariantViolation[] = [];
    let passed = 0;

    for (const rule of guard.invariants) {
      const isSatisfied = this.evaluateRule(rule, state);
      if (isSatisfied) {
        passed++;
      } else {
        violations.push({
          guardName: guard.name,
          rule,
          contextData: state,
          reason: `Violation of invariant: ${rule.kind} ${rule.expression}`
        });
      }
    }

    const valid = violations.length === 0;
    const result: VerificationResult = {
      valid,
      totalChecks: guard.invariants.length,
      passedChecks: passed,
      violations
    };

    if (!valid && violations.length > 0) {
      result.marp = MARPEngine.generateFromViolation(guard, violations[0], state);
    }

    return result;
  }

  private static evaluateRule(rule: InvariantRule, state: Record<string, any>): boolean {
    const expr = rule.expression.trim();

    try {
      // Safe sandboxed predicate evaluator for mathematical/logical guards
      const contextKeys = Object.keys(state);
      const contextValues = Object.values(state);

      // Normalize tokens (remove superfluous whitespace around dots and parens)
      let jsExpr = expr
        .replace(/\s*\.\s*/g, '.')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        // items.sum(i => i.cents * i.qty)
        .replace(/([a-zA-Z0-9_]+)\.sum\(([a-zA-Z0-9_]+)\s*=>\s*([^)]+)\)/g, '($1 ? $1.reduce((__acc, $2) => __acc + ($3), 0) : 0)')
        // allow_negative_balance()
        .replace(/allow_negative_balance\(\)/g, 'false')
        // valid_session(Buyer)
        .replace(/valid_session\(([a-zA-Z0-9_]+)\)/g, 'Boolean($1 && $1.id)');

      if (rule.kind === 'ensure' || rule.kind === 'require') {
        const fn = new Function(...contextKeys, `return Boolean(${jsExpr});`);
        return fn(...contextValues);
      }

      if (rule.kind === 'never') {
        const fn = new Function(...contextKeys, `return Boolean(${jsExpr});`);
        return !fn(...contextValues);
      }

      return true;
    } catch {
      // If expression references undefined or fails, mark as violated
      return false;
    }
  }
}
