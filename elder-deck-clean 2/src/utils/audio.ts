export interface MusicTrack {
  id: string;
  title: string;
  genre: "Medieval Core" | "Tavern Core" | "Bard Core" | "Lore & Legend" | "Sanctuary";
  url: string;
  description: string;
  icon: string;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: "minstrel_guild",
    title: "Minstrel Guild (Medieval Lute Drone)",
    genre: "Medieval Core",
    url: "",
    description: "Authentic castle courtyard sound with continuous resonant drones, lutes, and recorders",
    icon: "🏰"
  },
  {
    id: "fiddles_mcginty",
    title: "Greensleeves (Tavern Folk Drone)",
    genre: "Tavern Core",
    url: "",
    description: "Traditional English folk drone performance suited for rowdy tavern gatherings",
    icon: "🍺"
  },
  {
    id: "pippin_hunchback",
    title: "Renaissance Branle (Bard Drone)",
    genre: "Bard Core",
    url: "",
    description: "Charming historical dance melodies performed on authentic acoustic drone lutes",
    icon: "🪕"
  },
  {
    id: "teller_tales",
    title: "English Lute Ayre (Lore Drone)",
    genre: "Lore & Legend",
    url: "",
    description: "Melancholic and soaring high-fantasy drone ayres evoking ancient libraries",
    icon: "📜"
  },
  {
    id: "town_hall",
    title: "Sanctuary Echoes (Ambient Drone)",
    genre: "Sanctuary",
    url: "",
    description: "Atmospheric court and courtyard acoustics with resonant strings and ambient hall reverb",
    icon: "🕯️"
  }
];

