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
  Droplet,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Key,
  RefreshCw,
  FolderArchive,
  Layers,
} from 'lucide-react';

export function App() {
  const [tabs, setTabs] = useState<TabSpecimen[]>([]);
  const [graveyard, setGraveyard] = useState<CrematedTab[]>([]);
  const [activeTab, setActiveTab] = useState<'terrarium' | 'graveyard'>('terrarium');
  const [filter, setFilter] = useState<'all' | 'fresh' | 'stale' | 'rotten' | 'fossilized'>('all');
  const [groqKey, setGroqKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRoasting, setIsRoasting] = useState<boolean>(false);

  // Initialize data from localStorage or mock specimens
  useEffect(() => {
    soundEngine.unlockAudio();
    setIsMuted(soundEngine.getMuted());

    const savedTabs = localStorage.getItem('tabrot_tabs');
    const savedGraveyard = localStorage.getItem('tabrot_graveyard');
    const savedKey = localStorage.getItem('tabrot_groq_key');

    if (savedKey) setGroqKey(savedKey);

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
        const roast = await fetchGroqRoast(t.title, t.url, ageHours, groqKey);
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
    <div className="min-h-screen bg-[#F4EFEA] text-[#1B2A26] p-4 sm:p-6 lg:p-10 font-mono selection:bg-[#3D5A45] selection:text-[#F4EFEA]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER BAR: Editorial Title & Controls */}
        <header className="border-b-2 border-[#1B2A26] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#3D5A45] bg-[#3D5A45]/10 px-2 py-0.5 border border-[#3D5A45]/30">
                FIELD SPECIMEN CATALOG • v1.0
              </span>
              <span className="text-[11px] text-[#5E6963]">
                {tabs.length} SPECIMENS MONITORED
              </span>
            </div>
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
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="brutalist-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5"
            >
              <Key className="w-4 h-4 text-[#BFA054]" />
              GROQ AI {groqKey ? '✓' : 'KEY'}
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

        {/* API KEY DRAWER */}
        {showKeyInput && (
          <div className="p-4 border border-[#1B2A26] bg-[#ECE6DF] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="text-xs">
              <span className="font-bold">Groq API Key (Llama 3.3 70B / Qwen 27B):</span>
              <p className="text-[#5E6963] text-[11px]">Key is pre-wired from your active session. You can enter an override here.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => {
                  setGroqKey(e.target.value);
                  localStorage.setItem('tabrot_groq_key', e.target.value);
                }}
                className="px-2 py-1 text-xs border border-[#1B2A26] bg-[#F4EFEA] font-mono focus:outline-none w-full sm:w-64"
              />
              <button
                onClick={() => setShowKeyInput(false)}
                className="brutalist-btn px-3 py-1 text-xs"
              >
                DONE
              </button>
            </div>
          </div>
        )}

        {/* STATS HUD: High-Density Monospace Dashboard */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 border border-[#1B2A26] bg-[#F8F5F0]">
            <div className="text-[10px] text-[#5E6963] uppercase font-semibold">TOTAL DECAY RATE</div>
            <div className="text-2xl font-bold mt-1 flex items-baseline gap-2">
              {stats.overallRotPercentage}%
              <span className="text-[11px] font-normal text-[#5E6963]">
                {stats.overallRotPercentage > 60 ? 'CRITICAL MOLD' : stats.overallRotPercentage > 30 ? 'ELEVATED' : 'NOMINAL'}
              </span>
            </div>
            <div className="w-full bg-[#1B2A26]/10 h-1 mt-2">
              <div
                className="bg-[#C84B31] h-1"
                style={{ width: `${stats.overallRotPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 border border-[#1B2A26] bg-[#F8F5F0]">
            <div className="text-[10px] text-[#5E6963] uppercase font-semibold">RAM ESTIMATE</div>
            <div className="text-2xl font-bold mt-1">
              ~{stats.totalRamUsedMb} <span className="text-xs font-normal text-[#5E6963]">MB ACTIVE</span>
            </div>
            <div className="text-[11px] text-[#3D5A45] mt-1 font-semibold">
              +{stats.totalRamFreedMb} MB PREVENTED
            </div>
          </div>

          <div className="p-3 border border-[#1B2A26] bg-[#F8F5F0]">
            <div className="text-[10px] text-[#5E6963] uppercase font-semibold">SPECIMEN HEALTH</div>
            <div className="text-xs mt-2 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#3D5A45]">Fresh:</span>
                <span>{stats.freshCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A7129]">Stale:</span>
                <span>{stats.staleCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C84B31]">Rotten / Fossil:</span>
                <span>{stats.rottenCount + stats.fossilizedCount}</span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[#1B2A26] bg-[#F8F5F0] flex flex-col justify-between">
            <div className="text-[10px] text-[#5E6963] uppercase font-semibold">GLOBAL SANCTIONS</div>
            <div className="flex flex-col gap-1.5 mt-2">
              <button
                onClick={handleWaterAll}
                className="brutalist-btn py-1 px-2 text-[10px] flex items-center justify-center gap-1 text-[#3D5A45]"
              >
                <Droplet className="w-3 h-3" />
                WATER ALL TABS
              </button>
              <button
                onClick={handleCremateRotten}
                className="brutalist-btn py-1 px-2 text-[10px] flex items-center justify-center gap-1 text-[#C84B31] border-[#C84B31] bg-[#C84B31]/10"
              >
                <Flame className="w-3 h-3" />
                PURGE ROTTEN ({stats.rottenCount + stats.fossilizedCount})
              </button>
            </div>
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
              className={`brutalist-btn px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'terrarium' ? 'bg-[#1B2A26] text-[#F4EFEA]' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              LIVING TERRARIUM ({tabs.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('graveyard');
              }}
              className={`brutalist-btn px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                activeTab === 'graveyard' ? 'bg-[#1B2A26] text-[#F4EFEA]' : ''
              }`}
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
                  className={`text-[11px] font-mono uppercase px-2 py-0.5 border ${
                    filter === stage
                      ? 'border-[#1B2A26] bg-[#1B2A26] text-[#F4EFEA]'
                      : 'border-[#1B2A26]/30 hover:border-[#1B2A26]'
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
        {activeTab === 'terrarium' ? (
          <div>
            {filteredTabs.length === 0 ? (
              <div className="p-12 border border-dashed border-[#1B2A26]/40 text-center font-mono text-sm text-[#5E6963]">
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

        {/* FOOTER: Editorial Hackathon Attributions */}
        <footer className="pt-6 border-t border-[#1B2A26]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5E6963] gap-2">
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
