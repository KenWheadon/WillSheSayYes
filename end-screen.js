// Romance game ending screen component
const RomanceEndingScreen = {
  render: (gameState, endingType) => {
    const ending = MESSAGES.ENDINGS[endingType];
    const ballGirl = gameState.ballDateGirl
      ? CONFIG.GIRLS[gameState.ballDateGirl.toUpperCase()]
      : null;

    return `
      <div class="ending-screen">
        <div class="ending-content">
          <h1 class="ending-title" style="color: ${ending.color}">
            ${ending.title}
          </h1>
          
          <div class="ending-display">
            ${
              ballGirl
                ? `
              <img src="${UTILS.getCharacterImagePath(
                gameState.ballDateGirl,
                gameState.loveScores[gameState.ballDateGirl],
                true
              )}" 
                   alt="${ballGirl.name}" 
                   class="ending-girl-image final-girl-image" />`
                : `
                   <img src="${UTILS.getCharacterImagePath(
                     "player",
                     2,
                     true
                   )}" alt="You alone" class="ending-girl-image final-girl-image" />
              <h3>Flying Solo</h3>
            `
            }
          </div>
          
          <div class='ending-message-container'>
          
            <p class="ending-message">${ending.message}</p>
          
            <div class="final-stats">
              <h3>${MESSAGES.UI.BALL_OUTCOME_LABEL} ${
      gameState.ballInviteAccepted ? "Perfect Date!" : "Went Alone"
    }</h3>
              <div class="love-scores">
                <p>💕 Luna: ${gameState.loveScores.luna}/${CONFIG.MAX_LOVE}</p>
                <p>💕 Maya: ${gameState.loveScores.maya}/${CONFIG.MAX_LOVE}</p>
                <p>💕 Rose: ${gameState.loveScores.rose}/${CONFIG.MAX_LOVE}</p>
              </div>
            </div>

            <button id="restart-button" class="restart-button">
              ${MESSAGES.UI.RESTART_BUTTON}
            </button>
          
          </div>
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
        if (typeof RomanceGame !== "undefined") {
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

    // Play appropriate ending sound and music (ballroom music continues)
    if (
      gameState.ballInviteAccepted &&
      gameState.ballDateGirl &&
      gameState.loveScores[gameState.ballDateGirl] >= 9
    ) {
      UTILS.playAudio(CONFIG.AUDIO.SUCCESS_SOUND);
      // Ballroom music should already be playing
    } else if (gameState.ballInviteAccepted) {
      UTILS.playAudio(CONFIG.AUDIO.BELL_CHIME);
      // Ballroom music should already be playing
    } else {
      UTILS.playAudio(CONFIG.AUDIO.FAILURE_SOUND);
      // Ballroom music should already be playing
    }

    // Update achievement drawer if it's open
    if (typeof AchievementDrawer !== "undefined") {
      AchievementDrawer.updateIfOpen();
    }
  },
};
