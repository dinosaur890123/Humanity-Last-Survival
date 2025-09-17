const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 10}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png' },
    'house': { name: 'House', category: 'Housing', cost: {wood: 20, stone: 10}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 40, stone: 20, glass: 10}, width: 60, height: 60, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png', locked: true },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 100, stone: 80, glass: 50}, width: 60, height: 60, color: '#4b5563', providesCap: 50, providesHappiness: 5, imgSrc: 'assets/skyscraper.png', locked: true },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 30, stone: 10}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.03 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'granary': {
        name: 'Granary',
        category: 'Food',
        cost: {wood: 100, stone: 50},
        width: 60, height: 60,
        color: '#f59e0b',
        imgSrc: 'assets/granary.png',
    },
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 20}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.03 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png' },
    'quarry': {name: 'Quarry', category: 'Resources', cost: {wood: 15, stone: 15}, width: 60, height: 60, color: '#a9a9a9', produces: { stone: 0.015 }, workersRequired: 2, imgSrc: 'assets/quarry.png', consumes: { tools: 0.001 }},
    'sand_pit': {name: 'Sand Pit', category: 'Resources', cost: {wood: 25, stone: 10}, width: 60, height: 60, color: '#eab308', produces: { sand: 0.02 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'sawmill': {
        name: 'Sawmill', 
        category: 'Industry', 
        cost: {wood: 80, stone: 40}, 
        width: 60, height: 60,
        color: '#800000', 
        produces: { wood: 0.08 }, 
        workersRequired: 3, 
        imgSrc: 'assets/sawmill.png', 
        locked: true, 
        consumes: { tools: 0.002 },
        adjacency: {
            bonus: 0.1,
            to: 'wood',
            from: 'woodcutter',
            range: 120
        }
    },
    'glassworks': {name: 'Glassworks', category: 'Industry', cost: {wood: 50, stone: 30}, width: 60, height: 60, color: '#06b6d4', consumes: { sand: 0.02, wood: 0.01, tools: 0.002 }, produces: { glass: 0.01 }, workersRequired: 3, imgSrc: 'assets/glassworks.png', locked: true },
    'toolsmith': {name: 'Toolsmith', category: 'Industry', cost: {wood: 40, stone: 40}, width: 60, height: 60, color: '#f97316', consumes: { wood: 0.01, stone: 0.01 }, produces: { tools: 0.01 }, workersRequired: 2, imgSrc: 'assets/toolsmith.png'},
    'research_lab': {name: 'Research Lab', category: 'Industry', cost: {wood: 100, stone: 50}, width: 60, height: 60, color: '#a78bfa', produces: { knowledge: 0.02 }, workersRequired: 4, imgSrc: 'assets/research_lab.png'},
    'arcology': {
        name: 'Arcology',
        category: 'Special',
        cost: {wood: 500, stone: 500, glass: 250},
        width: 120, height: 120, 
        color: '#2dd4bf',
        providesCap: 200,
        providesHappiness: 20,
        imgSrc: 'assets/arcology.png', 
        locked: true
    },
    'geothermal_plant': {
        name: 'Geothermal Plant',
        category: 'Special',
        cost: {stone: 400, tools: 150, glass: 100},
        width: 60, height: 60,
        color: '#f97316',
        workersRequired: 8,
        imgSrc: 'assets/geothermal_plant.png',
        locked: true,
        globalModifier: {
            type: 'produces',
            multiplier: 1.10
        }
    },
    'victory-project': {
        name: 'Global Seed Vault',
        category: 'Special',
        cost: {wood: 5000, stone: 5000, glass: 500, tools: 500, food: 2000},
        width: 180, height: 180,
        color: '#a855f7',
        imgSrc: 'assets/victory_project.png',
        locked: true,
        globalModifier: { 
            happiness: 25, 
            foodConsumption: 0.75
        }
    },
    'park': { 
        name: 'Park',
        category: 'Life', 
        cost: {wood: 50, stone: 20}, 
        width: 60, height: 60, 
        color: '#22c55e', 
        providesHappiness: 5, 
        imgSrc: 'assets/park.png',
        adjacency: {
            bonus: 2,
            to: 'happiness',
            from: ['shack', 'house', 'apartment', 'skyscraper'],
            range: 90
        }
    },
};

const upgradePaths = {
    'shack': 'house',
    'house': 'apartment',
    'apartment': 'skyscraper'
};

const researchTree = {
    'advanced_woodcutting': { name: 'Advanced Woodcutting', cost: 50, unlocks: ['sawmill'] },
    'glass_blowing': { name: 'Glass Blowing', cost: 100, unlocks: ['glassworks', 'apartment'] },
    'urban_planning': { name: 'Urban Planning', cost: 250, unlocks: ['skyscraper'] },
    'advanced_engineering': { name: 'Advanced Engineering', cost: 500, unlocks: ['geothermal_plant'], requires: ['urban_planning'] },
    'arcology_design': { name: 'Arcology Design', cost: 1000, unlocks: ['arcology'], requires: ['advanced_engineering'] },
    'preservation_protocol': { name: 'Preservation protocol', cost: 2500, unlocks: ['victory_project'], requires: ['arcology_design'] }
};

const scenarios = [
    {
        title: "Tutorial: Establish Shelter",
        objectives: [
            { text: "Build a Shack (open Build then housing)", condition: () => gameState.buildings.some(b => b.type === 'shack' || b.type === 'house'), completed: false },
            { text: "Reach a population of 5 (needs housing)", condition: () => gameState.population >= 5, completed: false },
            { text: "Build a Woodcutter (for Wood income)", condition: () => gameState.buildings.some(b => b.type === 'woodcutter'), completed: false },
            { text: "Assign a worker to the Woodcutter (Manage workers button)", condition: () => gameState.buildings.some(b => b.type === 'woodcutter' && b.workersAssigned > 0), completed: false },
        ]
    },
    {
        title: "The First Skyscraper",
        objectives: [
            { text: "Reach a population of 20", condition: () => gameState.population >= 20, completed: false },
            { text: "Produce 50 Glass", condition: () => gameState.resources.glass >= 50, completed: false },
            { text: "Research Urban Planning", condition: () => gameState.unlockedTechs.includes('urban_planning'), completed: false },
            { text: "Build a Skyscraper", condition: () => gameState.buildings.some(b => b.type === 'skyscraper'), completed: false },
        ]
    }
];

const randomEvents = [
    {
        id: 'refugees',
        title: 'Refugee group arrives',
        description: 'A tired and hungry group of survivors has arrived, pleading for help. What should we do?',
        type: 'choice',
        choices: [
            {
                text: 'Welcome them into the settlement.',
                cost: {food: 50},
                effect: () => {
                    const newPop = Math.min(5, gameState.populationCap - gameState.population);
                    if (newPop > 0) {
                        gameState.population += newPop;
                        gameState.unemployedWorkers += newPop;
                        showMessage(`Gained ${newPop} new citizens.`, 4000);
                    } else {
                        showMessage('You welcomed them, but had no housing space!', 4000);
                    }
                }
            },
            {
                text: 'Give them supplies and send them on.',
                cost: {food: 25, wood: 25},
                effect: () => {
                    showMessage('You helped the refugees on their journey.', 4000);
                    gameState.happiness += 5;
                }
            },
            {
                text: 'Turn them away',
                cost: {},
                effect: () => {
                    gameState.happiness -= 10;
                    showMessage('Your people are unhappy with the cruel decision.', 4000);
                }
            }
        ]
    },
    { id: 'harvest', title: 'Bountiful Harvest!', description: 'Farm production +50%', duration: 60000, modifier: { building: 'farm', type: 'produces', resource: 'food', multiplier: 1.5 } },
    { id: 'immigration', title: 'Immigration Boom!', description: '+5 population', duration: 1000, effect: () => { 
        const newPop = Math.min(5, gameState.populationCap - gameState.population);
        gameState.population += newPop;
        gameState.unemployedWorkers += newPop;
     }},
    { id: 'tool_shortage', title: 'Tool Shortage!', description: 'Tool consumption x2', duration: 45000, modifier: { type: 'consumes', resource: 'tools', multiplier: 2 } },
    { id: 'builders', title: 'Efficient Builders', description: 'Construction costs -20%', duration: 90000, modifier: { type: 'cost', multiplier: 0.8 } },
];