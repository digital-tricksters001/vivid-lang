/**
 * Semantic Node Addressing (SNA) Engine
 * Eliminates line-based diff fragility by addressing and patching AST nodes directly.
 * Author: Suman Kumar Das
 */
import { createHash } from 'node:crypto';
export class SNAEngine {
    /**
     * Computes a deterministic SHA-256 hash for a normalized semantic string
     */
    static hashContent(content) {
        const normalized = content.replace(/\s+/g, ' ').trim();
        return createHash('sha256').update(normalized).digest('hex').substring(0, 8);
    }
    /**
     * Indexes a Vivid Program into a Semantic Node Address (SNA) Map
     */
    static indexProgram(program) {
        const map = {};
        for (const node of program.nodes) {
            const canonicalContent = this.serializeCanonical(node);
            const hash = this.hashContent(canonicalContent);
            const shortId = `@${this.getNodePrefix(node)}_${node.name || 'anon'}#${hash}`;
            node.id = shortId;
            node.hash = hash;
            const deps = this.extractDependencies(node);
            map[shortId] = {
                hash,
                type: node.type,
                name: node.name || node.targetNodeId || 'unknown',
                node,
                dependencies: deps
            };
        }
        return map;
    }
    /**
     * Applies an atomic semantic patch directly to a targeted node
     */
    static applySemanticPatch(program, targetIdentifier, replacementNode) {
        const index = program.nodes.findIndex(n => {
            // Matches either full ID (@cart_safety#9b3a) or base name (cart_safety)
            if (n.id === targetIdentifier)
                return true;
            if (n.id && n.id.startsWith(targetIdentifier))
                return true;
            if (n.name === targetIdentifier)
                return true;
            return false;
        });
        if (index === -1) {
            return {
                success: false,
                error: `Semantic node not found: ${targetIdentifier}`
            };
        }
        // Replace the node cleanly
        program.nodes[index] = replacementNode;
        this.indexProgram(program); // Re-index graph
        return {
            success: true,
            modifiedNode: replacementNode
        };
    }
    static getNodePrefix(node) {
        switch (node.type) {
            case 'IntentDeclaration': return 'intent';
            case 'GuardDeclaration': return 'guard';
            case 'ModelDeclaration': return 'model';
            case 'LensDeclaration': return 'lens';
            case 'RealizeDeclaration': return 'realize';
            case 'StoreDeclaration': return 'store';
            case 'FlowDeclaration': return 'flow';
            default: return 'node';
        }
    }
    static serializeCanonical(node) {
        // Strips non-semantic volatile data to guarantee consistent hashing
        const clone = JSON.parse(JSON.stringify(node));
        delete clone.loc;
        delete clone.id;
        delete clone.hash;
        return JSON.stringify(clone);
    }
    static extractDependencies(node) {
        const deps = new Set();
        const str = JSON.stringify(node);
        // Look for references like @node_id or type names
        const matches = str.match(/@[a-zA-Z0-9_#]+/g);
        if (matches) {
            matches.forEach(m => deps.add(m));
        }
        return Array.from(deps);
    }
}
//# sourceMappingURL=sna.js.map