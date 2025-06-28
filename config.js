// Romance Game configuration and constants
const CONFIG = {
  // Timer settings
  CHOICE_TIMER: 15,
  RESPONSE_DISPLAY_TIME: 2500,

  // Love system (replacing rage)
  MAX_LOVE: 10,
  MIN_LOVE: 0,
  VICTORY_LOVE_THRESHOLD: 7,

  // Game progression
  TOTAL_DAYS: 7,
  BALL_DAY: 7,
  TOTAL_DATES: 3,

  // Audio settings
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.7,

  // File paths
  IMAGES: {
    CHARACTER_PREFIX: "images/",
    CHARACTER_EXTENSION: ".png",
    LOCATION_PREFIX: "images/location-",
    BACKGROUND: "images/ballroom.jpg",
  },

  AUDIO: {
    BACKGROUND_MUSIC_ROMANTIC: "background-music-romantic",
    BACKGROUND_MUSIC_NERVOUS: "background-music-nervous", 
    BACKGROUND_MUSIC_VICTORY: "background-music-victory",
    CHOICE_SOUND: "choice-sound",
    CHOICE_HOVER: "choice-hover",
    BELL_CHIME: "bell-chime",
    LOVE_INCREASE: "heart-sound",
    LOVE_DECREASE: "disappointed-sound",
    SUCCESS_SOUND: "success-fanfare",
    FAILURE_SOUND: "sad-music",
  },

  // Girls data
  GIRLS: {
    LUNA: {
      id: 'luna',
      name: 'Luna',
      description: 'A dreamy artist with starlight in her eyes',
      personality: 'Creative and whimsical, loves beauty and imagination',
      likedLocations: ['carnival', 'hike'],
      dislikedLocation: 'dinner',
      loveTriggers: ['creative', 'romantic', 'adventurous'],
      hates: ['boring', 'practical', 'rude']
    },
    MAYA: {
      id: 'maya',
      name: 'Maya',
      description: 'An athletic lioness who loves the outdoors',
      personality: 'Energetic and bold, values honesty and adventure',
      likedLocations: ['hike', 'dinner'],
      dislikedLocation: 'carnival',
      loveTriggers: ['honest', 'active', 'confident'],
      hates: ['dishonest', 'lazy', 'fake']
    },
    ROSE: {
      id: 'rose',
      name: 'Rose',
      description: 'An elegant lioness with refined tastes',
      personality: 'Sophisticated and charming, appreciates class and wit',
      likedLocations: ['dinner', 'carnival'],
      dislikedLocation: 'hike',
      loveTriggers: ['witty', 'elegant', 'thoughtful'],
      hates: ['crude', 'messy', 'immature']
    }
  },

  // Date locations
  LOCATIONS: {
    CARNIVAL: {
      id: 'carnival',
      name: 'Twilight Carnival',
      description: 'A magical carnival with twinkling lights and whimsical rides',
      atmosphere: 'Colorful lights dance around you as carnival music plays softly'
    },
    HIKE: {
      id: 'hike',
      name: 'Moonlit Nature Trail',
      description: 'A peaceful hiking trail under the stars',
      atmosphere: 'Cool night air and the sound of crickets surround you'
    },
    DINNER: {
      id: 'dinner',
      name: 'Elegant Restaurant',
      description: 'An upscale restaurant with candlelit tables',
      atmosphere: 'Soft jazz music and the gentle clink of fine china'
    }
  },

  // Day types
  DAY_TYPES: {
    STORY: 'story',
    DATE: 'date',
    BALL: 'ball'
  },

  // Music love thresholds
  MUSIC_THRESHOLDS: {
    ROMANTIC: { min: 7, max: 10 },
    NERVOUS: { min: 3, max: 6 },
    HOPEFUL: { min: 0, max: 2 },
  },

  // Ending conditions
  ENDINGS: {
    PERFECT_ROMANCE: "perfect-romance",
    SWEET_SUCCESS: "sweet-success", 
    FRIENDLY_REJECTION: "friendly-rejection",
    AWKWARD_FAILURE: "awkward-failure",
    ALONE_AT_BALL: "alone-at-ball"
  },

  // Achievement system
  ACHIEVEMENTS: {
    FIRST_DATE: {
      id: "first-date",
      name: "First Date Nerves",
      description: "Asked someone on your first date",
      icon: "💕"
    },
    PERFECT_ROMANCE: {
      id: "perfect-romance", 
      name: "Perfect Romance",
      description: "Found true love and went to the ball together",
      icon: "👑"
    },
    THREE_DATES: {
      id: "three-dates",
      name: "Social Butterfly", 
      description: "Went on dates to all three locations",
      icon: "🦋"
    },
    HEARTBREAKER: {
      id: "heartbreaker",
      name: "Heartbreaker",
      description: "Got rejected by all three girls",
      icon: "💔"
    },
    DEVOTED_HEART: {
      id: "devoted-heart",
      name: "Devoted Heart",
      description: "Went on three dates with the same girl", 
      icon: "💝"
    }
  },

  // Achievement storage key
  ACHIEVEMENT_STORAGE_KEY: "romance-game-achievements",
};

