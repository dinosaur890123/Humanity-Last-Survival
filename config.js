const GRID_SIZE = 30;
const PRESTIGE_DEFS = {
    productionBoost: {name: 'Industrial Lore', desc: 'All resource production +15% per level', cost: 5, max: 20},
    frugalBuilders: {name: 'Frugal Builders', desc: 'Construction & upgrade costs -3% per level', cost: 4, max: 20},
    happyHearts: {name: 'Cultural Heritage', desc: 'Global happiness +2 per level', cost: 3, max: 25},
    quickStudies: {name: 'Quick Studies', desc: 'Knowledge production +25% per level', cost: 6, max: 10},
    growthSpurt: {name: 'Baby Boom', desc: 'Population growth rate +20% per level', cost: 4, max: 10},
    startingKit: {name: 'Starting Kit', desc: 'Starting resources +50% per level', cost: 2, max: 6},
};
const DEFAULT_META = {
    prestigePoints: 0,
    totalPrestiges: 0,
    totalKnowledgeEarned: 0,
    totalPopulationEver: 0,
    totalBuildingsBuilt: 0,
    upgrades: {
        productionBoost: 0,
        frugalBuilders: 0,
        happyHearts: 0,
        quickStudies: 0,
        growthSpurt: 0,
        startingKit: 0,
    }
};

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
        unemployedPenalty: 2,
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