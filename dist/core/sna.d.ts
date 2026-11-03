/**
 * Semantic Node Addressing (SNA) Engine
 * Eliminates line-based diff fragility by addressing and patching AST nodes directly.
 * Author: Suman Kumar Das
 */
import { VividProgram, VividDeclaration, SNAMap } from './ast.js';
export declare class SNAEngine {
    /**
     * Computes a deterministic SHA-256 hash for a normalized semantic string
     */
    static hashContent(content: string): string;
    /**
     * Indexes a Vivid Program into a Semantic Node Address (SNA) Map
     */
    static indexProgram(program: VividProgram): SNAMap;
    /**
     * Applies an atomic semantic patch directly to a targeted node
     */
    static applySemanticPatch(program: VividProgram, targetIdentifier: string, replacementNode: VividDeclaration): {
        success: boolean;
        modifiedNode?: VividDeclaration;
        error?: string;
    };
    private static getNodePrefix;
    private static serializeCanonical;
    private static extractDependencies;
}
//# sourceMappingURL=sna.d.ts.map