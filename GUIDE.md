# The Complete Vivid (`.vv`) Developer Guide & Manual

**Author:** Suman Kumar Das  
**License:** Free for Non-Commercial Use • Commercial Licenses Sold Exclusively by Suman Kumar Das  
**Inquiries:** [fysuman20@gmail.com](mailto:fysuman20@gmail.com)  

---

## 1. Quickstart & Installation

### Requirements
- **Node.js** >= 18.0.0 (Node 20 or Node 22 recommended)
- **Git**

```bash
# 1. Clone the official repository
git clone https://github.com/digital-tricksters001/vivid-lang.git
cd vivid-lang

# 2. Install dependencies & build compiler
npm install
npm run build

# 3. Verify installation with an example
node bin/vivid.js run examples/01_saas_checkout.vv
```

---

## 2. Writing Your First Vivid Program

Create a new file named `app.vv`:

```vivid
module QuickStore;

// 1. Declare the High-Level Human Intent
intent OrderingFlow {
    vibe: "Instant, transparent, error-resistant"
    actors: [Customer, Merchant]
    sla: 500ms
}

// 2. Define Data Schemas & Value Constraints
model OrderItem {
    id: UUID
    title: Text
    price_cents: Int > 0
    quantity: Int >= 1
}

// 3. Define Safety Invariants (Guards)
guard OrderIntegrity {
    ensure total_cents == items.sum(i => i.price_cents * i.quantity)
    ensure total_cents > 0
    never allow_negative_balance()
}

// 4. Project Reactive UI & API Surface
lens OrderSummary(items: OrderItem[]) {
    theme: "cyber-emerald"
    surface {
        header: "Order Confirmation"
        items_total: "{items.length} items"
        confirm_btn: action("Submit Order")
    }
}

// 5. Machine Realization (SNA Content-Hashed Logic)
realize @order_processor {
    flow place_order(items: OrderItem[]) -> Result<UUID, Error> {
        atomic {
            guard OrderIntegrity(items)
            let order_id = db.orders.create(items)
            emit OrderPlaced(order_id)
            return ok(order_id)
        }
    }
}
```

### Running and Verifying
```bash
# Parse, index SNA hashes, and execute Pulse runtime
node bin/vivid.js run app.vv

# Statically verify invariant rules across all guards
node bin/vivid.js verify app.vv
```

---

## 3. Connecting to AI Models

Vivid features a **Universal AI Adapter** layer that binds seamlessly to any LLM:

### A. OpenAI (GPT-4o, o1, o3)
Set your API key in environment:
```bash
export OPENAI_API_KEY="sk-..."
```
Synthesize new AST blocks programmatically:
```javascript
import { UniversalAIAdapter } from 'vivid-lang';

const adapter = new UniversalAIAdapter();
const res = await adapter.synthesizeVibe({
  userPrompt: "Add a 15% VIP discount code for users who spent > $1000",
  modelTarget: "openai",
  apiKey: process.env.OPENAI_API_KEY
});

console.log(res.synthesizedCode);
```

### B. Anthropic Claude (Claude 3.5 Sonnet / 3.7)
```javascript
const res = await adapter.synthesizeVibe({
  userPrompt: "Implement idempotent payment retry with exponential backoff",
  modelTarget: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

### C. DeepSeek (V3 & R1)
```javascript
const res = await adapter.synthesizeVibe({
  userPrompt: "Enforce strict AML compliance checks on transaction hashes",
  modelTarget: "deepseek",
  apiKey: process.env.DEEPSEEK_API_KEY
});
```

### D. Local & Offline Models (Ollama, Qwen2.5, Llama 3)
Ensure Ollama is running (`ollama run qwen2.5-coder`):
```javascript
const res = await adapter.synthesizeVibe({
  userPrompt: "Synthesize rate-limiting guard with 100 req/sec limit",
  modelTarget: "ollama",
  baseUrl: "http://localhost:11434"
});
```

---

## 4. Cursor & Windsurf AI IDE Integration (MCP)

Vivid includes an official **Model Context Protocol (MCP)** server over stdio. This grants your AI editor native visibility into the Vivid AST and Semantic Node Addressing graph.

### Configuring Cursor / Claude Desktop / Windsurf
Add Vivid to your `mcpServers` configuration (`~/.cursor/mcp.json` or Claude Desktop configuration):

```json
{
  "mcpServers": {
    "vivid": {
      "command": "node",
      "args": ["/absolute/path/to/vivid-lang/bin/vivid.js", "mcp"]
    }
  }
}
```

### Available MCP Tools for Your AI
1. `vivid_inspect_ast`: Returns the complete AST and SNA hash index of a `.vv` file.
2. `vivid_get_node`: Queries an individual node by ID (e.g. `@guard_CartSafety#d6b8a39d`).
3. `vivid_verify_invariants`: Tests guard rules against mock state and returns a MARP report if violated.

---

## 5. Self-Healing Runtime: Working with MARP

When an invariant breaks, Vivid generates a **Machine-Actionable Repair Packet (MARP)**:

```json
{
  "version": "1.0",
  "errorKind": "InvariantViolation",
  "guardName": "OrderIntegrity",
  "targetNodeId": "@guard_OrderIntegrity#f48a",
  "failedExpression": "ensure total_cents > 0",
  "minimalCounterexample": {
    "total_cents": 0
  },
  "suggestedPatchStrategy": "Enforce CartItem.qty >= 1 at ingress validator"
}
```

Pass this object directly to your AI model to auto-generate a surgical SNA patch that fixes the error on the first attempt.

---

## 6. Commercial Licensing & Production Inquiries

Remember: Vivid is **free for non-commercial and learning use**. For commercial SaaS deployments, production agent swarms, or closed-source enterprise software, contact:

- **Author & Copyright Holder:** Suman Kumar Das
- **Email:** [fysuman20@gmail.com](mailto:fysuman20@gmail.com)
- **Commercial Details:** Read [COMMERCIAL.md](COMMERCIAL.md)
