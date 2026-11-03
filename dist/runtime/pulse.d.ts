/**
 * Pulse Reactive Execution Runtime
 * Provides ambient store persistence, atomic flow evaluation, and lens UI projection.
 * Author: Suman Kumar Das
 */
import { VividProgram, LensDeclaration } from '../core/ast.js';
export interface PulseRuntimeState {
    stores: Record<string, Record<string, any>>;
    events: {
        name: string;
        payload: any;
        timestamp: number;
    }[];
    activeLenses: Record<string, any>;
}
export declare class PulseRuntime {
    private program;
    private state;
    constructor(program: VividProgram);
    private initializeStores;
    getStore(name: string): Record<string, any> | undefined;
    emitEvent(name: string, payload: any): void;
    /**
     * Projects a LensDeclaration into a reactive HTML widget
     */
    projectLensToHTML(lens: LensDeclaration, contextData?: Record<string, any>): string;
}
//# sourceMappingURL=pulse.d.ts.map