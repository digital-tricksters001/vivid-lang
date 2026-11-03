/**
 * Universal AI Model Interface for Vivid
 * Connects Vivid's SNA & Pulse Engine to ANY AI model:
 * OpenAI, Anthropic Claude, DeepSeek, Google Gemini, Ollama/Local LLMs.
 * Author: Suman Kumar Das
 */
import { VividProgram } from '../core/ast.js';
import { MARPReport } from '../core/marp.js';
export interface VibePromptRequest {
    userPrompt: string;
    existingProgram?: VividProgram;
    modelTarget?: 'openai' | 'anthropic' | 'deepseek' | 'ollama' | 'custom';
    apiKey?: string;
    baseUrl?: string;
}
export interface NodePatchRequest {
    targetNodeId: string;
    directive: string;
    program: VividProgram;
    marpReport?: MARPReport;
}
export interface SynthesisResponse {
    synthesizedCode: string;
    affectedNodes: string[];
    explanation: string;
    provider: string;
}
export interface AIProvider {
    name: string;
    synthesizeVibe(request: VibePromptRequest): Promise<SynthesisResponse>;
    repairWithMarp(request: NodePatchRequest): Promise<SynthesisResponse>;
}
//# sourceMappingURL=base.d.ts.map