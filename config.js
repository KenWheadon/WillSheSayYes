// Romance Game configuration and constants
const CONFIG = {
  // Timer settings
  CHOICE_TIMER: 30,
  RESPONSE_DISPLAY_TIME: 2500,

  // Love system (replacing rage)
  MAX_LOVE: 10,
  MIN_LOVE: 0,
  VICTORY_LOVE_THRESHOLD: 7,

  // Game progression
  TOTAL_DAYS: 7,
  BUMP_IN_DAY: 7,
  BALL_DAY: 7, // Ball happens after bump-in on same day
  TOTAL_DATES: 3,

  // Audio settings
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.7,

  // File paths
  IMAGES: {
    CHARACTER_PREFIX: "images/",
    CHARACTER_EXTENSION: ".png",
    LOCATION_PREFIX: "images/location-",
    BACKGROUND: "images/location-ballroon.png",
  },

  AUDIO: {
    BACKGROUND_MUSIC_PLANNING: "background-music-planning",
    BACKGROUND_MUSIC_CARNIVAL: "background-music-carnival",
    BACKGROUND_MUSIC_HIKE: "background-music-hike",
    BACKGROUND_MUSIC_DINNER: "background-music-dinner",
    BACKGROUND_MUSIC_BUMP_IN: "background-music-bump-in",
    BACKGROUND_MUSIC_BALLROOM: "background-music-ballroom",
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
      id: "luna",
      name: "Luna",
      description: "A dreamy artist with starlight in her eyes",
      personality: "Creative and whimsical, loves beauty and imagination",
      likedLocations: ["carnival", "hike"],
      dislikedLocation: "dinner",
      loveTriggers: ["creative", "romantic", "adventurous"],
      hates: ["boring", "practical", "rude"],
    },
    MAYA: {
      id: "maya",
      name: "Maya",
      description: "An athletic lioness who loves the outdoors",
      personality: "Energetic and bold, values honesty and adventure",
      likedLocations: ["hike", "dinner"],
      dislikedLocation: "carnival",
      loveTriggers: ["honest", "active", "confident"],
      hates: ["dishonest", "lazy", "fake"],
    },
    ROSE: {
      id: "rose",
      name: "Rose",
      description: "An elegant lioness with refined tastes",
      personality: "Sophisticated and charming, appreciates class and wit",
      likedLocations: ["dinner", "carnival"],
      dislikedLocation: "hike",
      loveTriggers: ["witty", "elegant", "thoughtful"],
      hates: ["crude", "messy", "immature"],
    },
  },

  // Date locations - UPDATED DINNER TO DINER
  LOCATIONS: {
    CARNIVAL: {
      id: "carnival",
      name: "Twilight Carnival",
      description:
        "A magical carnival with twinkling lights and whimsical rides",
      atmosphere:
        "Colorful lights dance around you as carnival music plays softly",
    },
    HIKE: {
      id: "hike",
      name: "Nature Trail",
      description: "A peaceful hiking trail just outside town",
      atmosphere: "Cool air and the sound of frogs surround you",
    },
    DINNER: {
      id: "dinner",
      name: "Cozy Diner",
      description:
        "A friendly neighborhood diner with comfy booths and great coffee",
      atmosphere:
        "The creeking vinyl of the booth seats and the comforting aroma of fresh coffee",
    },
  },

  // Special locations (not for dating)
  SPECIAL_LOCATIONS: {
    FLOWER_SHOP: {
      id: "flower-shop",
      name: "Enchanted Flower Shop",
      description: "A magical flower shop with blooms that never wilt",
      atmosphere:
        "Sweet floral scents fill the air as soft chimes play in the breeze",
    },
  },

  // Day types
  DAY_TYPES: {
    STORY: "story",
    DATE: "date",
    BUMP_IN: "bump_in",
    BALL: "ball",
  },

  // Music context types
  MUSIC_CONTEXTS: {
    PLANNING: "planning", // Start screen and story days
    CARNIVAL: "carnival", // Carnival dates
    HIKE: "hike", // Hike dates
    DINNER: "dinner", // Dinner dates
    BUMP_IN: "bump_in", // Day 7 encounter
    BALLROOM: "ballroom", // Ball and endings
  },

  // Ending conditions
  ENDINGS: {
    PERFECT_ROMANCE: "perfect-romance",
    SWEET_SUCCESS: "sweet-success",
    FRIENDLY_REJECTION: "friendly-rejection",
    AWKWARD_FAILURE: "awkward-failure",
    ALONE_AT_BALL: "alone-at-ball",
  },

  // Achievement system - UPDATED FOR ROMANCE THEME
  ACHIEVEMENTS: {
    FIRST_DATE: {
      id: "first-date",
      name: "First Date Nerves",
      description: "Went on your very first date",
      icon: "💕",
    },
    PERFECT_ROMANCE: {
      id: "perfect-romance",
      name: "Perfect Romance",
      description: "Found true love with maximum affection at the ball",
      icon: "👑",
    },
    THREE_DATES: {
      id: "three-dates",
      name: "Social Butterfly",
      description: "Went on dates to all three locations",
      icon: "🦋",
    },
    HEARTBREAKER: {
      id: "heartbreaker",
      name: "Heartbreaker",
      description: "Couldn't win anyone's heart for the ball",
      icon: "💔",
    },
    DEVOTED_HEART: {
      id: "devoted-heart",
      name: "Devoted Heart",
      description: "Went on three dates with the same girl",
      icon: "💝",
    },
    ROMANTIC_EXPLORER: {
      id: "romantic-explorer",
      name: "Romantic Explorer",
      description: "Went on dates with all three girls",
      icon: "🌟",
    },
    SWEET_TALKER: {
      id: "sweet-talker",
      name: "Sweet Talker",
      description: "Made 20 romantic dialogue choices",
      icon: "💬",
    },
    BALL_READY: {
      id: "ball-ready",
      name: "Ball Ready",
      description: "Successfully asked someone to the ball",
      icon: "💃",
    },
  },

  // Achievement storage key
  ACHIEVEMENT_STORAGE_KEY: "willshesayyes-game-achievements",
};

