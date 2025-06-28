// Achievement Management System
const AchievementManager = {
  // Achievement data structure
  achievementData: {
    unlockedAchievements: [],
    statistics: {
      gamesStarted: 0,
      totalDeaths: 0,
      totalSilentResponses: 0,
      consecutiveSilentResponses: 0,
      maxConsecutiveSilent: 0,
      musicTracksHeard: new Set(),
      endingsReached: new Set(),
    },
  },

  // Initialize achievement system
  init: () => {
    AchievementManager.loadFromStorage();
    console.log("Achievement system initialized");
  },

  // Load achievements from localStorage
  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem(CONFIG.ACHIEVEMENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        AchievementManager.achievementData = {
          ...AchievementManager.achievementData,
          ...parsed,
        };

        // Convert musicTracksHeard back to Set
        if (parsed.statistics && parsed.statistics.musicTracksHeard) {
          AchievementManager.achievementData.statistics.musicTracksHeard =
            new Set(parsed.statistics.musicTracksHeard);
        }

        // Convert endingsReached back to Set
        if (parsed.statistics && parsed.statistics.endingsReached) {
          AchievementManager.achievementData.statistics.endingsReached =
            new Set(parsed.statistics.endingsReached);
        }
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
      AchievementManager.achievementData = {
        unlockedAchievements: [],
        statistics: {
          gamesStarted: 0,
          totalDeaths: 0,
          totalSilentResponses: 0,
          consecutiveSilentResponses: 0,
          maxConsecutiveSilent: 0,
          musicTracksHeard: new Set(),
          endingsReached: new Set(),
        },
      };
    }
  },

  // Save achievements to localStorage
  saveToStorage: () => {
    try {
      const toSave = {
        ...AchievementManager.achievementData,
        statistics: {
          ...AchievementManager.achievementData.statistics,
          musicTracksHeard: Array.from(
            AchievementManager.achievementData.statistics.musicTracksHeard
          ),
          endingsReached: Array.from(
            AchievementManager.achievementData.statistics.endingsReached
          ),
        },
      };
      localStorage.setItem(
        CONFIG.ACHIEVEMENT_STORAGE_KEY,
        JSON.stringify(toSave)
      );
    } catch (error) {
      console.error("Failed to save achievements:", error);
    }
  },

  // Check if achievement is unlocked
  isUnlocked: (achievementId) => {
    return AchievementManager.achievementData.unlockedAchievements.includes(
      achievementId
    );
  },

  // Unlock an achievement
  unlockAchievement: (achievementId) => {
    if (!AchievementManager.isUnlocked(achievementId)) {
      AchievementManager.achievementData.unlockedAchievements.push(
        achievementId
      );
      AchievementManager.saveToStorage();
      AchievementManager.showAchievementNotification(achievementId);
      return true;
    }
    return false;
  },

  // Show achievement notification
  showAchievementNotification: (achievementId) => {
    const achievement =
      CONFIG.ACHIEVEMENTS[achievementId.toUpperCase().replace(/-/g, "_")];
    if (!achievement) return;

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
      <div class="achievement-popup">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Play achievement sound
    UTILS.playAudio(CONFIG.AUDIO.AIRPLANE_DING);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  },

  // Track game started
  trackGameStarted: () => {
    AchievementManager.achievementData.statistics.gamesStarted++;

    if (AchievementManager.achievementData.statistics.gamesStarted === 1) {
      AchievementManager.unlockAchievement("first-game");
    }

    AchievementManager.saveToStorage();
  },

  // Track death
  trackDeath: () => {
    AchievementManager.achievementData.statistics.totalDeaths++;

    if (AchievementManager.achievementData.statistics.totalDeaths === 3) {
      AchievementManager.unlockAchievement("die-three-times");
    }

    if (AchievementManager.achievementData.statistics.totalDeaths === 10) {
      AchievementManager.unlockAchievement("die-ten-times");
    }

    AchievementManager.saveToStorage();
  },

  // Track ending reached
  trackEnding: (endingType) => {
    AchievementManager.achievementData.statistics.endingsReached.add(
      endingType
    );

    // Check if this ending unlocks an achievement
    const achievementMap = {
      [CONFIG.ENDINGS.SUPER_DEAD]: "ending-super-dead",
      [CONFIG.ENDINGS.HOW_UNLUCKY]: "ending-how-unlucky",
      [CONFIG.ENDINGS.RED_EYE_REDEMPTION]: "ending-red-eye-redemption",
      [CONFIG.ENDINGS.SUSPICIOUS_WIN]: "ending-suspicious-win",
      [CONFIG.ENDINGS.NEUTRAL]: "ending-neutral",
    };

    const achievementId = achievementMap[endingType];
    if (achievementId) {
      AchievementManager.unlockAchievement(achievementId);
    }

    // Track death for death endings
    if (
      endingType === CONFIG.ENDINGS.SUPER_DEAD ||
      endingType === CONFIG.ENDINGS.HOW_UNLUCKY
    ) {
      AchievementManager.trackDeath();
    }

    AchievementManager.saveToStorage();
  },

  // Track music heard
  trackMusicHeard: (musicTrack) => {
    AchievementManager.achievementData.statistics.musicTracksHeard.add(
      musicTrack
    );

    // Check if all music tracks have been heard
    const allTracks = [
      CONFIG.AUDIO.BACKGROUND_MUSIC_HAPPY,
      CONFIG.AUDIO.BACKGROUND_MUSIC_UPSET,
      CONFIG.AUDIO.BACKGROUND_MUSIC_DEATH,
    ];

    const heardAll = allTracks.every((track) =>
      AchievementManager.achievementData.statistics.musicTracksHeard.has(track)
    );

    if (heardAll) {
      AchievementManager.unlockAchievement("hear-all-music");
    }

    AchievementManager.saveToStorage();
  },

  // Track silent response
  trackSilentResponse: () => {
    AchievementManager.achievementData.statistics.totalSilentResponses++;
    AchievementManager.achievementData.statistics.consecutiveSilentResponses++;

    // Update max consecutive
    AchievementManager.achievementData.statistics.maxConsecutiveSilent =
      Math.max(
        AchievementManager.achievementData.statistics.maxConsecutiveSilent,
        AchievementManager.achievementData.statistics.consecutiveSilentResponses
      );

    // Check achievements
    if (
      AchievementManager.achievementData.statistics
        .consecutiveSilentResponses === 3
    ) {
      AchievementManager.unlockAchievement("silent-streak");
    }

    if (
      AchievementManager.achievementData.statistics.totalSilentResponses === 25
    ) {
      AchievementManager.unlockAchievement("silent-total");
    }

    AchievementManager.saveToStorage();
  },

  // Reset consecutive silent counter (when non-silent choice is made)
  resetSilentStreak: () => {
    AchievementManager.achievementData.statistics.consecutiveSilentResponses = 0;
    AchievementManager.saveToStorage();
  },

  // Get all achievements with their unlock status
  getAllAchievements: () => {
    const achievements = [];

    Object.keys(CONFIG.ACHIEVEMENTS).forEach((key) => {
      const achievement = CONFIG.ACHIEVEMENTS[key];
      achievements.push({
        ...achievement,
        unlocked: AchievementManager.isUnlocked(achievement.id),
      });
    });

    return achievements.sort((a, b) => {
      // Sort by unlocked status first (unlocked first), then by name
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  // Get achievement statistics
  getStatistics: () => {
    return {
      ...AchievementManager.achievementData.statistics,
      musicTracksHeard: Array.from(
        AchievementManager.achievementData.statistics.musicTracksHeard
      ),
      endingsReached: Array.from(
        AchievementManager.achievementData.statistics.endingsReached
      ),
      totalUnlocked:
        AchievementManager.achievementData.unlockedAchievements.length,
      totalAchievements: Object.keys(CONFIG.ACHIEVEMENTS).length,
    };
  },

  // Reset all achievements (for testing)
  resetAchievements: () => {
    localStorage.removeItem(CONFIG.ACHIEVEMENT_STORAGE_KEY);
    AchievementManager.achievementData = {
      unlockedAchievements: [],
      statistics: {
        gamesStarted: 0,
        totalDeaths: 0,
        totalSilentResponses: 0,
        consecutiveSilentResponses: 0,
        maxConsecutiveSilent: 0,
        musicTracksHeard: new Set(),
        endingsReached: new Set(),
      },
    };
    console.log("All achievements reset");
  },
};
