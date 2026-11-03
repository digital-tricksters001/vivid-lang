/**
 * Pre-loaded Vivid Language Samples for the Web Studio
 * Author: Suman Kumar Das
 */

export const VIVID_SAMPLES = {
  checkout: {
    title: "SaaS Checkout & Fraud Guard",
    code: `module SaasCheckout;

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

// 3. FORMAL INVARIANTS (Verified statically & continuously at runtime)
guard CartSafety {
    ensure total == items.sum(i => i.cents * i.qty)
    ensure total > 0
    never allow_negative_balance()
    require valid_session(Buyer)
}

// 4. REACTIVE LENS (Unified UI + API projection)
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
}`
  },

  kanban: {
    title: "Ambient Multi-Tenant Kanban",
    code: `module AmbientKanban;

intent TeamCollaboration {
    vibe: "Fluid, low-latency, multiplayer, zero-friction"
    actors: [Member, Admin]
    sla: 120ms
}

model TaskCard {
    id: UUID
    title: Text
    status: Text
    assignee: Text
    points: Int >= 0
}

guard KanbanIntegrity {
    ensure cards.length >= 0
    never allow_duplicate_ids()
    require valid_team_membership(Member)
}

store BoardStore {
    persisted columns: TaskCard[]
    ephemeral active_collaborators: Text[]
    sync: [collaborative, encrypted]
}

lens BoardView(store: BoardStore) {
    theme: "cyber-slate"
    surface {
        title: "Sprint Workspace"
        active_users: "4 online"
        tasks_progress: "82% completed"
        add_card: action("Create Task Card")
    }
}

realize @kanban_mutation {
    flow move_card(card_id: UUID, new_status: Text) -> Result<Void, Error> {
        atomic {
            update_card_status(card_id, new_status)
            emit CardRelocated(card_id, new_status)
            return ok()
        }
    }
}`
  },

  ledger: {
    title: "Bank-Grade Double-Entry Ledger",
    code: `module FintechLedger;

intent AuditCompliance {
    vibe: "Bank-grade, unalterable, double-entry, strictly consistent"
    actors: [System, ComplianceOfficer]
    sla: 50ms
}

model LedgerEntry {
    id: UUID
    account_id: UUID
    debit_cents: Int >= 0
    credit_cents: Int >= 0
    timestamp: Timestamp
}

guard BalanceSheetSafety {
    ensure total_debits == total_credits
    ensure total_debits >= 0
    never allow_unbalanced_journals()
    never allow_negative_balance()
}

lens LedgerMonitor(entries: LedgerEntry[]) {
    theme: "audit-dark"
    surface {
        title: "Immutable Transaction Ledger"
        status: "Balanced & Reconciled"
        total_balance: "$1,450,280.00"
        reconcile_action: action("Run Automated Audit")
    }
}

realize @ledger_poster {
    flow post_journal(entries: LedgerEntry[]) -> Result<JournalId, Error> {
        atomic {
            guard BalanceSheetSafety(entries)
            let journal_id = vault.append_entry(entries)
            emit JournalCommitted(journal_id)
            return ok(journal_id)
        }
    }
}`
  },

  swarm: {
    title: "Autonomous Agent Swarm",
    code: `module AgentSwarm;

intent AutonomousOrchestration {
    vibe: "Decentralized, self-balancing, fault-tolerant, transparent"
    actors: [Orchestrator, WorkerAgent]
    sla: 250ms
}

model AgentTask {
    id: UUID
    capability_required: Text
    priority: Int >= 1
    timeout_seconds: Int > 0
}

guard SwarmHealth {
    ensure active_workers > 0
    ensure pending_tasks <= max_queue_capacity
    never dispatch_to_offline_node()
}

lens SwarmDashboard(tasks: AgentTask[]) {
    theme: "neon-matrix"
    surface {
        header: "Swarm Intelligence Engine"
        cluster_load: "42% capacity"
        active_nodes: "12 healthy"
        dispatch_action: action("Trigger Autonomous Cycle")
    }
}

realize @orchestrator_core {
    flow schedule_task(task: AgentTask) -> Result<AgentId, Error> {
        atomic {
            let best_worker = pool.find_idle_worker(task.capability_required)
            assign(best_worker, task)
            emit TaskDispatched(task.id, best_worker.id)
            return ok(best_worker.id)
        }
    }
}`
  }
};
