/**
 * Machine-Actionable Repair Packet (MARP) Engine
 * Produces structured, LLM-optimized self-repair telemetry when invariants break.
 * Author: Suman Kumar Das
 */
import { GuardDeclaration } from './ast.js';
import type { InvariantViolation } from './invariants.js';
export interface MARPReport {
    version: '1.0';
    errorKind: 'InvariantViolation' | 'TypeMismatch' | 'StateBoundaryBreach';
    guardName: string;
    targetNodeId: string;
    failedExpression: string;
    minimalCounterexample: Record<string, any>;
    promptTemplate: string;
    suggestedPatchStrategy: string;
}
export declare class MARPEngine {
    static generateFromViolation(guard: GuardDeclaration, violation: InvariantViolation, state: Record<string, any>): MARPReport;
}
//# sourceMappingURL=marp.d.ts.map