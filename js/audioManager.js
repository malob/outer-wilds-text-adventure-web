// AudioManager - Ported from AudioManager.pde
// The original uses the Minim library (Java) for audio. This port uses HTML5 Audio
// routed through the Web Audio API (AudioContext) for reliable playback.
//
// Browser autoplay policies suspend the AudioContext until a user gesture occurs.
// The SplashScreen (new to the web port) provides this gesture before the
// TitleScreen tries to play music.

const SoundLibrary = {
  kazooTheme: null,

  loadSounds() {
    console.log('Sounds loading...');
    SoundLibrary.kazooTheme = new Audio('data/audio/ow_kazoo_theme.mp3');
  }
};

const AudioManager = {
  ctx: null,
  currentSound: null,

  init() {
    // Create an AudioContext and route HTML5 Audio elements through it.
    // This lets us unlock all audio with a single ctx.resume() call.
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    SoundLibrary.loadSounds();
    const source = this.ctx.createMediaElementSource(SoundLibrary.kazooTheme);
    source.connect(this.ctx.destination);
  },

  // Resume the AudioContext. Call this from a user gesture (e.g. button click)
  // to unlock audio playback.
  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(sound) {
    AudioManager.currentSound = sound;
    AudioManager.currentSound.currentTime = 0;
    AudioManager.currentSound.play().catch((e) => {
      if (e.name !== 'NotAllowedError') {
        console.error('Audio playback failed:', e.name, e.message);
      }
    });
  },

  pause() {
    if (AudioManager.currentSound != null) {
      AudioManager.currentSound.pause();
    } else {
      console.log('Current sound is NULL!!!');
    }
  }
};
