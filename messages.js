// Romance game messages and dialogue system
const MESSAGES = {
  // Ending messages
  ENDINGS: {
    [CONFIG.ENDINGS.PERFECT_ROMANCE]: {
      title: "PERFECT ROMANCE",
      message:
        "True love has blossomed! You and your chosen lioness dance together under the starlit ballroom, hearts beating as one. This is the beginning of a beautiful love story that will be told for generations.",
      color: "#ff69b4",
    },
    [CONFIG.ENDINGS.SWEET_SUCCESS]: {
      title: "SWEET SUCCESS",
      message:
        "Love has found a way! While your romance is still growing, you've won her heart enough for a magical evening together. The ball is perfect, and your future looks bright with possibility.",
      color: "#ff1493",
    },
    [CONFIG.ENDINGS.FRIENDLY_REJECTION]: {
      title: "JUST FRIENDS",
      message:
        "Though romance didn't bloom, you've gained a wonderful friend. She appreciates your company but sees you as a dear friend rather than a romantic partner. Sometimes friendship is just as precious.",
      color: "#ffa500",
    },
    [CONFIG.ENDINGS.AWKWARD_FAILURE]: {
      title: "MISSED CONNECTIONS",
      message:
        "Despite your efforts, the spark just wasn't there. The conversations felt forced and the chemistry never quite clicked. You attend the ball solo, but with lessons learned about love.",
      color: "#ff4500",
    },
    [CONFIG.ENDINGS.ALONE_AT_BALL]: {
      title: "SOLO AT THE BALL",
      message:
        "Your romantic pursuits didn't pan out as hoped. You stand alone at the grand ball, watching other couples dance. But hey, the buffet is excellent and you've got some great stories to tell!",
      color: "#696969",
    },
  },

  // UI text
  UI: {
    GAME_TITLE: "Hearts & Paws",
    TIMER_LABEL: "Time:",
    DAYS_LABEL: "Day",
    LOVE_LABEL: "Love:",
    START_DESCRIPTION: `You're a pink lion woman in the magical kingdom of Lumina.
The Grand Spring Ball is in 7 days, and you need a date!

Choose wisely among three lovely lionesses:
Luna the dreamy artist, Maya the athletic adventurer, 
and Rose the elegant socialite.

You have 3 chances to go on dates and win someone's heart.
Will you find true love in time for the ball?`,
    START_BUTTON: "Begin Your Romance",
    RESTART_BUTTON: "Try Another Romance",
    CHOOSE_GIRL: "Which woman to ask on a date?",
    CHOOSE_LOCATION: "Where would you like to go?",
    BALL_NIGHT: "The Grand Spring Ball",
    FINAL_LOVE_LABEL: "Final Love Levels:",
    DAYS_COMPLETED_LABEL: "Days Completed:",
    TOTAL_DATES_LABEL: "Total Dates:",
    BALL_OUTCOME_LABEL: "Ball Outcome:",
  },
};

// Game dialogue data - loaded from date-data.json
let ROMANCE_DATA = {};

// Load game dialogue from JSON file
const loadRomanceData = async () => {
  try {
    const response = await fetch("date-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    ROMANCE_DATA = await response.json();
    console.log("Romance game data loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to load romance game data:", error);
    // Fallback data in case JSON fails to load
    ROMANCE_DATA = {
      storyDays: {
        1: {
          title: "The Royal Ball Announcement",
          text: "You're a pink lion woman living in the magical kingdom of Lumina. A royal proclamation announces the Grand Spring Ball in just 7 days!",
          choices: [
            {
              text: "This is my chance for romance!",
              response: "Your heart flutters with excitement.",
            },
            {
              text: "I should probably find someone...",
              response: "You take a deep breath and steel your nerves.",
            },
            {
              text: "Maybe I could go alone?",
              response:
                "But deep down, you know it would be more magical with someone special.",
            },
          ],
        },
      },
      dateScenarios: {
        carnival: {
          luna: [
            {
              setting:
                "You and Luna stroll through the carnival as fairy lights twinkle overhead",
              dialogue:
                "Oh my! Look at all these colors! It's like walking through a painting.",
              choices: [
                {
                  text: "Want to try the ferris wheel?",
                  response:
                    "Luna's eyes light up. 'Yes! We can see the whole world from up there!'",
                  tags: ["romantic", "adventurous"],
                  love: 2,
                },
                {
                  text: "The cotton candy looks good",
                  response:
                    "Luna giggles. 'It's like eating sweet clouds! How whimsical!'",
                  tags: ["creative"],
                  love: 1,
                },
                {
                  text: "This place is pretty crowded",
                  response:
                    "Luna tilts her head. 'But that means more joy to share, doesn't it?'",
                  tags: ["practical"],
                  love: -1,
                },
                {
                  text: "You look beautiful in this light",
                  response:
                    "Luna blushes deeply. 'You make everything more magical...'",
                  tags: ["romantic"],
                  love: 2,
                },
              ],
            },
          ],
        },
      },
    };
    return false;
  }
};

// Get current story day data
const getCurrentStoryDay = (dayIndex) => {
  if (ROMANCE_DATA.storyDays && ROMANCE_DATA.storyDays[dayIndex]) {
    return ROMANCE_DATA.storyDays[dayIndex];
  }
  return null;
};

// Get date scenario data
const getDateScenario = (locationId, girlId, scenarioIndex) => {
  if (
    ROMANCE_DATA.dateScenarios &&
    ROMANCE_DATA.dateScenarios[locationId] &&
    ROMANCE_DATA.dateScenarios[locationId][girlId] &&
    ROMANCE_DATA.dateScenarios[locationId][girlId][scenarioIndex]
  ) {
    return ROMANCE_DATA.dateScenarios[locationId][girlId][scenarioIndex];
  }
  return null;
};

// Get all scenarios for a location and girl
const getAllDateScenarios = (locationId, girlId) => {
  if (
    ROMANCE_DATA.dateScenarios &&
    ROMANCE_DATA.dateScenarios[locationId] &&
    ROMANCE_DATA.dateScenarios[locationId][girlId]
  ) {
    return ROMANCE_DATA.dateScenarios[locationId][girlId];
  }
  return [];
};
