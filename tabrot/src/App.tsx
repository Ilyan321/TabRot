import { useState, useEffect } from 'react';
import type { TabSpecimen, CrematedTab } from './types';
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

  // Initialize data from localStorage or mock specimens
  useEffect(() => {
    soundEngine.unlockAudio();
    setIsMuted(soundEngine.getMuted());

    const savedTabs = localStorage.getItem('tabrot_tabs');
    const savedGraveyard = localStorage.getItem('tabrot_graveyard');

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

    const dead = cremateTab(target, target.roast || '');
    setGraveyard((prev) => [dead, ...prev]);
    setTabs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCremateRotten = () => {
    soundEngine.playCremate();
    const rottenOnes = tabs.filter(
      (t) => (t.stage === 'rotten' || t.stage === 'fossilized') && !t.pinned
    );
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
    window.open(tab.url, '_blank');
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

  const filteredTabs = tabs.filter((t) => {
    if (filter === 'all') return true;
    return t.stage === filter;
  });

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#1B2A26] flex flex-col font-mono selection:bg-[#3D5A45] selection:text-[#F4EFEA]">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 flex-1 flex flex-col space-y-6">
        
        {/* HEADER BAR: Editorial Title & Controls */}
        <header className="border-b-2 border-[#1B2A26] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase flex items-center gap-2">
              TABROT <span className="text-lg font-normal text-[#5E6963] lowercase">/terrarium</span>
            </h1>
            <p className="text-xs text-[#5E6963] mt-1 max-w-xl">
              An interactive digital terrarium where neglected browser tabs visibly decay, accumulate biological debt, and face sarcastic judgement.
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
              {isMuted ? <VolumeX className="w-4 h-4 text-[#C84B31]" /> : <Volume2 className="w-4 h-4 text-[#3D5A45]" />}
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

        {/* ECOSYSTEM DIAGNOSTICS: Precision Neobrutalist Field Notebook HUD */}
        <section className="border-2 border-[#1B2A26] bg-[#F4EFEA] p-5 shadow-[4px_4px_0px_#1B2A26] space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2A26]">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#1B2A26]">
              <Layers className="w-4 h-4 text-[#1B2A26]" />
              ECOSYSTEM DIAGNOSTICS
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-[#F4EFEA] bg-[#1B2A26] uppercase">
              LIVE
            </span>
          </div>

          {/* Average Ecosystem Rot Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono font-bold uppercase mb-1.5 text-[#1B2A26]">
              <span>AVERAGE ECOSYSTEM ROT</span>
              <span>{stats.overallRotPercentage}%</span>
            </div>
            <div className="w-full h-3 border border-[#1B2A26] bg-[#EAE5DE] p-0.5">
              <div
                className="h-full bg-[#BFA054] transition-all duration-300"
                style={{ width: `${stats.overallRotPercentage}%` }}
              />
            </div>
          </div>

          {/* Two Metric Boxes: Active RAM & Freed RAM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#1B2A26] bg-[#F4EFEA] p-3 shadow-[2px_2px_0px_#1B2A26]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#5E6963] mb-1">
                <span className="text-[#C84B31]">⚙</span> ACTIVE RAM USAGE
              </div>
              <div className="text-2xl font-black font-mono text-[#1B2A26]">
                {stats.totalRamUsedMb} <span className="text-xs font-normal text-[#5E6963]">MB</span>
              </div>
            </div>

            <div className="border border-[#1B2A26] bg-[#F4EFEA] p-3 shadow-[2px_2px_0px_#1B2A26]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#5E6963] mb-1">
                <span className="text-[#3D5A45]">🗄</span> FREED RAM (GRAVEYARD)
              </div>
              <div className="text-2xl font-black font-mono text-[#1B2A26]">
                {stats.totalRamFreedMb} <span className="text-xs font-normal text-[#5E6963]">MB</span>
              </div>
            </div>
          </div>

          {/* Stage Distribution List */}
          <div className="border border-[#1B2A26] bg-[#F4EFEA] p-4 shadow-[2px_2px_0px_#1B2A26] space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase text-[#5E6963] mb-2 tracking-wide">
              STAGE DISTRIBUTION
            </div>
            
            <div className="flex justify-between items-center text-xs font-mono font-bold text-[#1B2A26]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#3D5A45] inline-block"></span>
                FRESH (&lt;4h)
              </span>
              <span>{stats.freshCount}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono font-bold text-[#1B2A26]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#BFA054] inline-block"></span>
                STALE (4-24h)
              </span>
              <span>{stats.staleCount}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono font-bold text-[#1B2A26]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#C84B31] inline-block"></span>
                ROTTEN (24-72h)
              </span>
              <span>{stats.rottenCount}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono font-bold text-[#1B2A26]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#7A7571] inline-block"></span>
                FOSSILIZED (&gt;72h)
              </span>
              <span>{stats.fossilizedCount}</span>
            </div>
          </div>

          {/* Action Buttons: Water All & Mass Cremate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleWaterAll}
              className="py-2.5 px-4 bg-[#F4EFEA] text-[#1B2A26] border-2 border-[#1B2A26] shadow-[3px_3px_0px_#1B2A26] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1B2A26] font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#EAE5DE] transition-colors"
            >
              <span className="text-[#3D5A45]">💧</span>
              WATER ALL TABS
            </button>
            <button
              onClick={handleCremateRotten}
              className="py-2.5 px-4 bg-[#C84B31] text-[#F4EFEA] border-2 border-[#1B2A26] shadow-[3px_3px_0px_#1B2A26] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1B2A26] font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#B33E26] transition-colors"
            >
              <Flame className="w-4 h-4 text-[#F4EFEA]" />
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
                backgroundColor: activeTab === 'terrarium' ? '#1B2A26' : '#F4EFEA',
                color: activeTab === 'terrarium' ? '#F4EFEA' : '#1B2A26',
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] flex items-center gap-1.5 transition-all"
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
                backgroundColor: activeTab === 'graveyard' ? '#1B2A26' : '#F4EFEA',
                color: activeTab === 'graveyard' ? '#F4EFEA' : '#1B2A26',
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] flex items-center gap-1.5 transition-all"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              CEMETERY ARCHIVE ({graveyard.length})
            </button>
          </div>

          {activeTab === 'terrarium' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[#5E6963] uppercase">FILTER:</span>
              {(['all', 'fresh', 'stale', 'rotten', 'fossilized'] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    soundEngine.playClick();
                    setFilter(stage);
                  }}
                  className={`text-[11px] font-mono uppercase px-2 py-0.5 border transition-colors ${
                    filter === stage
                      ? 'border-[#1B2A26] bg-[#1B2A26] text-[#F4EFEA]'
                      : 'border-[#1B2A26]/30 bg-[#F4EFEA] text-[#1B2A26] hover:border-[#1B2A26]'
                  }`}
                >
                  {stage}
                </button>
              ))}

              <button
                onClick={handleGenerateRoasts}
                disabled={isRoasting}
                className="brutalist-btn px-2.5 py-1 text-xs flex items-center gap-1 text-[#3D5A45] ml-2"
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
