/**
 * Pulse Reactive Execution Runtime
 * Provides ambient store persistence, atomic flow evaluation, and lens UI projection.
 * Author: Suman Kumar Das
 */
export class PulseRuntime {
    program;
    state = {
        stores: {},
        events: [],
        activeLenses: {}
    };
    constructor(program) {
        this.program = program;
        this.initializeStores();
    }
    initializeStores() {
        for (const node of this.program.nodes) {
            if (node.type === 'StoreDeclaration') {
                const storeNode = node;
                this.state.stores[storeNode.name] = {};
                for (const f of storeNode.persistedFields) {
                    this.state.stores[storeNode.name][f.name] = null;
                }
                for (const f of storeNode.ephemeralFields) {
                    this.state.stores[storeNode.name][f.name] = null;
                }
            }
        }
    }
    getStore(name) {
        return this.state.stores[name];
    }
    emitEvent(name, payload) {
        this.state.events.push({
            name,
            payload,
            timestamp: Date.now()
        });
    }
    /**
     * Projects a LensDeclaration into a reactive HTML widget
     */
    projectLensToHTML(lens, contextData = {}) {
        const elementsHtml = lens.elements
            .map(el => {
            let val = el.value.replace(/^["']|["']$/g, '');
            // Replace dynamic template interpolations e.g. {cart.total}
            for (const [k, v] of Object.entries(contextData)) {
                val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            }
            if (el.isAction) {
                return `
            <div class="vivid-action-row my-3">
              <button class="vivid-btn w-full py-3 px-5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95" onclick="alert('Action triggered: ${el.key}')">
                ${val.replace(/action\((.*?)\)/, '$1')}
              </button>
            </div>
          `;
            }
            return `
          <div class="vivid-lens-item flex items-center justify-between py-2 border-b border-white/10">
            <span class="text-xs uppercase tracking-wider text-slate-400 font-mono">${el.key}</span>
            <span class="text-sm font-medium text-slate-200 font-mono">${val}</span>
          </div>
        `;
        })
            .join('\n');
        return `
      <div class="vivid-surface-card rounded-2xl p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 class="text-lg font-bold text-white font-sans">${lens.name}</h3>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Pulse Lens
          </span>
        </div>
        <div class="vivid-elements-container space-y-1">
          ${elementsHtml}
        </div>
      </div>
    `;
    }
}
//# sourceMappingURL=pulse.js.map