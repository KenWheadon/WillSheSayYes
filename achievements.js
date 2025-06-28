// Achievement Management System for Romance Game
const AchievementManager = {
  // Achievement data structure
  achievementData: {
    unlockedAchievements: [],
    statistics: {
      gamesStarted: 0,
      totalDates: 0,
      romanticChoices: 0,
      totalGirlsDated: new Set(),
      perfectRomances: 0,
      ballInvitations: 0,
      heartbreaks: 0,
      musicTracksHeard: new Set(),
      endingsReached: new Set(),
    },
  },

  // Initialize achievement system
  init: () => {
    AchievementManager.loadFromStorage();
    console.log("Romance Achievement system initialized");
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

        // Convert Sets back from arrays with proper fallbacks
        if (parsed.statistics) {
          if (parsed.statistics.totalGirlsDated) {
            AchievementManager.achievementData.statistics.totalGirlsDated =
              new Set(parsed.statistics.totalGirlsDated);
          } else {
            AchievementManager.achievementData.statistics.totalGirlsDated =
              new Set();
          }

          if (parsed.statistics.musicTracksHeard) {
            AchievementManager.achievementData.statistics.musicTracksHeard =
              new Set(parsed.statistics.musicTracksHeard);
          } else {
            AchievementManager.achievementData.statistics.musicTracksHeard =
              new Set();
          }

          if (parsed.statistics.endingsReached) {
            AchievementManager.achievementData.statistics.endingsReached =
              new Set(parsed.statistics.endingsReached);
          } else {
            AchievementManager.achievementData.statistics.endingsReached =
              new Set();
          }
        }
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
      AchievementManager.achievementData = {
        unlockedAchievements: [],
        statistics: {
          gamesStarted: 0,
          totalDates: 0,
          romanticChoices: 0,
          totalGirlsDated: new Set(),
          perfectRomances: 0,
          ballInvitations: 0,
          heartbreaks: 0,
          musicTracksHeard: new Set(),
          endingsReached: new Set(),
        },
      };
    }
  },

  // Save achievements to localStorage
  saveToStorage: () => {
    try {
      const stats = AchievementManager.achievementData.statistics;
      const toSave = {
        ...AchievementManager.achievementData,
        statistics: {
          ...stats,
          totalGirlsDated: Array.from(stats.totalGirlsDated || new Set()),
          musicTracksHeard: Array.from(stats.musicTracksHeard || new Set()),
          endingsReached: Array.from(stats.endingsReached || new Set()),
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
    UTILS.playAudio(CONFIG.AUDIO.BELL_CHIME);

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
    AchievementManager.saveToStorage();
  },

  // Track date completed
  trackDateCompleted: (girlId) => {
    AchievementManager.achievementData.statistics.totalDates++;
    AchievementManager.achievementData.statistics.totalGirlsDated.add(girlId);

    // First date achievement
    if (AchievementManager.achievementData.statistics.totalDates === 1) {
      AchievementManager.unlockAchievement("first-date");
    }

    // Romantic explorer achievement (dated all 3 girls)
    if (
      AchievementManager.achievementData.statistics.totalGirlsDated.size === 3
    ) {
      AchievementManager.unlockAchievement("romantic-explorer");
    }

    AchievementManager.saveToStorage();
  },

  // Track romantic choice made
  trackRomanticChoice: () => {
    AchievementManager.achievementData.statistics.romanticChoices++;

    // Sweet talker achievement (20 romantic choices)
    if (AchievementManager.achievementData.statistics.romanticChoices >= 20) {
      AchievementManager.unlockAchievement("sweet-talker");
    }

    AchievementManager.saveToStorage();
  },

  // Track locations visited for three dates achievement
  trackThreeLocations: () => {
    AchievementManager.unlockAchievement("three-dates");
    AchievementManager.saveToStorage();
  },

  // Track devoted heart achievement (3 dates with same girl)
  trackDevotedHeart: () => {
    AchievementManager.unlockAchievement("devoted-heart");
    AchievementManager.saveToStorage();
  },

  // Track ball invitation and individual girl achievements
  trackBallInvitation: (accepted, girlId) => {
    if (accepted) {
      AchievementManager.achievementData.statistics.ballInvitations++;
      AchievementManager.unlockAchievement("ball-ready");

      // Track individual girl ball achievements
      if (girlId === "luna") {
        AchievementManager.unlockAchievement("lunas-partner");
      } else if (girlId === "maya") {
        AchievementManager.unlockAchievement("mayas-partner");
      } else if (girlId === "rose") {
        AchievementManager.unlockAchievement("roses-partner");
      }
    } else {
      AchievementManager.achievementData.statistics.heartbreaks++;
      AchievementManager.unlockAchievement("heartbreaker");
    }
    AchievementManager.saveToStorage();
  },

  // Track perfect romance
  trackPerfectRomance: () => {
    AchievementManager.achievementData.statistics.perfectRomances++;
    AchievementManager.unlockAchievement("perfect-romance");
    AchievementManager.saveToStorage();
  },

  // Track music heard
  trackMusicHeard: (musicTrack) => {
    AchievementManager.achievementData.statistics.musicTracksHeard.add(
      musicTrack
    );
    AchievementManager.saveToStorage();
  },

  // Track ending reached
  trackEnding: (endingType) => {
    AchievementManager.achievementData.statistics.endingsReached.add(
      endingType
    );
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
    // Ensure Sets are properly initialized before converting to Arrays
    const stats = AchievementManager.achievementData.statistics;

    return {
      ...stats,
      totalGirlsDated: Array.from(stats.totalGirlsDated || new Set()),
      musicTracksHeard: Array.from(stats.musicTracksHeard || new Set()),
      endingsReached: Array.from(stats.endingsReached || new Set()),
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
        totalDates: 0,
        romanticChoices: 0,
        totalGirlsDated: new Set(),
        perfectRomances: 0,
        ballInvitations: 0,
        heartbreaks: 0,
        musicTracksHeard: new Set(),
        endingsReached: new Set(),
      },
    };
    console.log("All romance achievements reset");
  },
};