// Utility functions
const UTILS = {
  // Get character image path based on love level
  getCharacterImagePath: (characterId, loveLevel = 0) => {
    const expression =
      loveLevel >= 7 ? "happy" : loveLevel >= 4 ? "neutral" : "skeptical";
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

  // Get appropriate background music based on context
  getMusicTrackForContext: (context) => {
    switch (context) {
      case CONFIG.MUSIC_CONTEXTS.PLANNING:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_PLANNING;
      case CONFIG.MUSIC_CONTEXTS.CARNIVAL:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_CARNIVAL;
      case CONFIG.MUSIC_CONTEXTS.HIKE:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_HIKE;
      case CONFIG.MUSIC_CONTEXTS.DINNER:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_DINNER;
      case CONFIG.MUSIC_CONTEXTS.BUMP_IN:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_BUMP_IN;
      case CONFIG.MUSIC_CONTEXTS.BALLROOM:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_BALLROOM;
      default:
        return CONFIG.AUDIO.BACKGROUND_MUSIC_PLANNING;
    }
  },

  // Switch background music based on context
  switchBackgroundMusic: (context, currentTrack = null) => {
    const newTrack = UTILS.getMusicTrackForContext(context);

    // Don't switch if already playing the correct track
    if (currentTrack === newTrack) return newTrack;

    // Stop all music tracks
    const allTracks = [
      CONFIG.AUDIO.BACKGROUND_MUSIC_PLANNING,
      CONFIG.AUDIO.BACKGROUND_MUSIC_CARNIVAL,
      CONFIG.AUDIO.BACKGROUND_MUSIC_HIKE,
      CONFIG.AUDIO.BACKGROUND_MUSIC_DINNER,
      CONFIG.AUDIO.BACKGROUND_MUSIC_BUMP_IN,
      CONFIG.AUDIO.BACKGROUND_MUSIC_BALLROOM,
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
