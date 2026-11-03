# Vivid Language Specification (v1.0.0)

**Author:** Suman Kumar Das  
**Status:** Living Standard  
**File Extension:** `.vv`

---

## 1. Abstract

Vivid is a dual-layer, contract-centric programming language and reactive runtime engineered specifically for the vibe coding era. Traditional programming languages require excessive ceremony (boilerplate imports, repetitive typing gymnastics, fragile syntax diffs) and offer poor semantic telemetry for modern AI coding agents.

Vivid introduces:
1. **The Dual-Layer Paradigm**: Separation of Human Intent (`intent`, `guard`) and Machine Realization (`realize`, `flow`).
2. **Semantic Node Addressing (SNA)**: Content-addressed AST hashing that eliminates line-based diff and patch collisions.
3. **Machine-Actionable Repair Packets (MARP)**: Self-healing error telemetry designed for automated LLM diagnosis and repair.
4. **The Pulse Reactive Runtime**: Ambient graph persistence, transactional flows, and unified lens UI projection.

---

## 2. Grammar & Syntax (EBNF)

```ebnf
Program        ::= [ ModuleDecl ] { Declaration } ;
ModuleDecl     ::= "module" Identifier ";" ;

Declaration    ::= IntentDecl 
                 | GuardDecl 
                 | ModelDecl 
                 | LensDecl 
                 | RealizeDecl 
                 | StoreDecl 
                 | FlowDecl ;

IntentDecl     ::= "intent" Identifier "{" { IntentProp } "}" ;
IntentProp     ::= "vibe" ":" String
                 | "actors" ":" "[" { Identifier } "]"
                 | "sla" ":" ( String | Number )
                 | String ;

GuardDecl      ::= "guard" Identifier "{" { InvariantRule } "}" ;
InvariantRule  ::= ( "ensure" | "never" | "require" | "sla" ) Expression [ ";" ] ;

ModelDecl      ::= "model" Identifier "{" { ModelField } "}" ;
ModelField     ::= Identifier ":" TypeName [ Constraint ] [ ";" | "," ] ;

LensDecl       ::= "lens" Identifier [ "(" ParameterList ")" ] "{" LensBody "}" ;
LensBody       ::= [ "theme" ":" String ] "surface" "{" { SurfaceElement } "}" ;
SurfaceElement ::= Identifier ":" ( String | ActionExpr ) [ ";" ] ;
ActionExpr     ::= "action" "(" String ")" ;

RealizeDecl    ::= "realize" SNARef "{" { FlowDecl | Stmt } "}" ;
SNARef         ::= "@" Identifier [ "#" HexHash ] ;

StoreDecl      ::= "store" Identifier "{" { StoreField } "}" ;
StoreField     ::= ( "persisted" | "ephemeral" ) Identifier ":" TypeName
                 | "sync" ":" "[" { Identifier } "]" ;

FlowDecl       ::= "flow" Identifier "(" [ ParameterList ] ")" [ "->" TypeName ] "{" FlowBody "}" ;
FlowBody       ::= [ "atomic" ] "{" { Stmt } "}" ;
```

---

## 3. Semantic Node Addressing (SNA)

Every declaration in a Vivid program is compiled into a canonical AST representation. Comments and non-semantic whitespace are normalized, and a deterministic SHA-256 digest is produced:

$$\text{SNA ID} = @\langle\text{type}\rangle\_\langle\text{identifier}\rangle\#\text{hash}_{8}$$

### Patch Semantics
Unlike line-based git diffs or search-and-replace blocks, AI agents operate on Vivid by issuing **SNA Mutation Directives**:
```json
{
  "target": "@guard_CartSafety#d6b8a39d",
  "action": "replace",
  "node": {
    "type": "GuardDeclaration",
    "name": "CartSafety",
    "invariants": [...]
  }
}
```
This guarantees that concurrent or multi-step prompt iterations never break surrounding syntax or shift line numbers.

---

## 4. Machine-Actionable Repair Packet (MARP)

When an invariant or type guard fails, the Pulse Runtime produces a structured JSON telemetry report:

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

---

## 5. Universal Model Connectivity

Vivid includes native adapters and a standard **Model Context Protocol (MCP)** server, making it directly compatible with:
- OpenAI (GPT-4o, o1, o3)
- Anthropic Claude (Claude 3.5 Sonnet, Claude 3.7)
- DeepSeek (V3, R1)
- Google Gemini
- Local LLMs via Ollama (`llama3`, `qwen2.5-coder`, `mistral`)

---

## 6. Author & License

- **Author:** Suman Kumar Das
- **Repository:** https://github.com/digital-tricksters001/vivid-lang
- **License:** MIT License
