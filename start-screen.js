// Romance game start screen component
const RomanceStartScreen = {
  render: () => {
    return `
      <div class="start-screen">
        <div class="start-content">
          <h1 class="game-title">${MESSAGES.UI.GAME_TITLE}</h1>
          <div class="character-display">
            <img src="${UTILS.getCharacterImagePath("player", 10, false)}" 
                 alt="You - A Pink Lion Woman" 
                 class="player-image" />
          </div>
          <p class="game-description">
            ${MESSAGES.UI.START_DESCRIPTION}
          </p>
          <button id="start-button" class="start-button">
            ${MESSAGES.UI.START_BUTTON}
          </button>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    const startButton = document.getElementById("start-button");
    if (startButton) {
      startButton.addEventListener("click", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);
        UTILS.playAudio(CONFIG.AUDIO.BELL_CHIME);

        // Start the romance game
        if (typeof RomanceGame !== "undefined") {
          RomanceGame.startGame();
        }
      });
    }
  },

  init: () => {
    const container = document.getElementById("game-container");
    container.innerHTML = RomanceStartScreen.render();
    RomanceStartScreen.attachEventListeners();

    // Start romantic background music
    const currentTrack = UTILS.switchBackgroundMusic(0);

    // Track music for achievements if system is available
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.trackMusicHeard(currentTrack);
    }

    // Make sure achievement drawer is available
    if (
      typeof AchievementDrawer !== "undefined" &&
      !document.getElementById("achievement-button")
    ) {
      AchievementDrawer.init();
    }
  },
};
