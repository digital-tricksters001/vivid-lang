/**
 * Vivid Interactive Web Studio Engine
 * Client-side Reactive Compiler, SNA Visualizer, and Lens Simulator
 * Author: Suman Kumar Das
 */

import { VIVID_SAMPLES } from './samples.js';

class VividStudio {
  constructor() {
    this.editor = document.getElementById('editor');
    this.snaTree = document.getElementById('sna-tree');
    this.lensPreview = document.getElementById('lens-preview');
    this.invariantsList = document.getElementById('invariants-list');
    this.marpContainer = document.getElementById('marp-container');
    this.promptInput = document.getElementById('prompt-input');
    this.sampleSelect = document.getElementById('sample-select');
    this.modelSelect = document.getElementById('model-select');
    this.activeNodesBadge = document.getElementById('active-nodes-count');
    this.statusPill = document.getElementById('status-pill');

    this.currentProgram = null;
    this.simulatedViolation = false;

    this.init();
  }

  init() {
    // Load default sample
    this.editor.value = VIVID_SAMPLES.checkout.code;

    // Event listeners
    this.editor.addEventListener('input', () => this.handleCodeChange());
    this.sampleSelect.addEventListener('change', (e) => this.loadSample(e.target.value));
    
    document.getElementById('btn-synthesize').addEventListener('click', () => this.synthesizePrompt());
    document.getElementById('btn-simulate-fault').addEventListener('click', () => this.toggleFaultSimulation());
    document.getElementById('btn-auto-heal').addEventListener('click', () => this.autoHealFault());
    document.getElementById('btn-copy-code').addEventListener('click', () => this.copyCode());

    // Initial compile
    this.handleCodeChange();
  }

  loadSample(sampleKey) {
    if (VIVID_SAMPLES[sampleKey]) {
      this.editor.value = VIVID_SAMPLES[sampleKey].code;
      this.simulatedViolation = false;
      this.handleCodeChange();
    }
  }

  async handleCodeChange() {
    const code = this.editor.value;
    try {
      this.statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 pulse-dot"></span>Compiling...';
      
      const parsed = this.parseVividCode(code);
      this.currentProgram = parsed;

      await this.renderSNAGraph(parsed);
      this.renderInvariants(parsed);
      this.renderLensPreview(parsed);

      this.statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>Pulse Active & Verified';
      this.statusPill.className = 'text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center';
    } catch (err) {
      this.statusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Syntax Warning`;
      this.statusPill.className = 'text-xs font-mono px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center';
    }
  }

  parseVividCode(code) {
    const lines = code.split('\n');
    const nodes = [];
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

      if (line.startsWith('module ')) {
        continue;
      }

      const blockMatch = line.match(/^(intent|guard|model|lens|realize|store)\s+([a-zA-Z0-9_@#]+)/);
      if (blockMatch) {
        if (currentBlock) nodes.push(currentBlock);
        currentBlock = {
          type: blockMatch[1],
          name: blockMatch[2],
          raw: line,
          lines: [line]
        };
        continue;
      }

      if (currentBlock) {
        currentBlock.lines.push(line);
        if (line.includes('}')) {
          nodes.push(currentBlock);
          currentBlock = null;
        }
      }
    }

    if (currentBlock) nodes.push(currentBlock);
    return nodes;
  }

  async renderSNAGraph(nodes) {
    this.snaTree.innerHTML = '';
    this.activeNodesBadge.textContent = `${nodes.length} Nodes`;

    for (const node of nodes) {
      const rawText = node.lines.join(' ');
      const hash = await this.computeHash(rawText);
      const nodeId = `@${node.type}_${node.name}#${hash}`;

      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group flex items-center justify-between text-xs';
      
      let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      if (node.type === 'guard') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      if (node.type === 'lens') badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      if (node.type === 'realize') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

      card.innerHTML = `
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="px-2 py-0.5 rounded font-mono uppercase text-[10px] border ${badgeColor}">${node.type}</span>
          <span class="font-mono text-slate-300 truncate font-medium group-hover:text-emerald-400">${nodeId}</span>
        </div>
        <span class="text-slate-500 font-mono text-[11px] group-hover:text-slate-300">SNA</span>
      `;

      card.addEventListener('click', () => {
        // Highlight in editor or show toast
        this.flashNotice(`Targeted Node: ${nodeId}`);
      });

      this.snaTree.appendChild(card);
    }
  }

  renderInvariants(nodes) {
    this.invariantsList.innerHTML = '';
    const guardNode = nodes.find(n => n.type === 'guard');

    if (!guardNode) {
      this.invariantsList.innerHTML = '<div class="text-xs text-slate-500 italic p-3">No guard declarations present.</div>';
      return;
    }

    const rules = guardNode.lines
      .filter(l => /^(ensure|never|require|sla)\b/.test(l.trim()))
      .map(l => l.trim().replace(/;$/, ''));

    const isFailing = this.simulatedViolation;

    rules.forEach((rule, idx) => {
      const item = document.createElement('div');
      const shouldFailThisRule = isFailing && idx === 0;

      item.className = `p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
        shouldFailThisRule
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
      }`;

      item.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${shouldFailThisRule ? 'bg-rose-500' : 'bg-emerald-400'}"></span>
          <span>${rule}</span>
        </div>
        <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
          shouldFailThisRule ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'
        }">${shouldFailThisRule ? 'VIOLATED' : 'PASS'}</span>
      `;

      this.invariantsList.appendChild(item);
    });

    if (isFailing) {
      this.showMARPReport(guardNode.name, rules[0]);
    } else {
      this.marpContainer.classList.add('hidden');
    }
  }

  showMARPReport(guardName, failingRule) {
    this.marpContainer.classList.remove('hidden');
    const packetContent = document.getElementById('marp-content');
    
    const packet = {
      version: "1.0",
      errorKind: "InvariantViolation",
      guardName: guardName,
      targetNodeId: `@guard_${guardName}#4a9b`,
      failedExpression: failingRule,
      minimalCounterexample: {
        total: 1000,
        computedSum: 800,
        delta: 200
      },
      repairDirective: "Inject ingress normalizer at @tx_process to guarantee state invariant consistency."
    };

    packetContent.textContent = JSON.stringify(packet, null, 2);
  }

