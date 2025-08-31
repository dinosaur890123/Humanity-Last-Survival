const GRID_SIZE = 30;

const GAME_CONFIG = {
    initialResources: { wood: 50, stone: 50, food: 100, sand: 0, glass: 0, tools: 20, knowledge: 0 },
    rates: {
        foodConsumption: 0.002,
        populationGrowthChance: 0.008,
        initialPopulationGrowthChance: 0.01,
        happinessChangeSpeed: 0.0005
    },
    happiness: {
        base: 50,
        foodBonus: 20,
        foodPenalty: -30,
        unemployedPenalty: -2,
        highHappinessThreshold: 70,
        lowHappinessThreshold: 30,
        highHappinessModifier: 1.1,
        lowHappinessModifier: 0.8
    },
    production: {
        noToolsModifier: 0.5
    },
    timers: {
        saveInterval: 10000,
        eventIntervalMin: 60000,
        eventIntervalRandom: 60000
    }
};

const UPGRADE_COST_MULTIPLIER = 0.75;