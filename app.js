// Romance Game Main Application
const RomanceGame = {
  // Game state
  state: {
    currentDay: 1,
    dayType: CONFIG.DAY_TYPES.STORY,
    loveScores: { luna: 0, maya: 0, rose: 0 },
    datesCompleted: 0,
    dateHistory: [], // Track which girls and locations have been used
    currentDate: null, // Current date session data
    timer: CONFIG.CHOICE_TIMER,
    timerInterval: null,
    currentMusicTrack: null,
    showResponse: false,
    lastResponse: "",
    showDatingOptions: false,
    ballInviteAccepted: false,
    ballDateGirl: null,
    bumpInCompleted: false,
    showPreBumpIn: false, // New state for pre-bump-in popup
    romanticChoiceCount: 0, // Track romantic choices for achievements
    totalGirlsDated: new Set(), // Track different girls for achievements
    showFarewell: false,
  },

  // Initialize the game
  init: async () => {
    console.log("Initializing Romance Game...");

    // Initialize achievement system if available
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.init();
    }

    // Load romance data
    const dataLoaded = await loadRomanceData();
    if (!dataLoaded) {
      console.warn("Using fallback romance data");
    }

    // Initialize achievement drawer if available
    if (typeof AchievementDrawer !== "undefined") {
      AchievementDrawer.init();
    }

    // Initialize start screen
    RomanceStartScreen.init();
  },

  // Start a new game
  startGame: () => {
    RomanceGame.resetGame();
    RomanceGame.state.currentDay = 1;
    RomanceGame.state.dayType = CONFIG.DAY_TYPES.STORY;
    RomanceGame.state.loveScores = { luna: 0, maya: 0, rose: 0 };
    RomanceGame.state.datesCompleted = 0;
    RomanceGame.state.dateHistory = [];
    RomanceGame.state.romanticChoiceCount = 0;
    RomanceGame.state.totalGirlsDated = new Set();
    RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
      CONFIG.MUSIC_CONTEXTS.PLANNING
    );

    // Track game started achievement
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.trackGameStarted();
    }

    RomanceGame.renderDay();
  },

  // Reset game state
  resetGame: () => {
    if (RomanceGame.state.timerInterval) {
      clearInterval(RomanceGame.state.timerInterval);
      RomanceGame.state.timerInterval = null;
    }

    RomanceGame.state = {
      currentDay: 1,
      dayType: CONFIG.DAY_TYPES.STORY,
      loveScores: { luna: 0, maya: 0, rose: 0 },
      datesCompleted: 0,
      dateHistory: [],
      currentDate: null,
      timer: CONFIG.CHOICE_TIMER,
      timerInterval: null,
      currentMusicTrack: null,
      showResponse: false,
      lastResponse: "",
      showDatingOptions: false,
      ballInviteAccepted: false,
      ballDateGirl: null,
      bumpInCompleted: false,
      showPreBumpIn: false,
      romanticChoiceCount: 0,
      totalGirlsDated: new Set(),
      showFarewell: false,
    };
  },

  // Render current day
  renderDay: () => {
    if (
      RomanceGame.state.currentDay === CONFIG.BUMP_IN_DAY &&
      !RomanceGame.state.bumpInCompleted &&
      !RomanceGame.state.showPreBumpIn
    ) {
      RomanceGame.renderPreBumpInPopup();
    } else if (
      RomanceGame.state.currentDay === CONFIG.BUMP_IN_DAY &&
      !RomanceGame.state.bumpInCompleted &&
      RomanceGame.state.showPreBumpIn
    ) {
      RomanceGame.renderBumpInDay();
    } else if (
      RomanceGame.state.currentDay === CONFIG.BALL_DAY &&
      RomanceGame.state.bumpInCompleted
    ) {
      RomanceGame.renderBallDay();
    } else if (RomanceGame.state.dayType === CONFIG.DAY_TYPES.STORY) {
      RomanceGame.renderStoryDay();
    } else if (RomanceGame.state.dayType === CONFIG.DAY_TYPES.DATE) {
      RomanceGame.renderDateDay();
    }
  },

  // Render pre-bump-in transition popup
  renderPreBumpInPopup: () => {
    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui pre-bump-in-popup">
        <div class="popup-content">
          <h2>🌸 The Next Day... 🌸</h2>
          <div class="transition-text">
            <p>The excitement of your recent dates still lingers in your heart. Tonight is the Grand Spring Ball, and you can't help but wonder who might be waiting for you there...</p>
            <p>You decide to take a walk downtown to pick up some flowers for your corsage. The afternoon sun is warm, and the streets are bustling with other residents preparing for the evening's festivities.</p>
            <p>As you approach the enchanted flower shop, lost in thought about the magical evening ahead, you're not paying attention to where you're walking when suddenly...</p>
          </div>
          <button id="continue-to-bump-in" class="continue-button">
            ✨ Continue ✨
          </button>
        </div>
      </div>
    `;

    // Attach event listener
    document
      .getElementById("continue-to-bump-in")
      .addEventListener("click", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);
        RomanceGame.state.showPreBumpIn = true;
        RomanceGame.renderDay();
      });
  },

  // Get player sprite based on game progress
  getPlayerSprite: () => {
    if (
      RomanceGame.state.currentDay === CONFIG.BALL_DAY &&
      RomanceGame.state.bumpInCompleted
    ) {
      return "player";
    } else if (RomanceGame.state.currentDay >= 5) {
      return "player";
    } else if (RomanceGame.state.currentDay >= 3) {
      return "player";
    } else {
      return "player";
    }
  },

  // Get player expression based on game progress
  getPlayerExpression: () => {
    if (
      RomanceGame.state.currentDay === CONFIG.BALL_DAY &&
      RomanceGame.state.bumpInCompleted
    ) {
      return 10; // Will use dress version
    } else if (RomanceGame.state.currentDay >= 5) {
      return 8; // Happy
    } else if (RomanceGame.state.currentDay >= 3) {
      return 5; // Neutral
    } else {
      return 2; // Skeptical
    }
  },

  // Get if player should use dress
  getPlayerUseDress: () => {
    return (
      RomanceGame.state.currentDay === CONFIG.BALL_DAY &&
      RomanceGame.state.bumpInCompleted
    );
  },

  // Render story days (1, 3, 5)
  renderStoryDay: () => {
    const storyData = getCurrentStoryDay(RomanceGame.state.currentDay);
    if (!storyData) {
      console.error("No story data for day:", RomanceGame.state.currentDay);
      return;
    }

    const container = document.getElementById("game-container");

    container.innerHTML = `
      <div class="romance-ui">
        <div class="status-bar">
          <span>${MESSAGES.UI.DAYS_LABEL} ${RomanceGame.state.currentDay}/${
      CONFIG.TOTAL_DAYS
    } | ${storyData.title}</span>
          <span>Love Levels: Luna(${RomanceGame.state.loveScores.luna}) Maya(${
      RomanceGame.state.loveScores.maya
    }) Rose(${RomanceGame.state.loveScores.rose})</span>
        </div>
        
        <div class="story-section" id="story-section" ${
          RomanceGame.state.showDatingOptions ? 'style="display: none;"' : ""
        }>
          <div class="story-content">
            <img src="${UTILS.getCharacterImagePath(
              RomanceGame.getPlayerSprite(),
              RomanceGame.getPlayerExpression(),
              RomanceGame.getPlayerUseDress()
            )}" 
                 alt="You" class="player-story-image" />
            <p class="story-text">${storyData.text}</p>
          </div>
        </div>

        <div class="dialogue-section" id="dialogue-section" ${
          RomanceGame.state.showDatingOptions ? 'style="display: none;"' : ""
        }>
          ${RomanceGame.renderStoryDialogue(storyData)}
        </div>

        ${
          RomanceGame.state.showDatingOptions &&
          RomanceGame.state.currentDay < CONFIG.BALL_DAY
            ? `
          <div class="dating-options">
            <h3>${MESSAGES.UI.CHOOSE_GIRL}</h3>
            <div class="girl-selection">
              ${Object.values(CONFIG.GIRLS)
                .map(
                  (girl) => `
                <button class="girl-button" data-girl="${girl.id}">
                  <img src="${UTILS.getCharacterImagePath(
                    girl.id,
                    RomanceGame.state.loveScores[girl.id]
                  )}" alt="${girl.name}" class="girl-image" />
                  <div class="girl-info">
                    <h4>${girl.name}</h4>
                    <p>${girl.description}</p>
                    <p class="love-score">${MESSAGES.UI.LOVE_LABEL} ${
                    RomanceGame.state.loveScores[girl.id]
                  }/${CONFIG.MAX_LOVE}</p>
                  </div>
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    RomanceGame.attachStoryEventListeners();
  },

  // Render story dialogue
  renderStoryDialogue: (storyData) => {
    if (RomanceGame.state.showResponse) {
      return `
        <div class="story-response-display">
          <div class="response-bubble-story">
            <p class="story-response">${RomanceGame.state.lastResponse}</p>
          </div>
          <button id="continue-btn" class="continue-button">Continue to Dating</button>
        </div>
      `;
    } else {
      return `
        <div class="story-choices">
          ${storyData.choices
            .map(
              (choice, index) => `
            <button class="choice-button" data-choice="${index}">
              ${choice.text}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }
  },

  // Render date selection for chosen girl
  renderDateSelection: (girlId) => {
    const girl = CONFIG.GIRLS[girlId.toUpperCase()];
    const availableLocations = Object.values(CONFIG.LOCATIONS).filter(
      (location) => {
        // Check if this location hasn't been used yet
        return !RomanceGame.state.dateHistory.some(
          (date) => date.location === location.id
        );
      }
    );

    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui">
        <div class="status-bar">
          <span>${MESSAGES.UI.DAYS_LABEL} ${RomanceGame.state.currentDay}/${
      CONFIG.TOTAL_DAYS
    } | Planning a date with ${girl.name}</span>
        </div>
        
        <div class="girl-focus">
          <img src="${UTILS.getCharacterImagePath(
            girlId,
            RomanceGame.state.loveScores[girlId]
          )}" alt="${girl.name}" class="large-girl-image" />
          <div class="focus-text-holder">
          <h2>Where to take ${girl.name}?</h2>
          <p>${girl.personality}</p>
                  <div class="location-selection">
          <div class="location-grid">
            ${availableLocations
              .map((location) => {
                return `
                <button class="location-button" data-location="${location.id}">
                  <img src="${UTILS.getLocationImagePath(location.id)}" alt="${
                  location.name
                }" class="location-image" />
                  <h4>${location.name}</h4>
                  <p>${location.description}</p>
                </button>
              `;
              })
              .join("")}
          </div>
          
          ${
            availableLocations.length === 0
              ? `
            <p class="no-locations">All locations have been visited!</p>
            <button id="back-to-selection" class="back-button">Choose someone else</button>
          `
              : `
            <button id="back-to-selection" class="back-button">Go back and choose a different woman</button>
          `
          }
        </div>
          </div>
        </div>

    `;

    RomanceGame.attachLocationEventListeners(girlId);
  },

  // Handle asking girl on a date - SIMPLIFIED (no rejection)
  askOnDate: (girlId, locationId) => {
    const girl = CONFIG.GIRLS[girlId.toUpperCase()];
    const location = CONFIG.LOCATIONS[locationId.toUpperCase()];
    const girlLikesLocation = UTILS.doesGirlLikeLocation(girlId, locationId);

    // Girl's response to date suggestion - always positive now
    let response, loveChange;
    if (girlLikesLocation) {
      response = `${girl.name} lights up! "I'd love to go to ${location.name} with you! What a wonderful idea!"`;
      loveChange = 2;
    } else {
      response = `${girl.name} smiles warmly. "Oh, ${location.name}? That sounds interesting! I'd be happy to try something new with you."`;
      loveChange = 1;
    }

    // Update love score
    RomanceGame.state.loveScores[girlId] = UTILS.clampLove(
      RomanceGame.state.loveScores[girlId] + loveChange
    );

    // IMPROVED DATE RESPONSE UI
    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui">
        <div class="status-bar">
          <span>${MESSAGES.UI.DAYS_LABEL} ${RomanceGame.state.currentDay}/${
      CONFIG.TOTAL_DAYS
    } | Date Arranged!</span>
        </div>
        
        <div class="date-response-container">
          <div class="date-response-header">
            <h2>✨ ${girl.name}'s Response ✨</h2>
          </div>
          
          <div class="date-response-content">
            <div class="girl-response-section">

              <img src="${UTILS.getCharacterImagePath(
                girlId,
                RomanceGame.state.loveScores[girlId]
              )}" alt="${girl.name}" class="date-response-girl-image" />

              <div class="response-content-column">
              

                <div class="location-preview">
                  <div class="location-details">
                    <h4>📍 ${location.name}</h4>
                    <p>${location.description}</p>
                  </div>
                  <img src="${UTILS.getLocationImagePath(locationId)}" alt="${
      location.name
    }" class="response-location-image" />
                </div>
                <div class="response-dialogue">
                  <div class="response-bubble">
                    <p class="date-response-text">${response}</p>
                  </div>
                </div>

                <div class="girl-response-info">
                  <p class="love-indicator">💕 Love: ${
                    RomanceGame.state.loveScores[girlId]
                  }/${CONFIG.MAX_LOVE}</p>
                </div>

              </div>
            
            </div>
            
          <div class="date-response-actions">
            <button id="go-on-date" class="date-button" data-girl="${girlId}" data-location="${locationId}">
              💖 Go on the date!
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("go-on-date").addEventListener("click", (e) => {
      const girl = e.target.dataset.girl;
      const location = e.target.dataset.location;
      RomanceGame.startDate(girl, location);
    });
  },

  // Start actual date
  startDate: (girlId, locationId) => {
    RomanceGame.state.currentDate = {
      girl: girlId,
      location: locationId,
      conversationIndex: 0,
    };
    RomanceGame.state.dayType = CONFIG.DAY_TYPES.DATE;
    RomanceGame.state.currentDay++; // Move to next day for the actual date

    // Add to date history
    RomanceGame.state.dateHistory.push({
      girl: girlId,
      location: locationId,
      day: RomanceGame.state.currentDay,
    });

    // Track total girls dated for achievements
    RomanceGame.state.totalGirlsDated.add(girlId);

    // Switch to location-specific music
    let musicContext;
    switch (locationId) {
      case "carnival":
        musicContext = CONFIG.MUSIC_CONTEXTS.CARNIVAL;
        break;
      case "hike":
        musicContext = CONFIG.MUSIC_CONTEXTS.HIKE;
        break;
      case "dinner":
        musicContext = CONFIG.MUSIC_CONTEXTS.DINNER;
        break;
      default:
        musicContext = CONFIG.MUSIC_CONTEXTS.PLANNING;
    }
    RomanceGame.state.currentMusicTrack =
      UTILS.switchBackgroundMusic(musicContext);

    RomanceGame.renderDateDay();
  },

  // Render actual date conversation
  renderDateDay: () => {
    const {
      girl: girlId,
      location: locationId,
      conversationIndex,
    } = RomanceGame.state.currentDate;
    const currentScenario = getDateScenario(
      locationId,
      girlId,
      conversationIndex
    );

    if (!currentScenario) {
      // Date is over, go to next story day or end
      RomanceGame.endDate();
      return;
    }

    // Check if this is the final scenario for this date
    const allScenarios = getAllDateScenarios(locationId, girlId);
    const isFinalScenario = conversationIndex === allScenarios.length - 1;

    const girl = CONFIG.GIRLS[girlId.toUpperCase()];
    const location = CONFIG.LOCATIONS[locationId.toUpperCase()];

    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui date-scene">
        <div class="status-bar">
          <span>${MESSAGES.UI.DAYS_LABEL} ${RomanceGame.state.currentDay}/${
      CONFIG.TOTAL_DAYS
    } | Date with ${girl.name} at ${location.name}</span>
          ${
            !isFinalScenario && !RomanceGame.state.showFarewell
              ? `<span class="timer ${
                  RomanceGame.state.timer <= 3 ? "warning" : ""
                }">${MESSAGES.UI.TIMER_LABEL} ${
                  RomanceGame.state.timer
                }s</span>`
              : '<span class="final-moment">💕 Final Moments 💕</span>'
          }
        </div>
        
        <div class="date-setting">
        <p class="atmosphere">${location.atmosphere}</p>
          <img src="${UTILS.getLocationImagePath(locationId)}" alt="${
      location.name
    }" class="location-bg" />
    
    <div class="location-text">
          <p class="setting-text">${currentScenario.setting}</p>
    </div>
    
        </div>
        
        <div class="date-conversation">
          <div class="girl-section">
            <img src="${UTILS.getCharacterImagePath(
              girlId,
              RomanceGame.state.loveScores[girlId]
            )}" alt="${girl.name}" class="date-girl-image" />
            <h3>${girl.name}</h3>
            <p class="love-indicator">${MESSAGES.UI.LOVE_LABEL} ${
      RomanceGame.state.loveScores[girlId]
    }/${CONFIG.MAX_LOVE}</p>
          </div>
          
          <div class="dialogue-section" id="dialogue-section">
            ${RomanceGame.renderDateDialogue(currentScenario)}
          </div>
        </div>
      </div>
    `;

    RomanceGame.attachDateEventListeners();
    if (
      !RomanceGame.state.showResponse &&
      !RomanceGame.state.showFarewell &&
      !isFinalScenario
    ) {
      RomanceGame.startTimer();
    }
  },

  // Render date dialogue
  renderDateDialogue: (scenario) => {
    if (RomanceGame.state.showFarewell) {
      return `
        <div class="girl-response">
          <p class="response-text farewell-text">${scenario.farewell}</p>
          <button id="continue-date" class="continue-button">Continue</button>
        </div>
      `;
    } else if (RomanceGame.state.showResponse) {
      return `
        <div class="girl-response">
          <p class="response-text">${RomanceGame.state.lastResponse}</p>
          <button id="continue-date" class="continue-button">Continue</button>
        </div>
      `;
    } else {
      return `
        <div class="girl-dialogue">
          <p class="dialogue-text">"${scenario.dialogue}"</p>
        </div>
        <div class="date-choices">
          ${scenario.choices
            .map(
              (choice, index) => `
            <button class="choice-button" data-choice="${index}">
              ${choice.text}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }
  },

  // Handle date choice
  handleDateChoice: (choiceIndex) => {
    if (RomanceGame.state.showResponse || RomanceGame.state.showFarewell)
      return;

    RomanceGame.stopTimer();

    const {
      girl: girlId,
      location: locationId,
      conversationIndex,
    } = RomanceGame.state.currentDate;
    const currentScenario = getDateScenario(
      locationId,
      girlId,
      conversationIndex
    );
    const selectedChoice = currentScenario.choices[choiceIndex];

    // Check if this is the final scenario
    const allScenarios = getAllDateScenarios(locationId, girlId);
    const isFinalScenario = conversationIndex === allScenarios.length - 1;

    // Track romantic choices for achievements
    if (selectedChoice.tags && selectedChoice.tags.includes("romantic")) {
      RomanceGame.state.romanticChoiceCount++;
      if (typeof AchievementManager !== "undefined") {
        AchievementManager.trackRomanticChoice();
      }
    }

    // Apply love change
    const oldLove = RomanceGame.state.loveScores[girlId];
    RomanceGame.state.loveScores[girlId] = UTILS.clampLove(
      oldLove + selectedChoice.love
    );
    const loveChange = RomanceGame.state.loveScores[girlId] - oldLove;

    // Play appropriate sound
    if (loveChange > 0) {
      UTILS.playAudio(CONFIG.AUDIO.LOVE_INCREASE);
    } else if (loveChange < 0) {
      UTILS.playAudio(CONFIG.AUDIO.LOVE_DECREASE);
    }

    // Show response
    RomanceGame.state.lastResponse = selectedChoice.response;
    RomanceGame.state.showResponse = true;

    // Re-render dialogue section
    const dialogueSection = document.getElementById("dialogue-section");
    dialogueSection.innerHTML = RomanceGame.renderDateDialogue(currentScenario);

    // Attach continue button listener
    RomanceGame.attachContinueDateListener(isFinalScenario);
  },

  // Attach continue date listener
  attachContinueDateListener: (isFinalScenario) => {
    const continueBtn = document.getElementById("continue-date");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);

        if (RomanceGame.state.showFarewell) {
          // End the date after farewell
          RomanceGame.endDate();
        } else if (RomanceGame.state.showResponse) {
          if (isFinalScenario) {
            // Show farewell message for final scenario
            const {
              girl: girlId,
              location: locationId,
              conversationIndex,
            } = RomanceGame.state.currentDate;
            const currentScenario = getDateScenario(
              locationId,
              girlId,
              conversationIndex
            );

            if (currentScenario.farewell) {
              RomanceGame.state.showResponse = false;
              RomanceGame.state.showFarewell = true;
              const dialogueSection =
                document.getElementById("dialogue-section");
              dialogueSection.innerHTML =
                RomanceGame.renderDateDialogue(currentScenario);
              RomanceGame.attachContinueDateListener(isFinalScenario);
            } else {
              // No farewell message, just end date
              RomanceGame.endDate();
            }
          } else {
            // Continue to next conversation
            RomanceGame.state.currentDate.conversationIndex++;
            RomanceGame.state.showResponse = false;
            RomanceGame.state.timer = CONFIG.CHOICE_TIMER;
            RomanceGame.renderDateDay();
          }
        }
      });
    }
  },

  // End current date and progress game
  endDate: () => {
    RomanceGame.state.datesCompleted++;
    RomanceGame.state.currentDate = null;
    RomanceGame.state.showResponse = false;
    RomanceGame.state.showFarewell = false;

    // Track achievements
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.trackDateCompleted(
        RomanceGame.state.dateHistory[RomanceGame.state.dateHistory.length - 1]
          .girl
      );
    }

    // Check for three locations achievement
    const uniqueLocations = new Set(
      RomanceGame.state.dateHistory.map((date) => date.location)
    );
    if (
      uniqueLocations.size === 3 &&
      typeof AchievementManager !== "undefined"
    ) {
      AchievementManager.unlockAchievement("three-dates");
    }

    // Check for devoted heart achievement (same girl 3 times)
    const girlCounts = {};
    RomanceGame.state.dateHistory.forEach((date) => {
      girlCounts[date.girl] = (girlCounts[date.girl] || 0) + 1;
    });
    const maxDatesWithOneGirl = Math.max(...Object.values(girlCounts));
    if (
      maxDatesWithOneGirl === 3 &&
      typeof AchievementManager !== "undefined"
    ) {
      AchievementManager.unlockAchievement("devoted-heart");
    }

    // Check for romantic explorer achievement (dated all three girls)
    if (
      RomanceGame.state.totalGirlsDated.size === 3 &&
      typeof AchievementManager !== "undefined"
    ) {
      AchievementManager.unlockAchievement("romantic-explorer");
    }

    // Determine next day
    if (RomanceGame.state.currentDay >= CONFIG.BUMP_IN_DAY) {
      RomanceGame.renderDay(); // Will trigger bump-in or ball logic
    } else {
      // Go to next story day - switch back to planning music
      RomanceGame.state.currentDay++;
      RomanceGame.state.dayType = CONFIG.DAY_TYPES.STORY;
      RomanceGame.state.showDatingOptions = false;
      RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
        CONFIG.MUSIC_CONTEXTS.PLANNING
      );
      RomanceGame.renderDay();
    }
  },

  // Render bump-in day (day 7 before ball)
  renderBumpInDay: () => {
    // Switch to bump-in music
    RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
      CONFIG.MUSIC_CONTEXTS.BUMP_IN
    );

    // Find girl with highest love score
    const maxLove = Math.max(...Object.values(RomanceGame.state.loveScores));
    const bestGirl = Object.keys(RomanceGame.state.loveScores).find(
      (girl) => RomanceGame.state.loveScores[girl] === maxLove
    );

    const girl = CONFIG.GIRLS[bestGirl.toUpperCase()];
    const flowerShop = CONFIG.SPECIAL_LOCATIONS.FLOWER_SHOP;

    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui bump-in-scene">
        <div class="status-bar">
          <span>${MESSAGES.UI.DAYS_LABEL} ${RomanceGame.state.currentDay}/${
      CONFIG.TOTAL_DAYS
    } | An Unexpected Encounter</span>
        </div>
        
        <div class="bump-in-setting">
        <h2>✨ ${flowerShop.name} ✨</h2>
          <img src="${UTILS.getLocationImagePath("flower-shop")}" alt="${
      flowerShop.name
    }" class="location-bg" />
          <div class="setting-description">
            
            <p class="atmosphere">${flowerShop.atmosphere}</p>
          </div>
        </div>
        
        <div class="bump-in-encounter">
          <div class="girl-section">
          <h3>${girl.name}</h3>
            <img src="${UTILS.getCharacterImagePath(
              bestGirl,
              RomanceGame.state.loveScores[bestGirl],
              false
            )}" alt="${girl.name}" class="bump-in-girl-image" />
            
            <p class="love-indicator">💕 Love: ${
              RomanceGame.state.loveScores[bestGirl]
            }/${CONFIG.MAX_LOVE}</p>
          </div>
          
          <div class="bump-in-dialogue">
            <div class="dialogue-bubble">
              <p class="dialogue-text">"Oh! ${
                girl.name === "Luna"
                  ? "What a magical coincidence!"
                  : girl.name === "Maya"
                  ? "Hey there! Fancy meeting you here!"
                  : "How delightfully serendipitous!"
              } I was just picking up flowers for tonight's ball. ${
      maxLove >= CONFIG.VICTORY_LOVE_THRESHOLD
        ? "I was actually hoping I might see you..."
        : "Are you going to the ball too?"
    }"</p>
            </div>
            
            <div class="bump-in-choices">
              <button class="choice-button" id="bump-in-response">
                "${
                  maxLove >= CONFIG.VICTORY_LOVE_THRESHOLD
                    ? "I was hoping to see you too!"
                    : "Yes, I'll be there. Maybe I'll see you around!"
                }"
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach event listener
    document
      .getElementById("bump-in-response")
      .addEventListener("click", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);

        // Show response first
        const responseText =
          maxLove >= CONFIG.VICTORY_LOVE_THRESHOLD
            ? `${girl.name} smiles warmly and takes your hand. 'I was hoping you'd say that... I'll see you tonight at the ball!'`
            : `${girl.name} nods politely. 'Of course! It should be a wonderful evening for everyone.'`;

        // Update the dialogue section to show response
        const dialogueSection = document.querySelector(".bump-in-dialogue");
        dialogueSection.innerHTML = `
          <div class="dialogue-bubble">
            <p class="dialogue-text">${responseText}</p>
          </div>
          <div class="bump-in-choices">
            <button id="continue-to-ball" class="continue-button">
              Continue to the Ball
            </button>
          </div>
        `;

        // Attach continue listener
        document
          .getElementById("continue-to-ball")
          .addEventListener("click", () => {
            RomanceGame.state.bumpInCompleted = true;
            UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);

            // Transition to ball after a brief moment
            setTimeout(() => {
              RomanceGame.renderBallDay();
            }, 500);
          });
      });
  },

  // Render ball day (day 7)
  renderBallDay: () => {
    // Don't switch music yet - we'll do it during the reveal

    // Find girl with highest love score
    const maxLove = Math.max(...Object.values(RomanceGame.state.loveScores));
    const bestGirl = Object.keys(RomanceGame.state.loveScores).find(
      (girl) => RomanceGame.state.loveScores[girl] === maxLove
    );

    const container = document.getElementById("game-container");
    container.innerHTML = `
      <div class="romance-ui ball-entrance">
        <div class="ball-header">
          <h1>🏰 The Grand Spring Ball 🏰</h1>
          <p class="ball-description">You enter the magnificent ballroom. Crystal chandeliers cast dancing shadows across marble floors as elegant couples waltz to the orchestra's melody. Your heart pounds as you scan the room...</p>
        </div>
        
        <div class="ballroom-scene">
          <img src="${CONFIG.IMAGES.BACKGROUND}" alt="Grand Ballroom" class="ballroom-image" />
          <div class="ballroom-atmosphere">
            <p>✨ The air shimmers with magic and possibility ✨</p>
            <p>🎵 Soft orchestral music fills the grand hall 🎵</p>
            <p>💃 Couples dance gracefully under sparkling lights 💃</p>
          </div>
        </div>
        
        <div class="moment-of-truth">
          <button id="reveal-button" class="reveal-button">
            💖 WILL ANYONE BE THERE WAITING FOR YOU? 💖
          </button>
        </div>
      </div>
    `;

    // Attach event listener for the big reveal
    document.getElementById("reveal-button").addEventListener("click", () => {
      RomanceGame.performBallReveal(bestGirl, maxLove);
    });
  },

  // Perform the dramatic ball reveal
  performBallReveal: (bestGirl, maxLove) => {
    UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);

    const container = document.getElementById("game-container");

    // Show enhanced "searching" screen with ballroom reveal image
    container.innerHTML = `
      <div class="romance-ui ball-reveal">
        <div class="reveal-suspense">
          <h2>🔍 Searching the ballroom... 🔍</h2>
          <div class="reveal-graphic">
            <img src="images/ballroom-reveal.png" alt="Ballroom Reveal" class="ballroom-reveal-image" />
            <div class="search-hearts">
              <span class="floating-heart">💕</span>
              <span class="floating-heart">💖</span>
              <span class="floating-heart">💗</span>
              <span class="floating-heart">💝</span>
            </div>
          </div>
          <div class="suspense-dots">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </div>
          <p class="searching-text">Will anyone be there waiting for you?</p>
        </div>
      </div>
    `;

    // After 3 seconds, show the result
    setTimeout(() => {
      // Switch to ballroom music now
      RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
        CONFIG.MUSIC_CONTEXTS.BALLROOM
      );

      const girl = CONFIG.GIRLS[bestGirl.toUpperCase()];
      const canAskToBall = maxLove >= CONFIG.VICTORY_LOVE_THRESHOLD;

      if (canAskToBall) {
        // Someone is there waiting!
        container.innerHTML = `
          <div class="romance-ui ball-day">
            <div class="ball-header">
              <h1>💕 SHE'S THERE! 💕</h1>
              <p>Across the ballroom, you spot ${
                girl.name
              } looking radiant in her ball gown. She catches your eye and smiles warmly, clearly hoping you'll approach...</p>
            </div>
            
            <div class="ball-scene">
              <img src="${UTILS.getCharacterImagePath(
                bestGirl,
                RomanceGame.state.loveScores[bestGirl],
                true
              )}" alt="${girl.name}" class="ball-girl-image" />
              <div class="ball-dialogue">
                <h3>${girl.name}</h3>
                <p class="girl-thoughts">${RomanceGame.getBallDialogue(
                  bestGirl,
                  maxLove
                )}</p>
                
                <div class="ball-choice">
                  <p>✨ This is your moment! Ask her to be your date! ✨</p>
                  <button id="ask-to-ball" class="ball-button" data-girl="${bestGirl}">
                    "${girl.name}, would you like to dance with me?"
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // No one is really interested in romance
        container.innerHTML = `
          <div class="romance-ui ball-day">
            <div class="ball-header">
              <h1>💔 Just Friends 💔</h1>
              <p>You spot ${
                girl.name
              } across the room, but when you approach, it's clear she only sees you as a friend...</p>
            </div>
            
            <div class="ball-scene">
              <img src="${UTILS.getCharacterImagePath(
                bestGirl,
                RomanceGame.state.loveScores[bestGirl],
                true
              )}" alt="${girl.name}" class="ball-girl-image" />
              <div class="ball-dialogue">
                <h3>${girl.name}</h3>
                <p class="girl-thoughts">${RomanceGame.getBallDialogue(
                  bestGirl,
                  maxLove
                )}</p>
                
                <div class="ball-rejection">
                  <p>She's friendly but clearly not interested in romance...</p>
                  <button id="accept-friendship" class="ball-button">
                    "I hope we can be good friends"
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      RomanceGame.attachBallEventListeners();
    }, 3000);
  },

  // Get ball dialogue based on relationship
  getBallDialogue: (girlId, loveLevel) => {
    const responses = {
      luna: {
        high: "Oh! You look so beautiful tonight... I was hoping you'd find me here.",
        medium: "Hello! Isn't this magical? Like a fairy tale come to life!",
        low: "Hi there! Are you enjoying the ball? Everyone looks so lovely tonight.",
      },
      maya: {
        high: "Hey you! I was wondering when you'd show up. You clean up pretty well!",
        medium: "Oh hey! Nice to see a familiar face in all this fancy stuff.",
        low: "Hi! This is all pretty overwhelming, isn't it? So many people...",
      },
      rose: {
        high: "Darling! You look absolutely dashing. I've been saving a dance for someone special...",
        medium:
          "How wonderful to see you! You've chosen quite the elegant evening wear.",
        low: "Oh hello! What a delightful surprise to see you here. Are you enjoying yourself?",
      },
    };

    const level = loveLevel >= 7 ? "high" : loveLevel >= 4 ? "medium" : "low";
    return responses[girlId][level];
  },

  // Timer functions (reused from duck game)
  startTimer: () => {
    RomanceGame.state.timerInterval = setInterval(() => {
      RomanceGame.state.timer--;

      const timerElement = document.querySelector(".timer");
      if (timerElement) {
        timerElement.textContent = `${MESSAGES.UI.TIMER_LABEL} ${RomanceGame.state.timer}s`;
        if (RomanceGame.state.timer <= 3) {
          timerElement.classList.add("warning");
          UTILS.playAudio(CONFIG.AUDIO.CHOICE_HOVER, 0.3);
        }
      }

      if (RomanceGame.state.timer <= 0) {
        // Auto-select first choice when timer runs out
        RomanceGame.handleDateChoice(0);
      }
    }, 1000);
  },

  stopTimer: () => {
    if (RomanceGame.state.timerInterval) {
      clearInterval(RomanceGame.state.timerInterval);
      RomanceGame.state.timerInterval = null;
    }
  },

  // Event listener attachment functions
  attachStoryEventListeners: () => {
    // Story choice buttons
    const choiceButtons = document.querySelectorAll(".choice-button");
    choiceButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const choiceIndex = parseInt(e.target.dataset.choice);
        RomanceGame.handleStoryChoice(choiceIndex);
      });

      button.addEventListener("mouseenter", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_HOVER, 0.4);
      });
    });

    // Girl selection buttons
    const girlButtons = document.querySelectorAll(".girl-button");
    girlButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const girlId = e.currentTarget.dataset.girl;
        RomanceGame.renderDateSelection(girlId);
      });

      // Add hover effect for girl buttons
      button.addEventListener("mouseenter", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_HOVER, 0.4);
      });
    });

    // Continue button
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        RomanceGame.state.showResponse = false;
        RomanceGame.state.showDatingOptions = true;
        RomanceGame.renderStoryDay();
      });
    }
  },

  attachLocationEventListeners: (girlId) => {
    const locationButtons = document.querySelectorAll(".location-button");
    locationButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const locationId = e.currentTarget.dataset.location;
        RomanceGame.askOnDate(girlId, locationId);
      });
    });

    const backBtn = document.getElementById("back-to-selection");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        RomanceGame.renderStoryDay();
      });
    }
  },

  attachDateEventListeners: () => {
    const choiceButtons = document.querySelectorAll(".choice-button");
    choiceButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const choiceIndex = parseInt(e.target.dataset.choice);
        RomanceGame.handleDateChoice(choiceIndex);
      });

      button.addEventListener("mouseenter", () => {
        UTILS.playAudio(CONFIG.AUDIO.CHOICE_HOVER, 0.4);
      });
    });

    // Also attach continue listener if continue button exists
    const continueBtn = document.getElementById("continue-date");
    if (continueBtn) {
      const { conversationIndex } = RomanceGame.state.currentDate;
      const allScenarios = getAllDateScenarios(
        RomanceGame.state.currentDate.location,
        RomanceGame.state.currentDate.girl
      );
      const isFinalScenario = conversationIndex === allScenarios.length - 1;
      RomanceGame.attachContinueDateListener(isFinalScenario);
    }
  },

  attachBallEventListeners: () => {
    const askBtn = document.getElementById("ask-to-ball");
    if (askBtn) {
      askBtn.addEventListener("click", (e) => {
        const girlId = e.target.dataset.girl;
        RomanceGame.state.ballInviteAccepted = true;
        RomanceGame.state.ballDateGirl = girlId;

        // Track ball ready achievement
        if (typeof AchievementManager !== "undefined") {
          AchievementManager.trackBallInvitation(true, girlId);
        }

        // Switch to ballroom music when accepting
        RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
          CONFIG.MUSIC_CONTEXTS.BALLROOM
        );

        RomanceGame.endGame();
      });
    }

    const friendshipBtn = document.getElementById("accept-friendship");
    if (friendshipBtn) {
      friendshipBtn.addEventListener("click", () => {
        RomanceGame.state.ballInviteAccepted = false;

        // Track heartbreaker achievement
        if (typeof AchievementManager !== "undefined") {
          AchievementManager.trackBallInvitation(false, null);
        }

        // Switch to ballroom music for ending
        RomanceGame.state.currentMusicTrack = UTILS.switchBackgroundMusic(
          CONFIG.MUSIC_CONTEXTS.BALLROOM
        );

        RomanceGame.endGame();
      });
    }
  },

  // Handle story choices
  handleStoryChoice: (choiceIndex) => {
    const storyData = getCurrentStoryDay(RomanceGame.state.currentDay);
    const selectedChoice = storyData.choices[choiceIndex];

    UTILS.playAudio(CONFIG.AUDIO.CHOICE_SOUND);

    RomanceGame.state.lastResponse = selectedChoice.response;
    RomanceGame.state.showResponse = true;

    const dialogueSection = document.getElementById("dialogue-section");
    dialogueSection.innerHTML = RomanceGame.renderStoryDialogue(storyData);

    // Attach continue button listener
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        RomanceGame.state.showResponse = false;
        RomanceGame.state.showDatingOptions = true;
        RomanceGame.renderStoryDay();
      });
    }
  },

  // End game and show results
  endGame: () => {
    const endingType = UTILS.getEndingType(
      RomanceGame.state.loveScores,
      RomanceGame.state.ballInviteAccepted,
      RomanceGame.state.ballDateGirl
    );

    // Track achievements
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.trackEnding(endingType);
      if (
        RomanceGame.state.ballInviteAccepted &&
        RomanceGame.state.ballDateGirl &&
        RomanceGame.state.loveScores[RomanceGame.state.ballDateGirl] >= 9
      ) {
        AchievementManager.unlockAchievement("perfect-romance");
      }

      // Check if rejected by all (heartbreaker achievement)
      const maxLove = Math.max(...Object.values(RomanceGame.state.loveScores));
      if (
        !RomanceGame.state.ballInviteAccepted &&
        maxLove < CONFIG.VICTORY_LOVE_THRESHOLD
      ) {
        AchievementManager.unlockAchievement("heartbreaker");
      }
    }

    // Show ending screen
    RomanceEndingScreen.init(RomanceGame.state, endingType);
  },
};

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  RomanceGame.init();
});

// Handle page visibility changes to pause/resume music
document.addEventListener("visibilitychange", () => {
  const allMusicTracks = [
    CONFIG.AUDIO.BACKGROUND_MUSIC_PLANNING,
    CONFIG.AUDIO.BACKGROUND_MUSIC_CARNIVAL,
    CONFIG.AUDIO.BACKGROUND_MUSIC_HIKE,
    CONFIG.AUDIO.BACKGROUND_MUSIC_DINNER,
    CONFIG.AUDIO.BACKGROUND_MUSIC_BUMP_IN,
    CONFIG.AUDIO.BACKGROUND_MUSIC_BALLROOM,
  ];

  if (document.hidden) {
    // Pause all music tracks
    allMusicTracks.forEach((trackId) => {
      const audio = document.getElementById(trackId);
      if (audio && !audio.paused) {
        audio.pause();
      }
    });
  } else {
    // Resume the current track
    if (RomanceGame.state && RomanceGame.state.currentMusicTrack) {
      const currentAudio = document.getElementById(
        RomanceGame.state.currentMusicTrack
      );
      if (currentAudio) {
        currentAudio
          .play()
          .catch((e) => console.log("Music resume failed:", e));
      }
    }
  }
});
