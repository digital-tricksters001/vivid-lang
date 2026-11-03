/**
 * Universal AI Provider Dispatcher
 * Allows Vivid to bind dynamically to any cloud or local LLM.
 * Author: Suman Kumar Das
 */
import { AIProvider, VibePromptRequest, NodePatchRequest, SynthesisResponse } from './base.js';
export declare class UniversalAIAdapter implements AIProvider {
    name: string;
    synthesizeVibe(request: VibePromptRequest): Promise<SynthesisResponse>;
    repairWithMarp(request: NodePatchRequest): Promise<SynthesisResponse>;
    private callOpenAI;
    private callAnthropic;
    private callDeepSeek;
    private callOllama;
    private synthesizeOffline;
    private extractVividCode;
}
//# sourceMappingURL=universal.d.ts.map