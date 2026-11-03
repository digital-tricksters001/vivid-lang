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

[![License: Free for Non-Commercial](https://img.shields.io/badge/License-Free%20for%20Non--Commercial-emerald.svg)](LICENSE)
[![Commercial License](https://img.shields.io/badge/Commercial%20Use-Sold%20by%20Suman%20Kumar%20Das-blue.svg)](COMMERCIAL.md)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-cyan.svg)](https://nodejs.org)
[![Universal AI](https://img.shields.io/badge/AI%20Compatibility-Universal%20(OpenAI%20%7C%20Claude%20%7C%20DeepSeek%20%7C%20Ollama)-purple.svg)](#universal-ai-connectivity)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Native%20Server-teal.svg)](#cursor--windsurf-mcp-integration)
[![Developer](https://img.shields.io/badge/Author-Suman%20Kumar%20Das-10b981.svg)](https://github.com/digital-tricksters001)

[**Live Interactive Studio**](https://digital-tricksters001.github.io/vivid-lang) • [**Developer Guide**](GUIDE.md) • [**Language Specification**](SPECIFICATION.md) • [**Commercial Licensing**](COMMERCIAL.md) • [**Launch Kit**](LAUNCH.md)

</div>

---

## The Problem with Traditional Code in the AI Era

Traditional programming languages (TypeScript, Python, Rust, Go) were built for human typing character-by-character:
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

model Buyer {
    id: UUID
    email: Text
    payment_method: Text
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

## How to Use Vivid (Complete Guide)

For the full end-to-end tutorial, see [**GUIDE.md**](GUIDE.md).

### 1. Installation
```bash
git clone https://github.com/digital-tricksters001/vivid-lang.git
cd vivid-lang
npm install
npm run build
```

### 2. Run a Vivid Program
```bash
node bin/vivid.js run examples/01_saas_checkout.vv
```

### 3. Verify Invariant Safety
```bash
node bin/vivid.js verify examples/01_saas_checkout.vv
```

### 4. Cursor & Windsurf MCP Integration
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

### 5. Launch the Web Studio Locally
```bash
npm run studio
# Open http://localhost:4173 in your browser
```

---

## Interactive Web Studio & Playground

Try Vivid directly in your browser without installing anything:

👉 **[https://digital-tricksters001.github.io/vivid-lang](https://digital-tricksters001.github.io/vivid-lang)**

- **Live Code Editor:** Real-time syntax feedback on `.vv` files.
- **Vibe Prompt Bar:** Describe requirements in plain English and synthesize AST nodes on the fly.
- **SNA Graph Inspector:** Live visualization of content hashes and dependency links.
- **Invariant Fault Simulator & Auto-Heal:** Trigger edge-case faults and watch Vivid self-heal.
- **Pulse Live Lens:** Live preview of reactive user interfaces.

---

## SEO & LLM Frequently Asked Questions (FAQ)

### What makes Vivid different from TypeScript or Python?
Traditional languages require developers to manually write and maintain types, import declarations, and runtime plumbing. Vivid introduces **Dual-Layer Programming**: humans write high-level intent (`intent`) and safety contracts (`guard`), while AI agents generate and maintain content-addressed execution flows (`realize`, `flow`).

### How does Semantic Node Addressing (SNA) prevent hallucinated merge conflicts?
Unlike traditional Git diffs that operate on text lines, SNA assigns an immutable SHA-256 hash to every AST node. When an AI edits code, it targets node hashes directly. Surrounding code, whitespace, and brackets are left completely untouched.

### Can Vivid be used with local LLMs offline?
Yes! Vivid includes built-in adapters for **Ollama**, allowing offline synthesis with local open-weights models like Qwen 2.5 Coder, Llama 3, and Mistral without sending any code to external clouds.

### What are the licensing terms for Vivid?
Vivid is **free for non-commercial use** (hobbyists, students, educational institutions, researchers, and open evaluation). Commercial deployment, SaaS hosting, and production enterprise integration rights are sold exclusively by **Suman Kumar Das**. See [COMMERCIAL.md](COMMERCIAL.md) for details.

---

## Copyright & Commercial Licensing

- **Copyright © 2026 Suman Kumar Das. All Rights Reserved.**
- **Non-Commercial License:** Free under the [Vivid Community License](LICENSE).
- **Commercial Licensing:** Any commercial use or deployment is sold exclusively by **Suman Kumar Das**.
- **Commercial Inquiries:** [fysuman20@gmail.com](mailto:fysuman20@gmail.com) | [GitHub Profile](https://github.com/digital-tricksters001)
