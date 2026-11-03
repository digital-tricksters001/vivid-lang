/**
 * Universal AI Provider Dispatcher
 * Allows Vivid to bind dynamically to any cloud or local LLM.
 * Author: Suman Kumar Das
 */

import { AIProvider, VibePromptRequest, NodePatchRequest, SynthesisResponse } from './base.js';

export class UniversalAIAdapter implements AIProvider {
  public name = 'UniversalAIAdapter';

  public async synthesizeVibe(request: VibePromptRequest): Promise<SynthesisResponse> {
    const provider = request.modelTarget || 'openai';

    // Formulate the Vivid System Prompt for the LLM
    const systemPrompt = `You are the Vivid Language Compiler & Synthesis Engine.
Vivid is a dual-layer programming language designed for vibe coding:
- intent: specifies high-level vibes, actors, constraints
- guard: specifies formal invariants (ensure, never, require, sla)
- model: defines data schemas with range constraints
- lens: declares reactive UI surfaces with actions
- realize: implements flows targeted at semantic node IDs
- store: handles persistent and ephemeral ambient state

Output clean, valid .vv syntax. Wrap in code fences: \`\`\`vivid ... \`\`\``;

    // Try standard fetch to the configured provider endpoint
    if (provider === 'ollama') {
      return this.callOllama(request, systemPrompt);
    } else if (provider === 'anthropic' && request.apiKey) {
      return this.callAnthropic(request, systemPrompt);
    } else if (provider === 'deepseek' && request.apiKey) {
      return this.callDeepSeek(request, systemPrompt);
    } else if (request.apiKey) {
      return this.callOpenAI(request, systemPrompt);
    }

    // Default: Deterministic Offline Synthesizer for instant demonstration without API keys
    return this.synthesizeOffline(request.userPrompt);
  }

  public async repairWithMarp(request: NodePatchRequest): Promise<SynthesisResponse> {
    const marp = request.marpReport;
    const prompt = marp ? marp.promptTemplate : `Repair node ${request.targetNodeId} with directive: ${request.directive}`;
    return this.synthesizeVibe({
      userPrompt: prompt,
      existingProgram: request.program
    });
  }

  private async callOpenAI(req: VibePromptRequest, systemPrompt: string): Promise<SynthesisResponse> {
    const endpoint = req.baseUrl || 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: req.userPrompt }
        ],
        temperature: 0.2
      })
    });
    const data = await res.json() as any;
    const code = data.choices?.[0]?.message?.content || '';
    return {
      synthesizedCode: this.extractVividCode(code),
      affectedNodes: ['@synthesized_flow'],
      explanation: 'Synthesized via OpenAI GPT-4o',
      provider: 'OpenAI'
    };
  }

  private async callAnthropic(req: VibePromptRequest, systemPrompt: string): Promise<SynthesisResponse> {
    const endpoint = req.baseUrl || 'https://api.anthropic.com/v1/messages';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt,
        messages: [{ role: 'user', content: req.userPrompt }],
        max_tokens: 2000
      })
    });
    const data = await res.json() as any;
    const code = data.content?.[0]?.text || '';
    return {
      synthesizedCode: this.extractVividCode(code),
      affectedNodes: ['@synthesized_flow'],
      explanation: 'Synthesized via Anthropic Claude 3.5 Sonnet',
      provider: 'Anthropic'
    };
  }

  private async callDeepSeek(req: VibePromptRequest, systemPrompt: string): Promise<SynthesisResponse> {
    const endpoint = req.baseUrl || 'https://api.deepseek.com/chat/completions';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: req.userPrompt }
        ]
      })
    });
    const data = await res.json() as any;
    const code = data.choices?.[0]?.message?.content || '';
    return {
      synthesizedCode: this.extractVividCode(code),
      affectedNodes: ['@synthesized_flow'],
      explanation: 'Synthesized via DeepSeek-V3',
      provider: 'DeepSeek'
    };
  }

  private async callOllama(req: VibePromptRequest, systemPrompt: string): Promise<SynthesisResponse> {
    const endpoint = (req.baseUrl || 'http://localhost:11434') + '/api/generate';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:latest',
        prompt: `${systemPrompt}\n\nUser: ${req.userPrompt}`,
        stream: false
      })
    });
    const data = await res.json() as any;
    return {
      synthesizedCode: this.extractVividCode(data.response || ''),
      affectedNodes: ['@synthesized_flow'],
      explanation: 'Synthesized locally via Ollama',
      provider: 'Ollama'
    };
  }

  private synthesizeOffline(prompt: string): SynthesisResponse {
    const sanitized = prompt.toLowerCase();
    
    if (sanitized.includes('discount') || sanitized.includes('coupon')) {
      const code = `
guard CouponSafety {
    ensure discount_rate <= 0.20
    ensure discount_cents >= 0
    never allow_double_discounts()
}

flow apply_coupon(cart: CartItem[], code: Text) -> Result<Discount, Error> {
    atomic {
        let disc = calculate_promo(code, cart.total)
        guard CouponSafety(disc)
        return ok(disc)
    }
}`;
      return {
        synthesizedCode: code.trim(),
        affectedNodes: ['@guard_CouponSafety', '@flow_apply_coupon'],
        explanation: 'Synthesized Coupon Invariant & Flow (Offline Engine)',
        provider: 'Vivid Built-in Synthesizer'
      };
    }

    // Default synthesis sample
    const genericCode = `
intent FeatureGoal {
    vibe: "${prompt.replace(/"/g, "'")}"
    sla: 500ms
}

guard InvariantProtection {
    ensure valid_session(User)
    never allow_unauthorized_state_transition()
}

realize @feature_flow {
    flow execute() -> Result<Void, Error> {
        atomic {
            emit ActionTriggered()
            return ok()
        }
    }
}`;

    return {
      synthesizedCode: genericCode.trim(),
      affectedNodes: ['@intent_FeatureGoal', '@guard_InvariantProtection'],
      explanation: 'Synthesized Vivid AST Nodes from natural language prompt',
      provider: 'Vivid Built-in Synthesizer'
    };
  }

  private extractVividCode(raw: string): string {
    const match = raw.match(/```(?:vivid|\.vv)?\s*([\s\S]*?)```/);
    if (match) return match[1].trim();
    return raw.trim();
  }
}
