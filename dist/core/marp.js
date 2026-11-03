/**
 * Machine-Actionable Repair Packet (MARP) Engine
 * Produces structured, LLM-optimized self-repair telemetry when invariants break.
 * Author: Suman Kumar Das
 */
export class MARPEngine {
    static generateFromViolation(guard, violation, state) {
        const failedExpr = `${violation.rule.kind} ${violation.rule.expression}`;
        const targetNodeId = guard.id || `@guard_${guard.name}#${guard.hash || 'auto'}`;
        // Extract minimal counterexample
        const counterexample = {};
        for (const key of Object.keys(state)) {
            if (violation.rule.expression.includes(key)) {
                counterexample[key] = state[key];
            }
        }
        const suggestedFix = `Enforce boundary check on [${Object.keys(counterexample).join(', ')}] before executing target flow.`;
        const promptTemplate = [
            `### Vivid MARP Self-Healing Directive`,
            `Target Node: ${targetNodeId}`,
            `Invariant Failed: ${failedExpr}`,
            `Failing State: ${JSON.stringify(counterexample, null, 2)}`,
            `Required Action: Synthesize a patch for ${targetNodeId} that satisfies this invariant while preserving original business logic.`
        ].join('\n');
        return {
            version: '1.0',
            errorKind: 'InvariantViolation',
            guardName: guard.name,
            targetNodeId,
            failedExpression: failedExpr,
            minimalCounterexample: counterexample,
            promptTemplate,
            suggestedPatchStrategy: suggestedFix
        };
    }
}
//# sourceMappingURL=marp.js.map