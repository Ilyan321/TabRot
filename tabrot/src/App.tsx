import { useState, useEffect } from 'react';
import type { TabSpecimen, CrematedTab } from './types';
import { fetchRealChromeTabs, closeRealChromeTab, focusRealChromeTab } from './engine/chromeTabs';
import {
  getMockSpecimens,
  calculateDecay,
  waterTab,
  cremateTab,
  calculateTerrariumStats,
} from './engine/decayEngine';
import { soundEngine } from './engine/soundEngine';
import { fetchGroqRoast } from './engine/roastEngine';
import { SpecimenCard } from './components/SpecimenCard';
import { Graveyard } from './components/Graveyard';
import {
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Layers,
} from 'lucide-react';

export function App() {
  const [tabs, setTabs] = useState<TabSpecimen[]>([]);
  const [graveyard, setGraveyard] = useState<CrematedTab[]>([]);
  const [activeTab, setActiveTab] = useState<'terrarium' | 'graveyard'>('terrarium');
  const [filter, setFilter] = useState<'all' | 'fresh' | 'stale' | 'rotten' | 'fossilized'>('all');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRoasting, setIsRoasting] = useState<boolean>(false);

  // Initialize data from Chrome Extension or localStorage or mock specimens
  useEffect(() => {
    soundEngine.unlockAudio();
    setIsMuted(soundEngine.getMuted());

    const initTabs = async () => {
      const real = await fetchRealChromeTabs();
      if (real && real.length > 0) {
        setTabs(real);
        return;
      }

      const savedTabs = localStorage.getItem('tabrot_tabs');
      if (savedTabs) {
        try {
          const parsed = JSON.parse(savedTabs);
          setTabs(parsed.map((t: TabSpecimen) => calculateDecay(t)));
        } catch {
          setTabs(getMockSpecimens());
        }
      } else {
        setTabs(getMockSpecimens());
      }
    };

    initTabs();

    const savedGraveyard = localStorage.getItem('tabrot_graveyard');
    if (savedGraveyard) {
      try {
        setGraveyard(JSON.parse(savedGraveyard));
      } catch {
        setGraveyard([]);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('tabrot_tabs', JSON.stringify(tabs));
    }
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('tabrot_graveyard', JSON.stringify(graveyard));
  }, [graveyard]);

  // Periodic recalculation of rot score every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTabs((prev) => prev.map((t) => calculateDecay(t)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = calculateTerrariumStats(tabs, graveyard);

  const handleWater = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? waterTab(t) : t))
    );
  };

  const handleWaterAll = () => {
    soundEngine.playWater();
    setTabs((prev) => prev.map((t) => waterTab(t)));
  };

  const handleCremate = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;

    closeRealChromeTab(id);
    const dead = cremateTab(target, target.roast || '');
    setGraveyard((prev) => [dead, ...prev]);
    setTabs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCremateRotten = () => {
    soundEngine.playCremate();
    const rottenOnes = tabs.filter(
      (t) => (t.stage === 'rotten' || t.stage === 'fossilized') && !t.pinned
    );
    rottenOnes.forEach((t) => closeRealChromeTab(t.id));
    const newGraves = rottenOnes.map((t) => cremateTab(t, t.roast || ''));

    setGraveyard((prev) => [...newGraves, ...prev]);
    setTabs((prev) =>
      prev.filter((t) => (t.stage !== 'rotten' && t.stage !== 'fossilized') || t.pinned)
    );
  };

  const handleTogglePin = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const handleFocus = (tab: TabSpecimen) => {
    soundEngine.playClick();
    focusRealChromeTab(tab.id, tab.url);
  };

  const handleRevive = (tomb: CrematedTab) => {
    const revived: TabSpecimen = {
      id: tomb.id,
      url: tomb.url,
      title: tomb.title,
      createdAt: Date.now(),
      lastInteractedAt: Date.now(),
      stage: 'fresh',
      rotScore: 0,
      ramEstimateMb: 95,
      pinned: false,
    };
    setTabs((prev) => [revived, ...prev]);
    setGraveyard((prev) => prev.filter((g) => g.id !== tomb.id));
  };

  const handleResetToMock = () => {
    soundEngine.playClick();
    const freshMocks = getMockSpecimens();
    setTabs(freshMocks);
    localStorage.setItem('tabrot_tabs', JSON.stringify(freshMocks));
  };

  const handleGenerateRoasts = async () => {
    soundEngine.playRoastBlip();
    setIsRoasting(true);

    const updated = await Promise.all(
      tabs.map(async (t) => {
        const ageHours = (Date.now() - t.lastInteractedAt) / (1000 * 60 * 60);
        const roast = await fetchGroqRoast(t.title, t.url, ageHours);
        return { ...t, roast };
      })
    );

    setTabs(updated);
    setIsRoasting(false);
  };

  const filteredTabs = tabs
    .filter((t) => {
      if (filter === 'all') return true;
      return t.stage === filter;
    })
    .sort((a, b) => {
      // 1. Pinned tabs always stay locked at the 1st position
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // 2. Highest decay / rot first
      if (b.rotScore !== a.rotScore) {
        return b.rotScore - a.rotScore;
      }

      // 3. Oldest last interacted first
      return a.lastInteractedAt - b.lastInteractedAt;
    });

  return (
    <div className="min-h-screen text-[#1B2A26] flex flex-col font-mono selection:bg-[#2E4B37] selection:text-[#E6DFD5]">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 flex-1 flex flex-col space-y-6">
        
        {/* HEADER BAR: Editorial Title & Controls */}
        <header className="border-b-2 border-[#1B2A26] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase flex items-center gap-2">
              TABROT <span className="text-lg font-normal text-[#536059] lowercase">/terrarium</span>
            </h1>
            <p className="text-xs text-[#536059] mt-1 max-w-xl font-medium">
              A living digital terrarium where neglected tabs rot in real time, beg for CPR, or get cremated into a searchable graveyard.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const muted = soundEngine.toggleMute();
                setIsMuted(muted);
              }}
              title={isMuted ? 'Unmute Audio Context' : 'Mute Sound Effects'}
              className="brutalist-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#B53F28]" /> : <Volume2 className="w-4 h-4 text-[#2E4B37]" />}
              {isMuted ? 'MUTED' : 'AUDIO ON'}
            </button>

            <button
              onClick={handleResetToMock}
              title="Reset with 12 messy tabs"
              className="brutalist-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              SIMULATE BRAIN
            </button>
          </div>
        </header>

        {/* ECOSYSTEM DIAGNOSTICS: Compact Precision Field Notebook HUD */}
        <section className="border-2 border-[#1B2A26] bg-[#DDD5C7] p-3.5 sm:p-4 shadow-[3px_3px_0px_#1B2A26] space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1B2A26]">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1B2A26]">
              <Layers className="w-3.5 h-3.5 text-[#1B2A26]" />
              ECOSYSTEM DIAGNOSTICS
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-[#E6DFD5] bg-[#1B2A26] uppercase">
              LIVE
            </span>
          </div>

          {/* Average Ecosystem Rot Bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase mb-1 text-[#1B2A26]">
              <span>AVERAGE ECOSYSTEM ROT</span>
              <span>{stats.overallRotPercentage}%</span>
            </div>
            <div className="w-full h-2 border border-[#1B2A26] bg-[#C9BFB0] p-[1px]">
              <div
                className="h-full bg-[#A67C2E] transition-all duration-300"
                style={{ width: `${stats.overallRotPercentage}%` }}
              />
            </div>
          </div>

          {/* Two Metric Boxes: Active RAM & Freed RAM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="border border-[#1B2A26] bg-[#E6DFD5] p-2 sm:p-2.5 shadow-[1.5px_1.5px_0px_#1B2A26]">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#536059] mb-0.5">
                <span className="text-[#B53F28]">⚙</span> ACTIVE RAM USAGE
              </div>
              <div className="text-xl font-black font-mono text-[#1B2A26] leading-tight">
                {stats.totalRamUsedMb} <span className="text-[10px] font-normal text-[#536059]">MB</span>
              </div>
            </div>

            <div className="border border-[#1B2A26] bg-[#E6DFD5] p-2 sm:p-2.5 shadow-[1.5px_1.5px_0px_#1B2A26]">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#536059] mb-0.5">
                <span className="text-[#2E4B37]">🗄</span> FREED RAM (GRAVEYARD)
              </div>
              <div className="text-xl font-black font-mono text-[#1B2A26] leading-tight">
                {stats.totalRamFreedMb} <span className="text-[10px] font-normal text-[#536059]">MB</span>
              </div>
            </div>
          </div>

          {/* Stage Distribution List */}
          <div className="border border-[#1B2A26] bg-[#E6DFD5] p-2.5 sm:p-3 shadow-[1.5px_1.5px_0px_#1B2A26] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#536059] mb-1 tracking-wide">
              STAGE DISTRIBUTION
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono font-bold text-[#1B2A26]">
              <div className="flex items-center justify-between p-1 bg-[#DDD5C7]/50 border border-[#1B2A26]/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#2E4B37] inline-block"></span>
                  FRESH (&lt;4h)
                </span>
                <span>{stats.freshCount}</span>
              </div>

              <div className="flex items-center justify-between p-1 bg-[#DDD5C7]/50 border border-[#1B2A26]/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#A67C2E] inline-block"></span>
                  STALE (4-24h)
                </span>
                <span>{stats.staleCount}</span>
              </div>

              <div className="flex items-center justify-between p-1 bg-[#DDD5C7]/50 border border-[#1B2A26]/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#B53F28] inline-block"></span>
                  ROTTEN (24-72h)
                </span>
                <span>{stats.rottenCount}</span>
              </div>

              <div className="flex items-center justify-between p-1 bg-[#DDD5C7]/50 border border-[#1B2A26]/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#6B6560] inline-block"></span>
                  FOSSIL (&gt;72h)
                </span>
                <span>{stats.fossilizedCount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Water All & Mass Cremate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleWaterAll}
              className="py-1.5 px-3 bg-[#E6DFD5] text-[#1B2A26] border-1.5 border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1B2A26] font-mono text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-[#D4CBBC] transition-colors"
            >
              <span className="text-[#2E4B37]">💧</span>
              WATER ALL TABS
            </button>
            <button
              onClick={handleCremateRotten}
              className="py-1.5 px-3 bg-[#B53F28] text-[#E6DFD5] border-1.5 border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1B2A26] font-mono text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-[#9E3520] transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-[#E6DFD5]" />
              MASS CREMATE ROTTEN ({stats.rottenCount + stats.fossilizedCount})
            </button>
          </div>
        </section>

        {/* NAVIGATION & FILTER TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B2A26] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('terrarium');
              }}
              style={{
                backgroundColor: activeTab === 'terrarium' ? '#1B2A26' : '#DDD5C7',
                color: activeTab === 'terrarium' ? '#E6DFD5' : '#1B2A26',
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] flex items-center gap-1.5 transition-all hover:bg-[#C9BFB0]"
            >
              <Layers className="w-3.5 h-3.5" />
              LIVING TERRARIUM ({tabs.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('graveyard');
              }}
              style={{
                backgroundColor: activeTab === 'graveyard' ? '#1B2A26' : '#DDD5C7',
                color: activeTab === 'graveyard' ? '#E6DFD5' : '#1B2A26',
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] flex items-center gap-1.5 transition-all hover:bg-[#C9BFB0]"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              CEMETERY ARCHIVE ({graveyard.length})
            </button>
          </div>

          {activeTab === 'terrarium' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[#536059] uppercase font-bold">FILTER:</span>
              {(['all', 'fresh', 'stale', 'rotten', 'fossilized'] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    soundEngine.playClick();
                    setFilter(stage);
                  }}
                  className={`text-[11px] font-mono uppercase px-2 py-0.5 border font-semibold transition-colors ${
                    filter === stage
                      ? 'border-[#1B2A26] bg-[#1B2A26] text-[#E6DFD5]'
                      : 'border-[#1B2A26]/40 bg-[#DDD5C7] text-[#1B2A26] hover:border-[#1B2A26]'
                  }`}
                >
                  {stage}
                </button>
              ))}

              <button
                onClick={handleGenerateRoasts}
                disabled={isRoasting}
                className="brutalist-btn px-2.5 py-1 text-xs flex items-center gap-1 text-[#2E4B37] ml-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isRoasting ? 'ROASTING...' : 'AI DIAGNOSE'}
              </button>
            </div>
          )}
        </div>

        {/* MAIN VIEW AREA */}
        <main className="flex-1">
          {activeTab === 'terrarium' ? (
            <div>
              {filteredTabs.length === 0 ? (
                <div className="p-12 border border-dashed border-[#1B2A26]/40 text-center font-mono text-sm text-[#5E6963] bg-[#F8F5F0]">
                  NO SPECIMENS MATCHING FILTER "{filter.toUpperCase()}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTabs.map((tab) => (
                    <SpecimenCard
                      key={tab.id}
                      tab={tab}
                      onWater={handleWater}
                      onCremate={handleCremate}
                      onFocus={handleFocus}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Graveyard
              graveyard={graveyard}
              onRevive={handleRevive}
              onClearGraveyard={() => setGraveyard([])}
            />
          )}
        </main>

        {/* FOOTER: Fixed to bottom of viewport layout */}
        <footer className="pt-6 border-t border-[#1B2A26]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5E6963] gap-2 mt-auto">
          <div>
            IDEA LAB HACKS 2026 PROTOTYPE • BUILT BY ILYAN KHAN
          </div>
          <div>
            ZERO AUDIO ASSETS (NATIVE WEB AUDIO SYNTH) • ANTI-SLOP DESIGN PROTOCOL
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