// Utility functions
const UTILS = {
  // Get character image path based on love level
  getCharacterImagePath: (characterId, loveLevel = 0) => {
    const expression = loveLevel >= 7 ? 'happy' : loveLevel >= 4 ? 'neutral' : 'skeptical';
    return `${CONFIG.IMAGES.CHARACTER_PREFIX}${characterId}-${expression}${CONFIG.IMAGES.CHARACTER_EXTENSION}`;
  },

  // Get location image path
  getLocationImagePath: (locationId) => {
    return `${CONFIG.IMAGES.LOCATION_PREFIX}${locationId}${CONFIG.IMAGES.CHARACTER_EXTENSION}`;
  },

  // Play audio with volume control
  playAudio: (audioId, volume = CONFIG.SFX_VOLUME) => {
    const audio = document.getElementById(audioId);
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }
  },

  // Clamp love between min and max
  clampLove: (love) => {
    return Math.max(CONFIG.MIN_LOVE, Math.min(CONFIG.MAX_LOVE, love));
  },

  // Check if girl likes a location
  doesGirlLikeLocation: (girlId, locationId) => {
    const girl = CONFIG.GIRLS[girlId.toUpperCase()];
    return girl.likedLocations.includes(locationId);
  },

  // Get appropriate background music based on love level
  getMusicTrackForLove: (highestLove) => {
    if (highestLove >= CONFIG.MUSIC_THRESHOLDS.ROMANTIC.min) {
      return CONFIG.AUDIO.BACKGROUND_MUSIC_VICTORY;
    } else if (highestLove >= CONFIG.MUSIC_THRESHOLDS.NERVOUS.min) {
      return CONFIG.AUDIO.BACKGROUND_MUSIC_NERVOUS;
    } else {
      return CONFIG.AUDIO.BACKGROUND_MUSIC_ROMANTIC;
    }
  },

  // Switch background music based on love level
  switchBackgroundMusic: (loveLevel, currentTrack = null) => {
    const newTrack = UTILS.getMusicTrackForLove(loveLevel);

    // Don't switch if already playing the correct track
    if (currentTrack === newTrack) return newTrack;

    // Stop all music tracks
    const allTracks = [
      CONFIG.AUDIO.BACKGROUND_MUSIC_ROMANTIC,
      CONFIG.AUDIO.BACKGROUND_MUSIC_NERVOUS,
      CONFIG.AUDIO.BACKGROUND_MUSIC_VICTORY,
    ];

    allTracks.forEach((trackId) => {
      const audio = document.getElementById(trackId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Start the new track
    const newAudio = document.getElementById(newTrack);
    if (newAudio) {
      newAudio.volume = CONFIG.MUSIC_VOLUME;
      newAudio.play().catch((e) => console.log("Music switch failed:", e));
    }

    return newTrack;
  },

  // Determine ending based on final love levels
  getEndingType: (loveScores, ballAccepted, ballGirl) => {
    if (ballAccepted && loveScores[ballGirl] >= 9) {
      return CONFIG.ENDINGS.PERFECT_ROMANCE;
    } else if (ballAccepted) {
      return CONFIG.ENDINGS.SWEET_SUCCESS;
    } else if (Math.max(...Object.values(loveScores)) >= 5) {
      return CONFIG.ENDINGS.FRIENDLY_REJECTION;
    } else if (Math.max(...Object.values(loveScores)) >= 2) {
      return CONFIG.ENDINGS.AWKWARD_FAILURE;
    } else {
      return CONFIG.ENDINGS.ALONE_AT_BALL;
    }
  },
};