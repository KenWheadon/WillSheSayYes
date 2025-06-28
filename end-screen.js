// Romance game ending screen component
const RomanceEndingScreen = {
  render: (gameState, endingType) => {
    const ending = MESSAGES.ENDINGS[endingType];
    const ballGirl = gameState.ballDateGirl ? CONFIG.GIRLS[gameState.ballDateGirl.toUpperCase()] : null;
    
    return `
      <div class="ending-screen">
        <div class="ending-content">
          <h1 class="ending-title" style="color: ${ending.color}">
            ${ending.title}
          </h1>
          
          <div class="ending-display">
            ${ballGirl ? `
              <img src="${UTILS.getCharacterImagePath(gameState.ballDateGirl, gameState.loveScores[gameState.ballDateGirl])}" 
                   alt="${ballGirl.name}" 
                   class="ending-girl-image final-girl-image" />
              <h3>With ${ballGirl.name}</h3>
            ` : `
              <img src="${UTILS.getCharacterImagePath('player', 2)}" 
                   alt="You alone" 
                   class="ending-girl-image final-girl-image" />
              <h3>Flying Solo</h3>
            `}
          </div>
          
          <p class="ending-message">${ending.message}</p>
          
          <div class="final-stats">
            <h3>Your Romance Journey</h3>
            <div class="love-scores">
              <p>💕 Luna: ${gameState.loveScores.luna}/${CONFIG.MAX_LOVE}</p>
              <p>💕 Maya: ${gameState.loveScores.maya}/${CONFIG.MAX_LOVE}</p>
              <p>💕 Rose: ${gameState.loveScores.rose}/${CONFIG.MAX_LOVE}</p>
            </div>
            <p>${MESSAGES.UI.DAYS_COMPLETED_LABEL} ${gameState.currentDay}/${CONFIG.TOTAL_DAYS}</p>
            <p>${MESSAGES.UI.TOTAL_DATES_LABEL} ${gameState.datesCompleted}/${CONFIG.TOTAL_DATES}</p>
            <p>${MESSAGES.UI.BALL_OUTCOME_LABEL} ${gameState.ballInviteAccepted ? 'Perfect Date!' : 'Went Alone'}</p>
          </div>
          
          <button id="restart-button" class="restart-button">
            ${MESSAGES.UI.RESTART_BUTTON}
          </button>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    const restartButton = document.getElementById("restart-button");
    if (restartButton) {
      restartButton.addEventListener("click", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);
        
        // Reset and return to start screen
        if (typeof RomanceGame !== 'undefined') {
          RomanceGame.resetGame();
        }
        RomanceStartScreen.init();
      });
    }
  },

  init: (gameState, endingType) => {
    const container = document.getElementById("game-container");
    container.innerHTML = RomanceEndingScreen.render(gameState, endingType);
    RomanceEndingScreen.attachEventListeners();

    // Play appropriate ending sound and music
    if (gameState.ballInviteAccepted && gameState.ballDateGirl && gameState.loveScores[gameState.ballDateGirl] >= 9) {
      UTILS.playAudio(CONFIG.AUDIO.SUCCESS_SOUND);
      const successMusic = UTILS.switchBackgroundMusic(10);
      if (typeof AchievementManager !== "undefined") {
        AchievementManager.trackMusicHeard(successMusic);
      }
    } else if (gameState.ballInviteAccepted) {
      UTILS.playAudio(CONFIG.AUDIO.BELL_CHIME);
      const happyMusic = UTILS.switchBackgroundMusic(7);
      if (typeof AchievementManager !== "undefined") {
        AchievementManager.trackMusicHeard(happyMusic);
      }
    } else {
      UTILS.playAudio(CONFIG.AUDIO.FAILURE_SOUND);
      const sadMusic = UTILS.switchBackgroundMusic(2);
      if (typeof AchievementManager !== "undefined") {
        AchievementManager.trackMusicHeard(sadMusic);
      }
    }

    // Update achievement drawer if it's open
    if (typeof AchievementDrawer !== "undefined") {
      AchievementDrawer.updateIfOpen();
    }
  },
};