// Web Audio API Synthesizer for Skyrim-like Medieval RPG SFX & Fantasy/Horror Library
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying: boolean = false;
  private musicAudio: HTMLAudioElement | null = null;
  private currentTrackId: string = "minstrel_guild";
  private musicVolume: number = 0.22;
  private proceduralInterval: any = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  // Spatial Audio Atmospheric Engine State
  private isSpatialAudioOn: boolean = false;
  private masterSpatialVolume: number = 0.6;
  private fireplaceVolume: number = 0.75;
  private windVolume: number = 0.65;
  private chantVolume: number = 0.55;

  // Spatial Audio Audio Nodes & Timers
  private spatialMasterGain: GainNode | null = null;
  
  // Fireplace Channel (Left / Hearth)
  private fireplaceRoarGain: GainNode | null = null;
  private fireplacePanner: StereoPannerNode | null = null;
  private fireplaceCrackleInterval: any = null;

  // Mountain Winds Channel (Swirling Orbit)
  private windGainNode: GainNode | null = null;
  private windFilterNode: BiquadFilterNode | null = null;
  private windPannerNode: StereoPannerNode | null = null;
  private windLfoTimer: any = null;
  private windAngle: number = 0;

  // Ancient Runic Chanting Channel (Right / Shrine)
  private chantGainNode: GainNode | null = null;
  private chantPannerNode: StereoPannerNode | null = null;
  private chantOscs: OscillatorNode[] = [];
  private chantLfoTimer: any = null;

  init() {
    if (!this.ctx) {
      // Create audio context supporting both standard and legacy browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // --- SPATIAL AUDIO CONTROLS & API ---
  getSpatialAudioState() {
    return {
      isSpatialAudioOn: this.isSpatialAudioOn,
      masterSpatialVolume: this.masterSpatialVolume,
      fireplaceVolume: this.fireplaceVolume,
      windVolume: this.windVolume,
      chantVolume: this.chantVolume
    };
  }

  toggleSpatialAudio(enable?: boolean): boolean {
    this.init();
    this.isSpatialAudioOn = enable !== undefined ? enable : !this.isSpatialAudioOn;
    
    if (this.isSpatialAudioOn) {
      this.startSpatialAtmosphere();
    } else {
      this.stopSpatialAtmosphere();
    }
    return this.isSpatialAudioOn;
  }

  setSpatialVolumes(volumes: { master?: number; fireplace?: number; wind?: number; chant?: number }) {
    if (volumes.master !== undefined) this.masterSpatialVolume = Math.max(0, Math.min(1, volumes.master));
    if (volumes.fireplace !== undefined) this.fireplaceVolume = Math.max(0, Math.min(1, volumes.fireplace));
    if (volumes.wind !== undefined) this.windVolume = Math.max(0, Math.min(1, volumes.wind));
    if (volumes.chant !== undefined) this.chantVolume = Math.max(0, Math.min(1, volumes.chant));

    this.updateSpatialGainNodes();
  }

  applySpatialPreset(preset: "hearthside" | "mountain_peak" | "runic_shrine" | "full_immersion") {
    switch (preset) {
      case "hearthside":
        this.setSpatialVolumes({ fireplace: 1.0, wind: 0.25, chant: 0.3 });
        break;
      case "mountain_peak":
        this.setSpatialVolumes({ fireplace: 0.2, wind: 1.0, chant: 0.4 });
        break;
      case "runic_shrine":
        this.setSpatialVolumes({ fireplace: 0.3, wind: 0.3, chant: 1.0 });
        break;
      case "full_immersion":
      default:
        this.setSpatialVolumes({ fireplace: 0.8, wind: 0.7, chant: 0.6 });
        break;
    }
  }

  private updateSpatialGainNodes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    if (this.spatialMasterGain) {
      this.spatialMasterGain.gain.linearRampToValueAtTime(this.isSpatialAudioOn ? this.masterSpatialVolume : 0, now + 0.1);
    }
    if (this.fireplaceRoarGain) {
      this.fireplaceRoarGain.gain.linearRampToValueAtTime(this.fireplaceVolume * 0.15, now + 0.1);
    }
    if (this.windGainNode) {
      this.windGainNode.gain.linearRampToValueAtTime(this.windVolume * 0.12, now + 0.1);
    }
    if (this.chantGainNode) {
      this.chantGainNode.gain.linearRampToValueAtTime(this.chantVolume * 0.10, now + 0.1);
    }
  }

  // --- START SPATIAL ATMOSPHERE (Tavern Fireplace, Mountain Winds, Ancient Chanting) ---
  private startSpatialAtmosphere() {
    if (!this.ctx) return;
    this.stopSpatialAtmosphere(); // Clean reset
    
    const now = this.ctx.currentTime;

    // 1. Spatial Master Gain Node
    this.spatialMasterGain = this.ctx.createGain();
    this.spatialMasterGain.gain.setValueAtTime(0, now);
    this.spatialMasterGain.gain.linearRampToValueAtTime(this.masterSpatialVolume, now + 1.5);
    this.spatialMasterGain.connect(this.ctx.destination);

    // ==========================================
    // CHANNEL A: CRACKLING TAVERN FIREPLACE (LEFT HEARTH, Pan = -0.5)
    // ==========================================
    try {
      this.fireplaceRoarGain = this.ctx.createGain();
      this.fireplaceRoarGain.gain.setValueAtTime(0, now);
      this.fireplaceRoarGain.gain.linearRampToValueAtTime(this.fireplaceVolume * 0.15, now + 1.2);

      // Stereo Panner Node for Fireplace (Left Channel -0.5)
      if (typeof this.ctx.createStereoPanner === "function") {
        this.fireplacePanner = this.ctx.createStereoPanner();
        this.fireplacePanner.pan.setValueAtTime(-0.5, now);
      }

      // Fireplace Low-frequency Roar Noise Generator
      const noiseBufferSize = this.ctx.sampleRate * 2;
      const roarBuffer = this.ctx.createBuffer(1, noiseBufferSize, this.ctx.sampleRate);
      const roarData = roarBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < noiseBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        roarData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        roarData[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const roarSource = this.ctx.createBufferSource();
      roarSource.buffer = roarBuffer;
      roarSource.loop = true;

      const roarFilter = this.ctx.createBiquadFilter();
      roarFilter.type = "lowpass";
      roarFilter.frequency.setValueAtTime(180, now);

      roarSource.connect(roarFilter);
      roarFilter.connect(this.fireplaceRoarGain);

      if (this.fireplacePanner) {
        this.fireplaceRoarGain.connect(this.fireplacePanner);
        this.fireplacePanner.connect(this.spatialMasterGain);
      } else {
        this.fireplaceRoarGain.connect(this.spatialMasterGain);
      }

      roarSource.start(now);

      // Random Fire Crackle & Ember Pop Generator Loop
      this.fireplaceCrackleInterval = setInterval(() => {
        if (!this.isSpatialAudioOn || !this.ctx) return;
        if (Math.random() < 0.75) {
          this.triggerFireplaceCracklePop();
        }
      }, 140);
    } catch (e) {
      console.info("SpatialAudio: Fireplace channel init notice", e);
    }

    // ==========================================
    // CHANNEL B: HOWLING MOUNTAIN WINDS (SWIRLING ORBIT, Pan = -0.85 to +0.85)
    // ==========================================
    try {
      this.windGainNode = this.ctx.createGain();
      this.windGainNode.gain.setValueAtTime(0, now);
      this.windGainNode.gain.linearRampToValueAtTime(this.windVolume * 0.12, now + 2.0);

      if (typeof this.ctx.createStereoPanner === "function") {
        this.windPannerNode = this.ctx.createStereoPanner();
        this.windPannerNode.pan.setValueAtTime(-0.2, now);
      }

      // Wind Noise Buffer
      const windBufSize = this.ctx.sampleRate * 3;
      const windBuf = this.ctx.createBuffer(1, windBufSize, this.ctx.sampleRate);
      const windData = windBuf.getChannelData(0);
      for (let i = 0; i < windBufSize; i++) {
        windData[i] = Math.random() * 2 - 1;
      }

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = windBuf;
      windSource.loop = true;

      // Resonant Bandpass Filter for Wind Howl
      this.windFilterNode = this.ctx.createBiquadFilter();
      this.windFilterNode.type = "bandpass";
      this.windFilterNode.frequency.setValueAtTime(350, now);
      this.windFilterNode.Q.setValueAtTime(2.8, now);

      windSource.connect(this.windFilterNode);
      this.windFilterNode.connect(this.windGainNode);

      if (this.windPannerNode) {
        this.windGainNode.connect(this.windPannerNode);
        this.windPannerNode.connect(this.spatialMasterGain);
      } else {
        this.windGainNode.connect(this.spatialMasterGain);
      }

      windSource.start(now);

      // Wind LFO: Howling Wind Gust Sweeps and Panning Orbit
      this.windLfoTimer = setInterval(() => {
        if (!this.isSpatialAudioOn || !this.ctx || !this.windFilterNode) return;
        const tNow = this.ctx.currentTime;
        this.windAngle += 0.08;

        // Howling cutoff sweep (200 Hz to 950 Hz)
        const windFreq = 380 + Math.sin(this.windAngle) * 280 + Math.cos(this.windAngle * 0.5) * 180;
        this.windFilterNode.frequency.linearRampToValueAtTime(Math.max(120, windFreq), tNow + 0.8);

        // Orbit Panning (-0.85 to +0.85)
        if (this.windPannerNode) {
          const panVal = Math.sin(this.windAngle * 0.7) * 0.85;
          this.windPannerNode.pan.linearRampToValueAtTime(panVal, tNow + 0.8);
        }
      }, 800);
    } catch (e) {
      console.info("SpatialAudio: Wind channel init notice", e);
    }

    // ==========================================
    // CHANNEL C: ANCIENT RUNIC CHANTING (RIGHT SHRINE, Pan = +0.5)
    // ==========================================
    try {
      this.chantGainNode = this.ctx.createGain();
      this.chantGainNode.gain.setValueAtTime(0, now);
      this.chantGainNode.gain.linearRampToValueAtTime(this.chantVolume * 0.10, now + 2.5);

      if (typeof this.ctx.createStereoPanner === "function") {
        this.chantPannerNode = this.ctx.createStereoPanner();
        this.chantPannerNode.pan.setValueAtTime(0.5, now);
      }

      // Formant Chanting Harmonic Drone Frequencies (D2=73.4, A2=110, D3=146.8, F#3=185)
      const chantFreqs = [73.42, 110.00, 146.83, 185.00];
      this.chantOscs = [];

      chantFreqs.forEach((freq, idx) => {
        if (!this.ctx || !this.chantGainNode) return;
        
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // Formant Bandpass Filters (Vowel "Omm / Ah" Resonance)
        const formantFilter = this.ctx.createBiquadFilter();
        formantFilter.type = "bandpass";
        const formFreq = idx === 0 ? 320 : idx === 1 ? 750 : idx === 2 ? 1400 : 2200;
        formantFilter.frequency.setValueAtTime(formFreq, now);
        formantFilter.Q.setValueAtTime(3.5, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.18, now);

        osc.connect(formantFilter);
        formantFilter.connect(oscGain);
        oscGain.connect(this.chantGainNode);

        osc.start(now);
        this.chantOscs.push(osc);
      });

      if (this.chantPannerNode) {
        this.chantGainNode.connect(this.chantPannerNode);
        this.chantPannerNode.connect(this.spatialMasterGain);
      } else {
        this.chantGainNode.connect(this.spatialMasterGain);
      }

      // Chanting Breath & Vibrato LFO
      this.chantLfoTimer = setInterval(() => {
        if (!this.isSpatialAudioOn || !this.ctx || !this.chantGainNode) return;
        const tNow = this.ctx.currentTime;
        const breathGain = this.chantVolume * (0.07 + Math.sin(Date.now() / 1800) * 0.04);
        this.chantGainNode.gain.linearRampToValueAtTime(Math.max(0.01, breathGain), tNow + 0.9);
      }, 900);
    } catch (e) {
      console.info("SpatialAudio: Chanting channel init notice", e);
    }
  }

  private triggerFireplaceCracklePop(volumeFactor: number = 1.0, offsetPan?: number) {
    if (!this.ctx || !this.spatialMasterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sharp micro crackle impulse
      osc.type = Math.random() < 0.5 ? "sawtooth" : "triangle";
      const popFreq = 1200 + Math.random() * 2800;
      osc.frequency.setValueAtTime(popFreq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      const popVol = (0.02 + Math.random() * 0.05) * volumeFactor * this.fireplaceVolume;
      gain.gain.setValueAtTime(popVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      const popFilter = this.ctx.createBiquadFilter();
      popFilter.type = "highpass";
      popFilter.frequency.setValueAtTime(800 + Math.random() * 1200, now);

      osc.connect(popFilter);
      popFilter.connect(gain);

      if (typeof this.ctx.createStereoPanner === "function") {
        const popPanner = this.ctx.createStereoPanner();
        const pan = offsetPan !== undefined ? offsetPan : (-0.5 + (Math.random() * 0.3 - 0.15));
        popPanner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        gain.connect(popPanner);
        popPanner.connect(this.spatialMasterGain);
      } else {
        gain.connect(this.spatialMasterGain);
      }

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  private stopSpatialAtmosphere() {
    if (this.fireplaceCrackleInterval) {
      clearInterval(this.fireplaceCrackleInterval);
      this.fireplaceCrackleInterval = null;
    }
    if (this.windLfoTimer) {
      clearInterval(this.windLfoTimer);
      this.windLfoTimer = null;
    }
    if (this.chantLfoTimer) {
      clearInterval(this.chantLfoTimer);
      this.chantLfoTimer = null;
    }

    if (this.ctx && this.spatialMasterGain) {
      try {
        const now = this.ctx.currentTime;
        this.spatialMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      } catch (e) {}
    }

    setTimeout(() => {
      this.chantOscs.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.chantOscs = [];

      this.spatialMasterGain = null;
      this.fireplaceRoarGain = null;
      this.fireplacePanner = null;
      this.windGainNode = null;
      this.windFilterNode = null;
      this.windPannerNode = null;
      this.chantGainNode = null;
      this.chantPannerNode = null;
    }, 600);
  }

  // --- SPATIAL CARD ACTIONS (FLIPPING & SHUFFLING REACTIONS) ---
  triggerSpatialFlip(rarity?: "Common" | "Rare" | "Epic" | "Legendary", panX: number = 0) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Play standard mechanical/parchment flip sound with 3D Stereo Panner
    this.playFlip(rarity);

    // 2. Spatial Audio Reaction: Fireplace Ember Burst
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.triggerFireplaceCracklePop(1.8, panX + (Math.random() * 0.4 - 0.2));
      }, i * 35);
    }

    // 3. Spatial Audio Reaction: Mountain Wind Gust Sweep across panX
    if (this.windFilterNode && this.windGainNode) {
      try {
        const gustFreq = rarity === "Legendary" ? 1800 : rarity === "Epic" ? 1400 : 950;
        this.windFilterNode.frequency.cancelScheduledValues(now);
        this.windFilterNode.frequency.setValueAtTime(300, now);
        this.windFilterNode.frequency.exponentialRampToValueAtTime(gustFreq, now + 0.2);
        this.windFilterNode.frequency.exponentialRampToValueAtTime(320, now + 0.9);

        if (this.windPannerNode) {
          this.windPannerNode.pan.cancelScheduledValues(now);
          this.windPannerNode.pan.setValueAtTime(panX, now);
        }
      } catch (e) {}
    }

    // 4. Spatial Audio Reaction: Ancient Runic Chant Flare
    if (this.isSpatialAudioOn || rarity === "Legendary" || rarity === "Epic") {
      try {
        const chantRarity = rarity || "Rare";
        const freqs = chantRarity === "Legendary" ? [196, 293, 392, 587] : chantRarity === "Epic" ? [220, 329, 440, 659] : [220, 330, 440];
        
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.8);

          if (typeof this.ctx.createStereoPanner === "function") {
            const panner = this.ctx.createStereoPanner();
            panner.pan.setValueAtTime(panX, now);
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.ctx.destination);
          } else {
            osc.connect(gain);
            gain.connect(this.ctx.destination);
          }

          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 1.9);
        });
      } catch (e) {}
    }
  }

  triggerSpatialShuffle() {
    this.init();
    if (!this.ctx) return;

    // 1. Roll 12 spatial shuffle ticks sweeping stereo position from Left (-0.85) to Right (+0.85)
    const ticks = 12;
    for (let i = 0; i < ticks; i++) {
      const delay = 0.06 * i + 0.008 * Math.pow(i, 1.4);
      const pitch = 1.35 - (i / ticks) * 0.5;
      const panVal = -0.85 + (i / (ticks - 1)) * 1.7; // Left to Right spatial sweep

      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(380 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        if (typeof this.ctx.createStereoPanner === "function") {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(panVal, now);
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(this.ctx.destination);
        } else {
          osc.connect(gain);
          gain.connect(this.ctx.destination);
        }

        osc.start(now);
        osc.stop(now + 0.05);

        // Fireplace crackle pop on each shuffle tick
        this.triggerFireplaceCracklePop(1.2, panVal);
      }, delay * 1000);
    }

    // 2. Swirl Mountain Wind across channels
    if (this.windFilterNode && this.windGainNode) {
      try {
        const now = this.ctx.currentTime;
        this.windFilterNode.frequency.cancelScheduledValues(now);
        this.windFilterNode.frequency.setValueAtTime(250, now);
        this.windFilterNode.frequency.exponentialRampToValueAtTime(1600, now + 0.6);
        this.windFilterNode.frequency.exponentialRampToValueAtTime(300, now + 1.4);
      } catch (e) {}
    }

    // 3. Runic Chanting Swell
    this.playMysticChime("Epic");
  }

  // Play an immersive continuous medieval drone soundscape and periodic lute arpeggios
  private startProceduralAmbient() {
    if (this.proceduralInterval || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Continuous Root Drone (D2 = 73.42 Hz and A2 = 110.00 Hz)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(73.42, now); // D2

      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(110.00, now); // A2

      // Lowpass filter for warm, dark medieval cathedral acoustic quality
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);

      this.droneGain.gain.setValueAtTime(0, now);
      this.droneGain.gain.linearRampToValueAtTime(this.musicVolume * 0.4, now + 2.0);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
    } catch (e) {}

    // Pentagonal / Lydian medieval mode frequencies (D, E, F#, A, B, C#)
    const scale = [146.83, 164.81, 185.00, 220.00, 246.94, 293.66, 329.63, 370.00];
    
    this.proceduralInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const note1 = scale[Math.floor(Math.random() * scale.length)];
        const note2 = scale[Math.floor(Math.random() * scale.length)];
        
        // Play lute pluck pair
        [note1, note2].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.5);
          
          gain.gain.setValueAtTime(0, now + i * 0.5);
          gain.gain.linearRampToValueAtTime(this.musicVolume * 0.3, now + i * 0.5 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.5 + 2.2);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + i * 0.5);
          osc.stop(now + i * 0.5 + 2.4);
        });
      } catch (e) {}
    }, 3200);
  }

  private stopProceduralAmbient() {
    if (this.droneGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => {
          if (this.droneOsc1) {
            try { this.droneOsc1.stop(); this.droneOsc1.disconnect(); } catch (e) {}
            this.droneOsc1 = null;
          }
          if (this.droneOsc2) {
            try { this.droneOsc2.stop(); this.droneOsc2.disconnect(); } catch (e) {}
            this.droneOsc2 = null;
          }
          this.droneGain = null;
        }, 1100);
      } catch (e) {}
    }

    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }
  }

  // Play a soft card flipping / wood snap sound, with extra parchment-tearing or stone-scraping texture for high-rarity cards
  playFlip(rarity?: "Common" | "Rare" | "Epic" | "Legendary") {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // First, play a quick rustling card friction noise (standard flip)
    const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
    const standardBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const standardData = standardBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      standardData[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = standardBuffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(600, now);
    noiseFilter.Q.setValueAtTime(3, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseNode.start(now);

    // Second, play the physical "thud" or "snap" of the card
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);

    // Third, for High-Rarity cards, add a unique procedurally-synthesized heavy parchment-tear / stone-scrape effect
    if (rarity && rarity !== "Common") {
      const sampleRate = this.ctx.sampleRate;
      
      // Customize physical properties based on card rarity
      let scrapeDuration = 0.25; // seconds
      let scrapeVolume = 0.12;
      let filterQ = 2.5;
      let hasRumble = false;
      let rumbleVolume = 0.04;
      
      if (rarity === "Legendary") {
        scrapeDuration = 0.55;
        scrapeVolume = 0.28;
        filterQ = 4.5;
        hasRumble = true;
        rumbleVolume = 0.12;
      } else if (rarity === "Epic") {
        scrapeDuration = 0.40;
        scrapeVolume = 0.20;
        filterQ = 3.5;
        hasRumble = true;
        rumbleVolume = 0.07;
      } else if (rarity === "Rare") {
        scrapeDuration = 0.28;
        scrapeVolume = 0.14;
        filterQ = 2.8;
        hasRumble = false;
      }

      const scrapeSize = sampleRate * scrapeDuration;
      const scrapeBuffer = this.ctx.createBuffer(1, scrapeSize, sampleRate);
      const scrapeData = scrapeBuffer.getChannelData(0);

      // Create granular physical tearing/scraping friction by modulating amplitude and adding micro-tears
      for (let i = 0; i < scrapeSize; i++) {
        const t = i / sampleRate;
        
        // Base white noise
        const noise = Math.random() * 2 - 1;
        
        // Chaotic envelope to represent uneven surface friction
        const modulation = 0.4 + 0.6 * Math.sin(t * 150) * Math.cos(t * 55 + Math.sin(t * 12));
        
        // Micro click impulses representing paper fiber tears or stone micro-fractures
        let microTearImpulse = 0;
        if (Math.random() < 0.07) {
          microTearImpulse = (Math.random() * 2 - 1) * 0.55;
        }

        // Mix noise, modulation and impulses
        scrapeData[i] = (noise * modulation * 0.45) + (microTearImpulse * 0.55);

        // Overall fade-in and envelope decay
        const env = t < 0.04 
          ? (t / 0.04) 
          : Math.max(0, 1 - (t - 0.04) / (scrapeDuration - 0.04));
        
        scrapeData[i] *= env;
      }

      // Connect custom scrape buffer through a sweeping resonant filter
      const scrapeSource = this.ctx.createBufferSource();
      scrapeSource.buffer = scrapeBuffer;

      const scrapeFilter = this.ctx.createBiquadFilter();
      scrapeFilter.type = "bandpass";
      
      // Sweep frequency downwards to mimic mechanical friction sliding/decelerating
      const startFreq = rarity === "Legendary" ? 2200 : rarity === "Epic" ? 1800 : 1400;
      const endFreq = rarity === "Legendary" ? 450 : rarity === "Epic" ? 500 : 600;
      
      scrapeFilter.frequency.setValueAtTime(startFreq, now);
      scrapeFilter.frequency.exponentialRampToValueAtTime(endFreq, now + scrapeDuration);
      scrapeFilter.Q.setValueAtTime(filterQ, now);

      const scrapeGainNode = this.ctx.createGain();
      scrapeGainNode.gain.setValueAtTime(scrapeVolume, now);
      scrapeGainNode.gain.exponentialRampToValueAtTime(0.001, now + scrapeDuration);

      scrapeSource.connect(scrapeFilter);
      scrapeFilter.connect(scrapeGainNode);
      scrapeGainNode.connect(this.ctx.destination);
      scrapeSource.start(now);

      // Play deep sub-bass stone-rumble sweep for Epic & Legendary cards for massive haptic feeling
      if (hasRumble) {
        const rumbleOsc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        
        rumbleOsc.type = rarity === "Legendary" ? "sawtooth" : "triangle";
        
        const startRumbleFreq = rarity === "Legendary" ? 75 : 85;
        const endRumbleFreq = rarity === "Legendary" ? 25 : 35;
        
        rumbleOsc.frequency.setValueAtTime(startRumbleFreq, now);
        rumbleOsc.frequency.exponentialRampToValueAtTime(endRumbleFreq, now + scrapeDuration);

        // Cut off highs for satisfying pure bass rumble
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(rarity === "Legendary" ? 110 : 130, now);
        lowpass.Q.setValueAtTime(1.0, now);

        rumbleGain.gain.setValueAtTime(rumbleVolume, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + scrapeDuration);

        rumbleOsc.connect(lowpass);
        lowpass.connect(rumbleGain);
        rumbleGain.connect(this.ctx.destination);

        rumbleOsc.start(now);
        rumbleOsc.stop(now + scrapeDuration);
      }
    }
  }

  // Play a rapid sequence of shuffle ticks
  playShuffleTick(timeOffset: number = 0, pitchFactor: number = 1) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + timeOffset;

    // Soft click / rustle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(350 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Play a complete rolling shuffle sound
  playFullShuffle() {
    const ticks = 10;
    for (let i = 0; i < ticks; i++) {
      // Exponentially decaying interval to mimic cards settling down
      const delay = 0.08 * i + 0.01 * Math.pow(i, 1.5);
      const pitch = 1.3 - (i / ticks) * 0.5; // pitch drops slightly as pile settles
      this.playShuffleTick(delay, pitch);
    }
  }

  // Play a shimmering magical ascension sound for soul matches
  playArcaneShimmer() {
    this.playMysticChime("Legendary");
  }

  // Play a gorgeous mystical chord chime
  playMysticChime(rarity: "Common" | "Rare" | "Epic" | "Legendary") {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    let freqs = [220, 330, 440, 660];
    let duration = 1.5;
    let volume = 0.05;

    if (rarity === "Legendary") {
      freqs = [196, 293, 392, 440, 587, 784]; // G major 9th/major-7th vibe
      duration = 3.5;
      volume = 0.07;
    } else if (rarity === "Epic") {
      freqs = [220, 277, 329, 440, 554, 659]; // A major / mystical lydian vibe
      duration = 2.8;
      volume = 0.06;
    } else if (rarity === "Rare") {
      freqs = [220, 261, 330, 440, 523]; // Minor chord (high-fantasy mood)
      duration = 2.0;
      volume = 0.05;
    }

    // Play chord overtones
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const noteDelay = idx * 0.06;
      const noteStart = now + noteDelay;

      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, noteStart);
      
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(4.5, noteStart);
      lfoGain.gain.setValueAtTime(2.5, noteStart);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, noteStart + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration - noteDelay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      lfo.start(noteStart);
      osc.start(noteStart);
      
      lfo.stop(noteStart + duration);
      osc.stop(noteStart + duration);
    });
  }

  // Fantasy & Horror Music Library Player
  getMusicLibrary(): MusicTrack[] {
    return MUSIC_LIBRARY;
  }

  getCurrentTrackId(): string {
    return this.currentTrackId;
  }

  getCurrentTrack(): MusicTrack {
    return MUSIC_LIBRARY.find((t) => t.id === this.currentTrackId) || MUSIC_LIBRARY[0];
  }

  getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicAudio) {
      this.musicAudio.volume = this.musicVolume;
    }
  }

  playTrack(trackId: string) {
    this.currentTrackId = trackId;
    if (this.isMusicPlaying) {
      this.stopThemeMusic();
    }
    this.startThemeMusic(trackId);
  }

  startThemeMusic(trackId?: string) {
    this.init();
    if (trackId) {
      this.currentTrackId = trackId;
    }

    const selectedTrack = this.getCurrentTrack();
    this.isMusicPlaying = true;
    this.startProceduralAmbient();

    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
        this.musicAudio.src = "";
      } catch (e) {}
      this.musicAudio = null;
    }

    try {
      this.musicAudio = new Audio();
      this.musicAudio.preload = "auto";
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.musicVolume;

      // Gracefully capture and silence loading/network/decoder errors from displaying scary overlays
      this.musicAudio.onerror = () => {
        console.info("SoundEngine: Track deferred or format unsupported on this device:", selectedTrack.title);
      };

      this.musicAudio.src = selectedTrack.url;

      this.musicAudio.play().catch((err) => {
        // Log as low-severity info to prevent noisy developer error overlays for browser autoplay policy rejections
        console.info("SoundEngine: Autoplay deferred or blocked. Scribing listener to play on user interaction.", err.message || err);
        
        const playOnInteraction = () => {
          if (this.isMusicPlaying && this.musicAudio) {
            this.musicAudio.play().catch(() => {});
          }
          window.removeEventListener("click", playOnInteraction);
          window.removeEventListener("touchstart", playOnInteraction);
        };
        window.addEventListener("click", playOnInteraction, { passive: true });
        window.addEventListener("touchstart", playOnInteraction, { passive: true });
      });
    } catch (err) {
      console.info("SoundEngine: Failed to initialize audio track:", selectedTrack.title, err);
    }
  }

  stopThemeMusic() {
    this.isMusicPlaying = false;
    this.stopProceduralAmbient();
    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
      } catch (e) {}
      try {
        this.musicAudio.currentTime = 0;
      } catch (e) {}
    }
  }
}

export const sfx = new SoundEngine();
