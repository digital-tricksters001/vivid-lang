# Vivid (`.vv`) & The Pulse Runtime

<div align="center">

```
 ██╗   ██╗██╗██╗   ██╗██╗██████╗ 
 ██║   ██║██║██║   ██║██║██╔══██╗
 ██║   ██║██║██║   ██║██║██║  ██║
 ╚██╗ ██╔╝██║╚██╗ ██╔╝██║██║  ██║
  ╚████╔╝ ██║ ╚████╔╝ ██║██████╔╝
   ╚═══╝  ╚═╝  ╚═══╝  ╚═╝╚═════╝ 
```

### The Semantic Programming Language & Reactive Runtime Engineered for the Vibe Coding Era

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-cyan.svg)](https://nodejs.org)
[![Universal AI](https://img.shields.io/badge/AI%20Compatibility-Universal%20(OpenAI%20%7C%20Claude%20%7C%20DeepSeek%20%7C%20Ollama)-purple.svg)](#universal-ai-connectivity)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Native%20Server-blue.svg)](#cursor--windsurf-mcp-integration)
[![Developer](https://img.shields.io/badge/Author-Suman%20Kumar%20Das-10b981.svg)](https://github.com/digital-tricksters001)

[**Live Interactive Studio**](https://digital-tricksters001.github.io/vivid-lang) • [**Language Specification**](SPECIFICATION.md) • [**Examples**](examples/) • [**Report Issue**](https://github.com/digital-tricksters001/vivid-lang/issues)

</div>

---

## The Problem with Traditional Code in the AI Era

Traditional programming languages (TypeScript, Python, Rust, Go) were designed for manual human typing character-by-character:
- **Token Tax:** Up to 60% of LLM context windows are consumed by ceremony (imports, type plumbing, serializations, `useEffect` dependencies).
- **Diff & Patch Fragility:** Line-based search-and-replace patches fail frequently when LLMs hallucinate surrounding indentation or closing brackets.
- **Intent Erosion:** High-level architectural rules, performance SLAs, and business invariants disappear into informal comments that compilers discard.
- **Cryptic Stack Traces:** Runtime errors like `TypeError: cannot read property 'price' of undefined` lack the minimal counterexample needed for an AI model to repair itself.

---

## Enter Vivid: Dual-Layer Semantic Programming

Vivid (`.vv`) separates software into two synchronized layers:
1. **The Human Intent Layer (`intent` & `guard`):** Declares business vibes, safety invariants, user journeys, and SLAs.
2. **The Machine Realization Layer (`realize` & `flow`):** Synthesized and maintained by AI agents, addressed by deterministic content hashes.

```vivid
// examples/01_saas_checkout.vv
module SaasCheckout;

// 1. HUMAN VIBE SPECIFICATION
intent PaymentFlow {
    vibe: "Instant, transparent, reassuring, frictionless"
    actors: [Buyer, Merchant]
    sla: 800ms
}

// 2. DATA SCHEMA & CONSTRAINTS
model CartItem {
    id: UUID
    name: Text
    cents: Int > 0
    qty: Int >= 1
}

// 3. FORMAL INVARIANTS (Verified statically & at runtime)
guard CartSafety {
    ensure total == items.sum(i => i.cents * i.qty)
    ensure total > 0
    never allow_negative_balance()
    require valid_session(Buyer)
}

// 4. REACTIVE LENS (Unified UI + API surface)
lens CheckoutModal(cart: CartItem[], buyer: Buyer) {
    theme: "glassmorphism-emerald"
    surface {
        header: "Secure One-Click Checkout"
        status: "Cart Verified"
        total_amount: "$49.00"
        pay_button: action("Authorize Payment")
    }
}

// 5. REALIZATION (AI Synthesized logic, targeted by content-hash)
realize @tx_process {
    flow execute_charge(buyer: Buyer, cart: CartItem[]) -> Result<Receipt, Error> {
        atomic {
            reserve_inventory(cart)
            let receipt = stripe.charge(buyer.payment_method, cart.total)
            emit OrderConfirmed(receipt)
            return ok(receipt)
        }
    }
}
```

---

## Core Innovations

### 1. Semantic Node Addressing (SNA) — Zero Diff Collisions
Instead of line-based diffs, Vivid indexes every block into a content-addressed SHA-256 node ID:
```
@intent_PaymentFlow#66b0bdb5
@model_CartItem#fee7b519
@guard_CartSafety#d6b8a39d
@lens_CheckoutModal#5dc30df7
@realize_anon#8a42bb8a
```
When an AI patches a function, it mutates the targeted AST node directly. **Merge conflicts and missing curly braces are mathematically impossible.**

---

### 2. Machine-Actionable Repair Packets (MARP)
When runtime invariants fail, the Pulse Runtime doesn't crash with a generic traceback. It produces a **MARP Report**:

```json
{
  "version": "1.0",
  "errorKind": "InvariantViolation",
  "guardName": "CartSafety",
  "targetNodeId": "@guard_CartSafety#d6b8a39d",
  "failedExpression": "ensure total == items.sum(i => i.cents * i.qty)",
  "minimalCounterexample": {
    "total": 1000,
    "items": [{ "cents": 400, "qty": 2 }]
  },
  "suggestedPatchStrategy": "Enforce CartItem.qty >= 1 at ingress validator @api_gateway#110c"
}
```
Any LLM can ingest this structured payload and repair the bug on the first attempt.

---

### 3. Universal AI Connectivity

Vivid is designed to interface natively with **any** AI model:

| Model / Provider | Supported Modality | Connection Type |
| :--- | :--- | :--- |
| **OpenAI** (GPT-4o, o1, o3) | Cloud API | Native REST Adapter |
| **Anthropic** (Claude 3.5 / 3.7 Sonnet) | Cloud API | Native Messages Adapter |
| **DeepSeek** (V3, R1) | Cloud API | Native REST Adapter |
| **Local LLMs** (Ollama, Qwen2.5, Llama 3) | Local Endpoint | Zero-latency HTTP |
| **Cursor / Windsurf / VS Code** | AI IDE Integration | Built-in **MCP Server** |

---

## Interactive Web Studio & Playground

Vivid includes an interactive dark-mode Web Studio:

```bash
# Launch the interactive Vivid Studio locally
npx vivid serve
```

```
> http://localhost:4173
```

- **Live Code Editor:** Real-time syntax feedback on `.vv` files.
- **Vibe Prompt Bar:** Describe requirements in plain English and synthesize AST nodes on the fly.
- **SNA Graph Inspector:** Live visualization of content hashes and dependency links.
- **Invariant Fault Simulator & Auto-Heal:** Trigger edge-case faults and watch Vivid self-heal.
- **Pulse Live Lens:** Live preview of reactive user interfaces.

---

## CLI Quickstart

### Installation
```bash
git clone https://github.com/digital-tricksters001/vivid-lang.git
cd vivid-lang
npm install
npm run build
```

### Run a Vivid Program
```bash
node bin/vivid.js run examples/01_saas_checkout.vv
```

### Verify Invariants
```bash
node bin/vivid.js verify examples/01_saas_checkout.vv
```

### Cursor & Windsurf MCP Integration
Add Vivid to your Cursor or Claude Desktop MCP configuration (`mcpServers`):
```json
{
  "mcpServers": {
    "vivid": {
      "command": "node",
      "args": ["/path/to/vivid-lang/bin/vivid.js", "mcp"]
    }
  }
}
```
Your AI assistant can now natively inspect the AST, query node hashes, and apply surgical patches.

---

## Project Structure

```
vivid-lang/
├── bin/
│   └── vivid.js                   # CLI Tool (run, verify, serve, mcp)
├── src/
│   ├── core/
│   │   ├── ast.ts                 # Formal AST Types
│   │   ├── lexer.ts               # Tokenizer for .vv files
│   │   ├── parser.ts              # Semantic AST Parser
│   │   ├── sna.ts                 # Semantic Node Addressing Engine
│   │   ├── invariants.ts          # Guard & Invariant Verifier
│   │   └── marp.ts                # Machine-Actionable Repair Packet Engine
│   ├── runtime/
│   │   └── pulse.ts               # Pulse Execution & Lens Engine
│   ├── adapters/
│   │   ├── base.ts                # Universal Provider Interface
│   │   ├── universal.ts           # OpenAI, Claude, DeepSeek, Ollama Dispatcher
│   │   └── mcp.ts                 # Model Context Protocol (MCP) Server
│   └── web/                       # Interactive Web Studio
│       ├── index.html             # High-aesthetic Studio UI
│       ├── app.js                 # Reactive browser compiler
│       ├── styles.css             # Glassmorphism design system
│       └── samples.js             # Showcase templates
├── examples/                      # Real-world .vv programs
├── syntaxes/
│   └── vivid.tmLanguage.json      # VS Code / Cursor Syntax Grammar
├── tests/
│   └── vivid.test.js              # Unit Test Suite
├── SPECIFICATION.md               # Formal Language Spec
└── LICENSE                        # MIT License
```

---

## Running Tests

```bash
npm test
```

All 5 core engine test suites verify:
- Lexer tokenization of Vivid keywords and SNA addresses
- AST parser construction and module resolution
- Invariant verification and MARP report generation
- Surgical semantic patching via SNA hashes
- Universal AI adapter synthesis

---

## Author & Credits

Designed and engineered by **Suman Kumar Das**  
GitHub: [@digital-tricksters001](https://github.com/digital-tricksters001)  
Email: [info@digital-tricksters.com](mailto:info@digital-tricksters.com)

Distributed under the **MIT License**.
