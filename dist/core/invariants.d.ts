/**
 * Invariants & Property Verification Engine
 * Validates formal constraints (ensure, never, require) against execution state.
 * Author: Suman Kumar Das
 */
import { GuardDeclaration, InvariantRule } from './ast.js';
import { MARPReport } from './marp.js';
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
export declare class InvariantVerifier {
    /**
     * Verifies a set of guard declarations against a runtime state
     */
    static verifyGuards(guard: GuardDeclaration, state: Record<string, any>): VerificationResult;
    private static evaluateRule;
}
//# sourceMappingURL=invariants.d.ts.map