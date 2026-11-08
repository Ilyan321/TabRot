import { useState, useEffect } from 'react';
import type { TabSpecimen } from '../types';
import {
  fetchRealChromeTabs,
  closeRealChromeTab,
  openFullDashboard,
  focusRealChromeTab,
} from '../engine/chromeTabs';
import { getMockSpecimens, calculateTerrariumStats, waterTab, cremateTab } from '../engine/decayEngine';
import { soundEngine } from '../engine/soundEngine';
import { Layers, Flame, Droplet, ExternalLink, Maximize2 } from 'lucide-react';

export function Popup() {
  const [tabs, setTabs] = useState<TabSpecimen[]>([]);

  useEffect(() => {
    soundEngine.unlockAudio();
    const loadTabs = async () => {
      const real = await fetchRealChromeTabs();
      if (real && real.length > 0) {
        setTabs(real);
      } else {
        const saved = localStorage.getItem('tabrot_tabs');
        if (saved) {
          try {
            setTabs(JSON.parse(saved));
          } catch {
            setTabs(getMockSpecimens());
          }
        } else {
          setTabs(getMockSpecimens());
        }
      }
    };
    loadTabs();
  }, []);

  const stats = calculateTerrariumStats(tabs, []);
  const rottenTabs = tabs.filter((t) => t.stage === 'rotten' || t.stage === 'fossilized');

  const handleWater = (id: string) => {
    soundEngine.playWater();
    setTabs((prev) => prev.map((t) => (t.id === id ? waterTab(t) : t)));
  };

  const handleCremate = (id: string) => {
    soundEngine.playCremate();
    closeRealChromeTab(id);
    const target = tabs.find((t) => t.id === id);
    if (target) {
      const graveyardStr = localStorage.getItem('tabrot_graveyard');
      const graveyard = graveyardStr ? JSON.parse(graveyardStr) : [];
      graveyard.unshift(cremateTab(target, 'Closed via Action Popup'));
      localStorage.setItem('tabrot_graveyard', JSON.stringify(graveyard));
    }
    setTabs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMassCremate = () => {
    soundEngine.playCremate();
    rottenTabs.forEach((t) => {
      closeRealChromeTab(t.id);
    });
    setTabs((prev) => prev.filter((t) => t.stage !== 'rotten' && t.stage !== 'fossilized'));
  };

  return (
    <div className="w-[380px] bg-[#E6DFD5] text-[#1B2A26] font-mono p-4 space-y-3 border-2 border-[#1B2A26] select-none">
      {/* Mini Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1B2A26]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#1B2A26]" />
          <span className="text-xs font-black tracking-wider uppercase">TABROT HUD</span>
        </div>
        <button
          onClick={() => {
            soundEngine.playClick();
            openFullDashboard();
          }}
          className="text-[10px] font-bold text-[#1B2A26] flex items-center gap-1 hover:underline uppercase bg-[#DDD5C7] px-2 py-0.5 border border-[#1B2A26]"
          title="Open Full Terrarium"
        >
          <Maximize2 className="w-3 h-3" />
          FULL EXPAND
        </button>
      </div>

      {/* Mini Ecosystem Rot HUD */}
      <div className="border border-[#1B2A26] bg-[#DDD5C7] p-2.5 shadow-[2px_2px_0px_#1B2A26]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-1">
          <span>AVERAGE ROT</span>
          <span>{stats.overallRotPercentage}% ({tabs.length} TABS)</span>
        </div>
        <div className="w-full h-2 border border-[#1B2A26] bg-[#C9BFB0] p-[1px]">
          <div
            className="h-full bg-[#A67C2E] transition-all duration-300"
            style={{ width: `${stats.overallRotPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#536059] mt-1 font-semibold">
          <span>RAM: ~{stats.totalRamUsedMb} MB</span>
          <span>ROTTEN: {stats.rottenCount + stats.fossilizedCount}</span>
        </div>
      </div>

      {/* Quick Rotten Triage List (Top 3) */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-[#536059] uppercase tracking-wider">
          CRITICAL DECAY ({rottenTabs.length})
        </div>

        {rottenTabs.length === 0 ? (
          <div className="p-3 border border-dashed border-[#1B2A26]/30 text-center text-[10px] text-[#536059] bg-[#DDD5C7]/50">
            NO ROTTEN TABS. ALL SPECIMENS ARE FRESH! 🌿
          </div>
        ) : (
          rottenTabs.slice(0, 3).map((tab) => (
            <div
              key={tab.id}
              className="p-2 border border-[#1B2A26] bg-[#DDD5C7] flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0px_#1B2A26]"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#1B2A26] truncate">
                  {tab.title}
                </div>
                <div className="text-[9px] text-[#B53F28] font-bold uppercase">
                  {tab.stage} • {tab.rotScore}% ROT
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleWater(tab.id)}
                  title="Water tab"
                  className="p-1 border border-[#1B2A26] bg-[#E6DFD5] hover:bg-[#2E4B37]/15 text-[#2E4B37]"
                >
                  <Droplet className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleCremate(tab.id)}
                  title="Cremate & close tab"
                  className="p-1 border border-[#1B2A26] bg-[#B53F28]/15 hover:bg-[#B53F28]/30 text-[#B53F28]"
                >
                  <Flame className="w-3 h-3" />
                </button>
                <button
                  onClick={() => focusRealChromeTab(tab.id)}
                  title="Focus tab"
                  className="p-1 border border-[#1B2A26] bg-[#E6DFD5] hover:bg-[#1B2A26]/10 text-[#1B2A26]"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1B2A26]/20">
        <button
          onClick={handleMassCremate}
          disabled={rottenTabs.length === 0}
          className="py-1.5 px-2 bg-[#B53F28] disabled:opacity-40 text-[#E6DFD5] border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1"
        >
          <Flame className="w-3 h-3" />
          CREMATE ALL ({rottenTabs.length})
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            openFullDashboard();
          }}
          className="py-1.5 px-2 bg-[#1B2A26] text-[#E6DFD5] border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 hover:bg-[#2A3F39]"
        >
          <Maximize2 className="w-3 h-3" />
          FULL DASHBOARD
        </button>
      </div>
    </div>
  );
}

export default Popup;
