/**
 * Vivid Language Abstract Syntax Tree (AST) Definition
 * Part of the Vivid Language Specification
 * Author: Suman Kumar Das
 */
export type SourceLocation = {
    line: number;
    column: number;
    offset: number;
};
export interface BaseNode {
    type: string;
    id?: string;
    hash?: string;
    loc?: SourceLocation;
}
export interface VividProgram extends BaseNode {
    type: 'Program';
    moduleName: string;
    nodes: VividDeclaration[];
}
export type VividDeclaration = IntentDeclaration | GuardDeclaration | ModelDeclaration | LensDeclaration | RealizeDeclaration | StoreDeclaration | FlowDeclaration;
export interface IntentDeclaration extends BaseNode {
    type: 'IntentDeclaration';
    name: string;
    vibe?: string;
    actors?: string[];
    sla?: string;
    constraints?: string[];
    rawPrompt?: string;
}
export interface InvariantRule {
    kind: 'ensure' | 'never' | 'require' | 'sla';
    expression: string;
    description?: string;
}
export interface GuardDeclaration extends BaseNode {
    type: 'GuardDeclaration';
    name: string;
    target?: string;
    invariants: InvariantRule[];
}
export interface ModelField {
    name: string;
    fieldType: string;
    constraint?: string;
    optional?: boolean;
}
export interface ModelDeclaration extends BaseNode {
    type: 'ModelDeclaration';
    name: string;
    fields: ModelField[];
}
export interface LensElement {
    key: string;
    value: string;
    isAction?: boolean;
}
export interface LensDeclaration extends BaseNode {
    type: 'LensDeclaration';
    name: string;
    params: {
        name: string;
        type: string;
    }[];
    elements: LensElement[];
    theme?: string;
}
export interface RealizeDeclaration extends BaseNode {
    type: 'RealizeDeclaration';
    targetNodeId: string;
    body: string;
    flows: FlowDeclaration[];
}
export interface StoreDeclaration extends BaseNode {
    type: 'StoreDeclaration';
    name: string;
    persistedFields: ModelField[];
    ephemeralFields: ModelField[];
    syncOptions: string[];
}
export interface FlowDeclaration extends BaseNode {
    type: 'FlowDeclaration';
    name: string;
    params: {
        name: string;
        type: string;
    }[];
    returnType: string;
    body: string;
    isAtomic?: boolean;
}
export interface SNAMap {
    [nodeId: string]: {
        hash: string;
        type: string;
        name: string;
        node: VividDeclaration;
        dependencies: string[];
    };
}
//# sourceMappingURL=ast.d.ts.map