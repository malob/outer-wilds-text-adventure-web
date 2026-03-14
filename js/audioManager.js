// AudioManager - Ported from AudioManager.pde
// The original uses the Minim library (Java) for audio. This port uses HTML5 Audio.
// Browser autoplay policies may block playback until the user interacts with the page.

const SoundLibrary = {
  kazooTheme: null,

  loadSounds() {
    console.log('Sounds loading...');
    SoundLibrary.kazooTheme = new Audio('data/audio/ow_kazoo_theme.mp3');
  }
};

const AudioManager = {
  currentSound: null,

  init() {
    SoundLibrary.loadSounds();
  },

  play(sound) {
    AudioManager.currentSound = sound;
    AudioManager.currentSound.currentTime = 0;
    AudioManager.currentSound.play().catch((e) => {
      // Browsers block autoplay before user interaction; only suppress that error
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