  toggleFaultSimulation() {
    this.simulatedViolation = !this.simulatedViolation;
    const btn = document.getElementById('btn-simulate-fault');
    if (this.simulatedViolation) {
      btn.textContent = 'Reset Invariants';
      btn.classList.remove('border-rose-500/40', 'text-rose-400');
      btn.classList.add('bg-rose-600', 'text-white');
    } else {
      btn.textContent = 'Simulate Fault';
      btn.classList.remove('bg-rose-600', 'text-white');
      btn.classList.add('border-rose-500/40', 'text-rose-400');
    }
    this.handleCodeChange();
  }

  autoHealFault() {
    this.simulatedViolation = false;
    document.getElementById('btn-simulate-fault').textContent = 'Simulate Fault';
    document.getElementById('btn-simulate-fault').classList.remove('bg-rose-600', 'text-white');
    document.getElementById('btn-simulate-fault').classList.add('border-rose-500/40', 'text-rose-400');

    // Add healing comment or node to editor
    if (!this.editor.value.includes('// [AI Self-Healed: Invariant Re-established]')) {
      this.editor.value += '\n\n// [AI Self-Healed: Invariant Re-established via MARP packet]\n';
    }
    this.handleCodeChange();
    this.flashNotice('Auto-healed: Invariants verified & state re-balanced!');
  }

  renderLensPreview(nodes) {
    const lensNode = nodes.find(n => n.type === 'lens');
    if (!lensNode) {
      this.lensPreview.innerHTML = '<div class="text-xs text-slate-500 p-4">No lens surface defined in active module.</div>';
      return;
    }

    const surfaceLines = lensNode.lines.filter(l => l.includes(':'));
    let headerText = lensNode.name;
    let actionText = 'Trigger Pulse Action';
    const fields = [];

    surfaceLines.forEach(l => {
      const parts = l.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(':').trim().replace(/["',;]/g, '');
        if (key === 'header' || key === 'title') {
          headerText = val;
        } else if (val.includes('action(')) {
          actionText = val.replace(/action\((.*?)\)/, '$1');
        } else {
          fields.push({ key, val });
        }
      }
    });

    const fieldsHtml = fields.map(f => `
      <div class="flex items-center justify-between py-2 border-b border-white/5 text-xs">
        <span class="text-slate-400 font-mono capitalize">${f.key.replace(/_/g, ' ')}</span>
        <span class="text-slate-200 font-semibold font-mono">${f.val}</span>
      </div>
    `).join('');

    this.lensPreview.innerHTML = `
      <div class="p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-2xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h4 class="font-bold text-white text-sm font-sans tracking-tight">${headerText}</h4>
          </div>
          <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Pulse Lens
          </span>
        </div>
        <div class="space-y-1 mb-5">
          ${fieldsHtml}
        </div>
        <button id="btn-lens-action" class="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          ${actionText}
        </button>
      </div>
    `;

    document.getElementById('btn-lens-action').addEventListener('click', () => {
      this.flashNotice(`Action executed via Pulse Runtime: "${actionText}"`);
    });
  }

  async synthesizePrompt() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) return;

    const btn = document.getElementById('btn-synthesize');
    const origText = btn.innerHTML;
    btn.innerHTML = `<span class="animate-spin mr-1">⚡</span> Synthesizing...`;
    btn.disabled = true;

    // Simulate AI synthesis with Universal Adapter logic
    setTimeout(() => {
      const model = this.modelSelect.value;
      const injection = `
// Synthesized via ${model.toUpperCase()} for intent: "${prompt}"
guard Safety_${Math.floor(Math.random() * 1000)} {
    ensure verified == true
    never allow_unauthorized_state_transition()
}

flow apply_feature() -> Result<Void, Error> {
    atomic {
        emit FeatureActivated("${prompt.replace(/"/g, '')}")
        return ok()
    }
}`;

      this.editor.value += '\n' + injection.trim() + '\n';
      this.handleCodeChange();
      this.promptInput.value = '';
      btn.innerHTML = origText;
      btn.disabled = false;
      this.flashNotice(`Synthesized new AST nodes via ${model}!`);
    }, 600);
  }

  async computeHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.replace(/\s+/g, ' ').trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
  }

  copyCode() {
    navigator.clipboard.writeText(this.editor.value);
    this.flashNotice('Vivid code copied to clipboard!');
  }

  flashNotice(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs shadow-2xl z-50 animate-bounce flex items-center gap-2';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span>${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VividStudio();
});
