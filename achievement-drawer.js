// Achievement Drawer UI Component
const AchievementDrawer = {
  isOpen: false,

  // Initialize the achievement drawer
  init: () => {
    AchievementDrawer.createDrawerHTML();
    AchievementDrawer.attachEventListeners();
  },

  // Create the drawer HTML and button
  createDrawerHTML: () => {
    // Create achievement button
    const achievementButton = document.createElement("button");
    achievementButton.id = "achievement-button";
    achievementButton.className = "achievement-button";
    achievementButton.innerHTML = "🏆";
    achievementButton.title = "View Achievements";

    // Create drawer overlay
    const drawerOverlay = document.createElement("div");
    drawerOverlay.id = "achievement-drawer-overlay";
    drawerOverlay.className = "achievement-drawer-overlay";

    // Create drawer content
    const drawer = document.createElement("div");
    drawer.id = "achievement-drawer";
    drawer.className = "achievement-drawer";
    drawer.innerHTML = AchievementDrawer.renderDrawerContent();

    drawerOverlay.appendChild(drawer);

    // Add to page
    document.body.appendChild(achievementButton);
    document.body.appendChild(drawerOverlay);
  },

  // Render drawer content
  renderDrawerContent: () => {
    const achievements = AchievementManager.getAllAchievements();
    const stats = AchievementManager.getStatistics();

    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const totalCount = achievements.length;

    return `
      <div class="achievement-header">
        <h2>🏆 Achievements</h2>
        <div class="achievement-progress">
          ${unlockedCount}/${totalCount} Unlocked
        </div>
        <button id="close-drawer" class="close-drawer-btn">×</button>
      </div>
      
      <div class="achievement-content">
        <div class="achievement-grid">
          ${achievements
            .map(
              (achievement) => `
            <div class="achievement-item ${
              achievement.unlocked ? "unlocked" : "locked"
            }">
              <div class="achievement-icon">${
                achievement.unlocked ? achievement.icon : "🔒"
              }</div>
              <div class="achievement-info">
                <div class="achievement-name">${
                  achievement.unlocked ? achievement.name : "???"
                }</div>
                <div class="achievement-description">${
                  achievement.unlocked
                    ? achievement.description
                    : "Hidden achievement"
                }</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="achievement-stats">
          <h3>📊 Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Games Started:</span>
              <span class="stat-value">${stats.gamesStarted}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Deaths:</span>
              <span class="stat-value">${stats.totalDeaths}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Silent Responses:</span>
              <span class="stat-value">${stats.totalSilentResponses}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Max Silent Streak:</span>
              <span class="stat-value">${stats.maxConsecutiveSilent}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Music Tracks Heard:</span>
              <span class="stat-value">${stats.musicTracksHeard.length}/3</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Endings Reached:</span>
              <span class="stat-value">${stats.endingsReached.length}/5</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Attach event listeners
  attachEventListeners: () => {
    const achievementButton = document.getElementById("achievement-button");
    const drawerOverlay = document.getElementById("achievement-drawer-overlay");

    if (achievementButton) {
      achievementButton.addEventListener("click", () => {
        AchievementDrawer.toggleDrawer();
      });
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener("click", (e) => {
        if (e.target === drawerOverlay) {
          AchievementDrawer.closeDrawer();
        }
      });
    }

    // Close button listener will be attached when drawer opens
  },

  // Toggle drawer open/close
  toggleDrawer: () => {
    if (AchievementDrawer.isOpen) {
      AchievementDrawer.closeDrawer();
    } else {
      AchievementDrawer.openDrawer();
    }
  },

  // Open drawer
  openDrawer: () => {
    const drawerOverlay = document.getElementById("achievement-drawer-overlay");
    const drawer = document.getElementById("achievement-drawer");

    if (drawerOverlay && drawer) {
      // Update content before showing
      drawer.innerHTML = AchievementDrawer.renderDrawerContent();

      // Attach close button listener
      const closeButton = document.getElementById("close-drawer");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          AchievementDrawer.closeDrawer();
        });
      }

      drawerOverlay.style.display = "flex";
      setTimeout(() => {
        drawerOverlay.classList.add("open");
        drawer.classList.add("open");
      }, 10);

      AchievementDrawer.isOpen = true;

      // Play sound
      UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND, 0.5);
    }
  },

  // Close drawer
  closeDrawer: () => {
    const drawerOverlay = document.getElementById("achievement-drawer-overlay");
    const drawer = document.getElementById("achievement-drawer");

    if (drawerOverlay && drawer) {
      drawerOverlay.classList.remove("open");
      drawer.classList.remove("open");

      setTimeout(() => {
        drawerOverlay.style.display = "none";
      }, 300);

      AchievementDrawer.isOpen = false;

      // Play sound
      UTILS.playAudio(CONFIG.AUDIO.CHOICE_HOVER, 0.3);
    }
  },

  // Update drawer content if it's open
  updateIfOpen: () => {
    if (AchievementDrawer.isOpen) {
      const drawer = document.getElementById("achievement-drawer");
      if (drawer) {
        drawer.innerHTML = AchievementDrawer.renderDrawerContent();

        // Re-attach close button listener
        const closeButton = document.getElementById("close-drawer");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            AchievementDrawer.closeDrawer();
          });
        }
      }
    }
  },
};
