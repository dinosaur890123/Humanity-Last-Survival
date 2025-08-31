const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const woodCountElement = document.getElementById('wood-count');
const stoneCountElement = document.getElementById('stone-count');
const foodCountElement = document.getElementById('food-count');
const sandCountElement = document.getElementById('sand-count');
const glassCountElement = document.getElementById('glass-count');
const toolsCountElement = document.getElementById('tools-count');
const knowledgeCountElement = document.getElementById('knowledge-count');
const populationCountElement = document.getElementById('population-count');
const populationCapElement = document.getElementById('population-cap');
const unemployedWorkersElement = document.getElementById('unemployed-workers-count');
const happinessElement = document.getElementById('happiness-count');
const buildMenuElement = document.getElementById('build-menu');
const researchPanelElement = document.getElementById('research-panel');
const messageBoxElement = document.getElementById('message-box');
const scenarioTitleElement = document.getElementById('scenario-title');
const objectivesListElement = document.getElementById('objectives-list');
const scenarioToggleIcon = document.getElementById('scenario-toggle-icon');
const openWorkerPanelButton = document.getElementById('open-worker-panel-button');
const workerPanelModal = document.getElementById('worker-panel-modal');
const closeWorkerPanelButton = document.getElementById('close-worker-panel-button');
const workerAssignmentsList = document.getElementById('worker-assignments-list');
const statsPanelModal = document.getElementById('stats-panel-modal');
const statsName = document.getElementById('stats-name');
const statsImage = document.getElementById('stats-image');
const statsList = document.getElementById('stats-list');
const closeStatsPanelButton = document.getElementById('close-stats-panel-button');
const newGameButton = document.getElementById('settings-new-game-button');
const eventBar = document.getElementById('event-notification-bar');
const eventTitle = document.getElementById('event-title');
const eventDescription = document.getElementById('event-description');
const eventProgressBar = document.getElementById('event-progress-bar');
const selectedBuildingInfo = document.getElementById('selected-building-info');

const GRID_SIZE = 30;

const GAME_CONFIG = {
    initialResources: {wood: 50, stone: 50, food: 100, sand: 0, glass: 0, tools: 20, knowledge: 0 },
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
let gameState = {
    resources: {...GAME_CONFIG.initialResources},
    buildings: [],
    environment: [],
    floatingTexts: [],
    population: 0,
    unemployedWorkers: 0,
    populationCap: 0,
    happiness: 100,
    buildMode: null,
    selectedBuilding: null,
    unlockedTechs: [],
    currentScenarioIndex: 0,
    currentObjectiveIndex: 0,
    scenarioComplete: false,
    activeEvent: null,
    nextEventTime: 0,
};

const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 10}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png' },
    'house': { name: 'House', category: 'Housing', cost: {wood: 20, stone: 10}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 40, stone: 20, glass: 10}, width: 60, height: 60, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png', locked: true },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 100, stone: 80, glass: 50}, width: 60, height: 60, color: '#4b5563', providesCap: 50, providesHappiness: 5, imgSrc: 'assets/skyscraper.png', locked: true },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 30, stone: 10}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.03 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 20}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.02 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png' },
    'quarry': {name: 'Quarry', category: 'Resources', cost: {wood: 15, stone: 15}, width: 60, height: 60, color: '#a9a9a9', produces: { stone: 0.015 }, workersRequired: 2, imgSrc: 'assets/quarry.png', consumes: { tools: 0.001 }},
    'sand_pit': {name: 'Sand Pit', category: 'Resources', cost: {wood: 25, stone: 10}, width: 60, height: 60, color: '#eab308', produces: { sand: 0.02 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'sawmill': {name: 'Sawmill', category: 'Industry', cost: {wood: 80, stone: 40}, width: 60, height: 60, color: '#800000', produces: { wood: 0.08 }, workersRequired: 3, imgSrc: 'assets/sawmill.png', locked: true, consumes: { tools: 0.002 }},
    'glassworks': {name: 'Glassworks', category: 'Industry', cost: {wood: 50, stone: 30}, width: 60, height: 60, color: '#06b6d4', consumes: { sand: 0.02, wood: 0.01, tools: 0.002 }, produces: { glass: 0.01 }, workersRequired: 3, imgSrc: 'assets/glassworks.png', locked: true },
    'toolsmith': {name: 'Toolsmith', category: 'Industry', cost: {wood: 40, stone: 40}, width: 60, height: 60, color: '#f97316', consumes: { wood: 0.01, stone: 0.01 }, produces: { tools: 0.01 }, workersRequired: 2, imgSrc: 'assets/toolsmith.png'},
    'research_lab': {name: 'Research Lab', category: 'Industry', cost: {wood: 100, stone: 50}, width: 60, height: 60, color: '#a78bfa', produces: { knowledge: 0.02 }, workersRequired: 4, imgSrc: 'assets/research_lab.png'},
    'park': { name: 'Park', category: 'Life', cost: {wood: 50, stone: 20}, width: 60, height: 60, color: '#22c55e', providesHappiness: 5, imgSrc: 'assets/park.png' },
}

const researchTree = {
    'advanced_woodcutting': { name: 'Advanced Woodcutting', cost: 50, unlocks: ['sawmill'] },
    'glass_blowing': { name: 'Glass Blowing', cost: 100, unlocks: ['glassworks', 'apartment'] },
    'urban_planning': { name: 'Urban Planning', cost: 250, unlocks: ['skyscraper'] },
};

const scenarios = [
    {
        title: "Getting Started",
        objectives: [
            { text: "Build a Shack or House", condition: () => gameState.buildings.some(b => b.type === 'shack' || b.type === 'house'), completed: false },
            { text: "Reach a population of 5", condition: () => gameState.population >= 5, completed: false },
            { text: "Build a Woodcutter", condition: () => gameState.buildings.some(b => b.type === 'woodcutter'), completed: false },
            { text: "Assign a worker to the Woodcutter", condition: () => gameState.buildings.some(b => b.type === 'woodcutter' && b.workersAssigned > 0), completed: false },
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
    { id: 'harvest', title: 'Bountiful Harvest!', description: 'Farm production +50%', duration: 60000, modifier: { building: 'farm', type: 'produces', resource: 'food', multiplier: 1.5 } },
    { id: 'immigration', title: 'Immigration Boom!', description: '+5 population', duration: 1000, effect: () => { 
        const newPop = Math.min(5, gameState.populationCap - gameState.population);
        gameState.population += newPop;
        gameState.unemployedWorkers += newPop;
     }},
    { id: 'tool_shortage', title: 'Tool Shortage!', description: 'Tool consumption x2', duration: 45000, modifier: { type: 'consumes', resource: 'tools', multiplier: 2 } },
    { id: 'builders', title: 'Efficient Builders', description: 'Construction costs -20%', duration: 90000, modifier: { type: 'cost', multiplier: 0.8 } },
];

function loadImages() {
    for (const type in buildingBlueprints) {
        const blueprint = buildingBlueprints[type];
        if (blueprint.imgSrc) {
            blueprint.img = new Image();
            blueprint.img.src = blueprint.imgSrc;
            blueprint.img.onerror = () => {
                console.error(`Error loading image for ${type}: ${blueprint.imgSrc}`);
                blueprint.img.failed = true;
            };
        }
    }
}

function saveGame() {
    localStorage.setItem('humanitySurvivalSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem('humanitySurvivalSave');
    if (savedGame) {
        gameState = JSON.parse(savedGame);
        if (!gameState.environment) gameState.environment = [];
        if (!gameState.floatingTexts) gameState.floatingTexts = [];
        scenarios.forEach((scenario, sIndex) => {
            scenario.objectives.forEach((obj, oIndex) => {
                if (sIndex < gameState.currentScenarioIndex || (sIndex === gameState.currentScenarioIndex && oIndex < gameState.currentObjectiveIndex)) {
                    obj.completed = true;
                } else {
                    obj.completed = false;
                }
            });
        });
    } else {
    }
}

function updateScenario() {
    if (gameState.scenarioComplete) return;

    const currentScenario = scenarios[gameState.currentScenarioIndex];
    const currentObjective = currentScenario.objectives[gameState.currentObjectiveIndex];

    if (currentObjective && currentObjective.condition()) {
        currentObjective.completed = true;
        gameState.currentObjectiveIndex++;
        populateScenarioPanel();

        if (gameState.currentObjectiveIndex >= currentScenario.objectives.length) {
            gameState.currentScenarioIndex++;
            if (gameState.currentScenarioIndex >= scenarios.length) {
                gameState.scenarioComplete = true;
                showMessage("All Scenarios Complete! You Win!", 10000);
            } else {
                gameState.currentObjectiveIndex = 0;
                showMessage(`Scenario Complete! Next: ${scenarios[gameState.currentScenarioIndex].title}`, 5000);
                scenarios[gameState.currentScenarioIndex].objectives.forEach(o => o.completed = false);
                populateScenarioPanel();
            }
        }
    }
}

function updateEvents(timestamp) {
    if (!gameState.nextEventTime) {
        gameState.nextEventTime = timestamp + GAME_CONFIG.timers.eventIntervalMin + Math.random() * GAME_CONFIG.timers.eventIntervalRandom;
    }

    if (timestamp >= gameState.nextEventTime && !gameState.activeEvent) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        gameState.activeEvent = { ...event, startTime: timestamp };
        eventBar.classList.remove('hidden');
        eventTitle.textContent = event.title;
        eventDescription.textContent = event.description;
        if (event.effect) event.effect();
        gameState.nextEventTime = 0;
    }

    if (gameState.activeEvent) {
        const elapsed = timestamp - gameState.activeEvent.startTime;
        const progress = 1 - (elapsed / gameState.activeEvent.duration);
        eventProgressBar.style.width = `${progress * 100}%`;

        if (elapsed >= gameState.activeEvent.duration) {
            gameState.activeEvent = null;
            eventBar.classList.add('hidden');
        }
    }
}

function createFloatingText(text, x, y, color = '#ffffff') {
    gameState.floatingTexts.push({ text, x, y, color, duration: 100, maxDuration: 100 });
}

function updateFloatingTexts() {
    gameState.floatingTexts = gameState.floatingTexts.filter(ft => ft.duration > 0);
    gameState.floatingTexts.forEach(ft => {
        ft.y -= 0.5;
        ft.duration--;
    });
}

function update() {
    updateScenario();

    let baseHappiness = 50;
    let happinessFactors = 0;
    happinessFactors += (gameState.resources.food > 0) ? 20 : -30;
    happinessFactors -= gameState.unemployedWorkers * 2;
    for(const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (blueprint.providesHappiness) {
            happinessFactors += blueprint.providesHappiness;
        }
    }
    let targetHappiness = baseHappiness + happinessFactors;
    if (targetHappiness > 100) targetHappiness = 100;
    if (targetHappiness < 0) targetHappiness = 0;
    gameState.happiness += (targetHappiness - gameState.happiness) * 0.0005;

    let happinessModifier = 1;
    if (gameState.happiness > 70) happinessModifier = 1.1;
    if (gameState.happiness < 30) happinessModifier = 0.8;

    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        building.needsTools = false;
        if (building.workersAssigned > 0) {
            let productionModifier = 1.0;
            let canProduce = true;

            if (blueprint.consumes) {
                if (blueprint.consumes.tools && gameState.resources.tools < blueprint.consumes.tools) {
                    productionModifier = 0.5;
                    building.needsTools = true;
                }

                for (const resource in blueprint.consumes) {
                    if (resource !== 'tools' && gameState.resources[resource] < blueprint.consumes[resource]) {
                        canProduce = false;
                        break;
                    }
                }
            }
            
            if (canProduce) {
                if (blueprint.consumes) {
                    for (const resource in blueprint.consumes) {
                        let consumptionRate = blueprint.consumes[resource];
                        if (gameState.activeEvent?.modifier?.type === 'consumes' && gameState.activeEvent.modifier.resource === resource) {
                            consumptionRate *= gameState.activeEvent.modifier.multiplier;
                        }
                        gameState.resources[resource] -= consumptionRate;
                    }
                }
                if (blueprint.produces) {
                    for (const resource in blueprint.produces) {
                        let productionRate = blueprint.produces[resource];
                        if (gameState.activeEvent?.modifier?.building === building.type && gameState.activeEvent.modifier.resource === resource) {
                            productionRate *= gameState.activeEvent.modifier.multiplier;
                        }
                        const finalProduction = productionRate * building.workersAssigned * happinessModifier * productionModifier;
                        gameState.resources[resource] += finalProduction;
                        if (finalProduction > 0 && Math.random() < 0.05) {
                             createFloatingText(`+${(finalProduction * 60).toFixed(2)}`, building.x + building.width / 2, building.y);
                        }
                    }
                }
            }
        }
    }

    if (gameState.population > 0) {
        const foodConsumed = gameState.population * 0.002;
        gameState.resources.food -= foodConsumed;

        if (gameState.resources.food < 0) {
            gameState.resources.food = 0;
        }
    }

    let newPopCap = 0;
    for (const building of gameState.buildings) {
        if (buildingBlueprints[building.type].providesCap) {
            newPopCap += buildingBlueprints[building.type].providesCap;
        }
    }
    gameState.populationCap = newPopCap;

    if (gameState.population < gameState.populationCap) {
        const growthChance = (gameState.population === 0) ? 0.01 : 0.008;
        if (Math.random() < growthChance) {
            gameState.population++;
            gameState.unemployedWorkers++;
        }
    }
    updateFloatingTexts();
}

function isImageReady(blueprint) {
    return blueprint.img && blueprint.img.complete && !blueprint.img.failed && blueprint.img.naturalWidth !== 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);


    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (building === gameState.selectedBuilding) {
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 3;
            ctx.strokeRect(building.x - 2, building.y - 2, building.width + 4, building.height + 4);
        }

        if (isImageReady(blueprint)) {
            if (blueprint.workersRequired > 0 && building.workersAssigned === 0) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(blueprint.img, building.x, building.y, building.width, building.height);
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = building.color;
            if (blueprint.workersRequired > 0 && building.workersAssigned === 0) {
                ctx.globalAlpha = 0.5;
            }
            ctx.fillRect(building.x, building.y, building.width, building.height);
            ctx.globalAlpha = 1.0;
        }
        
        if (building.needsTools) {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛠️', building.x + building.width / 2, building.y - 5);
        }

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(building.x, building.y, building.width, building.height);
    }

    if (gameState.buildMode && mousePos.x !== null) {
        const blueprint = buildingBlueprints[gameState.buildMode];
        const snappedX = Math.round((mousePos.x - blueprint.width / 2) / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round((mousePos.y - blueprint.height) / GRID_SIZE) * GRID_SIZE;
        ctx.globalAlpha = 0.5;
        if (isImageReady(blueprint)) {
            ctx.drawImage(blueprint.img, snappedX, snappedY, blueprint.width, blueprint.height);
        } else {
            ctx.fillStyle = blueprint.color;
            ctx.fillRect(snappedX, snappedY, blueprint.width, blueprint.height);
        }
        ctx.globalAlpha = 1.0;
    }

    for (const ft of gameState.floatingTexts) {
        ctx.globalAlpha = ft.duration / ft.maxDuration;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;


    if (woodCountElement) woodCountElement.textContent = Math.floor(gameState.resources.wood);
    if (stoneCountElement) stoneCountElement.textContent = Math.floor(gameState.resources.stone);
    if (foodCountElement) foodCountElement.textContent = Math.floor(gameState.resources.food);
    if (sandCountElement) sandCountElement.textContent = Math.floor(gameState.resources.sand);
    if (glassCountElement) glassCountElement.textContent = Math.floor(gameState.resources.glass);
    if (toolsCountElement) toolsCountElement.textContent = Math.floor(gameState.resources.tools);
    if (knowledgeCountElement) knowledgeCountElement.textContent = Math.floor(gameState.resources.knowledge);
    if (populationCountElement) populationCountElement.textContent = gameState.population;
    if (populationCapElement) populationCapElement.textContent = gameState.populationCap;
    if (unemployedWorkersElement) unemployedWorkersElement.textContent = gameState.unemployedWorkers;
    if (happinessElement) happinessElement.textContent = Math.floor(gameState.happiness);
}

function gameLoop(timestamp) {
    updateEvents(timestamp);
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

const mousePos = { x: null, y: null };
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (gameState.buildMode) {
        placeBuilding();
        return;
    }
    
    gameState.selectedBuilding = getBuildingAt(mousePos.x, mousePos.y);
});

function placeBuilding() {
    const blueprint = buildingBlueprints[gameState.buildMode];
    let costModifier = 1.0;
    if (gameState.activeEvent?.modifier?.type === 'cost') {
        costModifier = gameState.activeEvent.modifier.multiplier;
    }

    let canAfford = true;
    for (const resource in blueprint.cost) {
        if (gameState.resources[resource] < blueprint.cost[resource] * costModifier) {
            canAfford = false;
            showMessage(`Not enough ${resource}!`, 2000);
            break;
        }
    }

    if (canAfford) {
        for (const resource in blueprint.cost) {
            gameState.resources[resource] -= blueprint.cost[resource] * costModifier;
        }

        const snappedX = Math.round((mousePos.x - blueprint.width / 2) / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round((mousePos.y - blueprint.height) / GRID_SIZE) * GRID_SIZE;

        const newBuilding = {
            type: gameState.buildMode,
            x: snappedX,
            y: snappedY,
            width: blueprint.width,
            height: blueprint.height,
            color: blueprint.color,
            workersAssigned: 0,
        };
        gameState.buildings.push(newBuilding);
        
        gameState.buildMode = null;
        canvas.classList.remove('build-cursor');
    }
}

function getBuildingAt(x, y) {
    for (let i = gameState.buildings.length - 1; i >= 0; i--) {
        const building = gameState.buildings[i];
        if (x > building.x && x < building.x + building.width &&
            y > building.y && y < building.y + building.height) {
            return building;
        }
    }
    return null;
}

function setupEventListeners() {
    scenarioTitleElement.addEventListener('click', () => {
        objectivesListElement.classList.toggle('collapsed');
        if (objectivesListElement.classList.contains('collapsed')) {
            scenarioToggleIcon.style.transform = 'rotate(-90deg)';
        } else {
            scenarioToggleIcon.style.transform = 'rotate(0deg)';
        }
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameState.buildMode) {
            gameState.buildMode = null;
            canvas.classList.remove('build-cursor');
            showMessage('Build cancelled.', 1500);
        }
    });
    openWorkerPanelButton.addEventListener('click', () => {
        workerPanelModal.classList.remove('hidden');
        populateWorkerPanel();
    });

    closeWorkerPanelButton.addEventListener('click', () => {
        workerPanelModal.classList.add('hidden');
    });

    closeStatsPanelButton.addEventListener('click', () => {
        statsPanelModal.classList.add('hidden');
    });
    
    newGameButton.addEventListener('click', () => {
        if (confirm('Are you sure? Your current progress will be lost.')) {
            localStorage.removeItem('humanitySurvivalSave');
            window.location.reload();
        }
    });
}

let messageTimeout;
function showMessage(text, duration) {
    messageBoxElement.textContent = text;
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        messageBoxElement.textContent = '';
    }, duration);
}

function refreshUI() {
    populateBuildMenu();
    populateResearchPanel();
    populateScenarioPanel();
    if (!workerPanelModal.classList.contains('hidden')) {
        populateWorkerPanel();
    }
}

function populateScenarioPanel() {
    const currentScenario = scenarios[gameState.currentScenarioIndex];
    if (!currentScenario) return;

    scenarioTitleElement.firstChild.textContent = currentScenario.title + ' ';
    objectivesListElement.innerHTML = '';
    currentScenario.objectives.forEach((obj, index) => {
        const li = document.createElement('li');
        li.textContent = obj.text;
        if (obj.completed) {
            li.className = 'completed';
        } else if (index === gameState.currentObjectiveIndex) {
            li.className = 'active';
        }
        objectivesListElement.appendChild(li);
    });
}

function populateBuildMenu() {
    buildMenuElement.innerHTML = ''; 
    const categories = {};

    for (const type in buildingBlueprints) {
        const blueprint = buildingBlueprints[type];
        if (blueprint.locked && !gameState.unlockedTechs.some(techId => researchTree[techId]?.unlocks.includes(type))) {
            continue;
        }

        if (!categories[blueprint.category]) {
            categories[blueprint.category] = [];
        }
        categories[blueprint.category].push({type, ...blueprint});
    }

    const categoryOrder = ['Housing', 'Food', 'Resources', 'Industry', 'Life'];

    for (const categoryName of categoryOrder) {
        if (!categories[categoryName]) continue;

        const header = document.createElement('h2');
        header.textContent = categoryName;
        header.className = 'build-category-header';
        buildMenuElement.appendChild(header);

        for (const building of categories[categoryName]) {
            const button = document.createElement('button');
            
            let costString = Object.entries(building.cost)
                .map(([res, val]) => `${val} ${res}`)
                .join(', ');

            let infoParts = [`Cost: ${costString}`];
            if (building.providesCap) {
                infoParts.push(`Capacity: ${building.providesCap}`);
            }
            if (building.providesHappiness) {
                infoParts.push(`Happiness: +${building.providesHappiness}`);
            }
            let additionalInfo = infoParts.join(' | ');

            button.innerHTML = `${building.name} <br><small>${additionalInfo}</small>`;
            
            button.addEventListener('click', () => {
                gameState.buildMode = building.type;
                canvas.classList.add('build-cursor');
            });

            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showStatsPanel(building.type);
            });
            
            buildMenuElement.appendChild(button);
        }
    }
}

function showStatsPanel(type) {
    const blueprint = buildingBlueprints[type];
    statsName.textContent = blueprint.name;
    statsImage.src = blueprint.imgSrc;
    statsList.innerHTML = '';

    const createStat = (label, value) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${label}:</strong> ${value}`;
        statsList.appendChild(li);
    };

    if (blueprint.providesCap) createStat('Capacity', blueprint.providesCap);
    if (blueprint.providesHappiness) createStat('Happiness', `+${blueprint.providesHappiness}`);
    if (blueprint.workersRequired) createStat('Workers', blueprint.workersRequired);
    if (blueprint.produces) createStat('Produces', Object.entries(blueprint.produces).map(([k,v]) => `${(v*60).toFixed(2)}/min ${k}`).join(', '));
    if (blueprint.consumes) createStat('Consumes', Object.entries(blueprint.consumes).map(([k,v]) => `${(v*60).toFixed(2)}/min ${k}`).join(', '));
    
    statsPanelModal.classList.remove('hidden');
}

function populateWorkerPanel() {
    workerAssignmentsList.innerHTML = '';
    const workplaces = gameState.buildings.filter(b => buildingBlueprints[b.type].workersRequired);

    if (workplaces.length === 0) {
        workerAssignmentsList.innerHTML = '<li>No workplaces built yet.</li>';
        return;
    }

    workplaces.forEach(building => {
        const blueprint = buildingBlueprints[building.type];
        const li = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = blueprint.name;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'worker-buttons';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.alignItems = 'center';
        controlsDiv.style.gap = '0.5rem';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '-';
        removeBtn.onclick = () => {
            if (building.workersAssigned > 0) {
                building.workersAssigned--;
                gameState.unemployedWorkers++;
                refreshUI();
            }
        };

        const statusSpan = document.createElement('span');
        statusSpan.textContent = `${building.workersAssigned}/${blueprint.workersRequired}`;

        const addBtn = document.createElement('button');
        addBtn.textContent = '+';
        addBtn.onclick = () => {
            if (gameState.unemployedWorkers > 0 && building.workersAssigned < blueprint.workersRequired) {
                building.workersAssigned++;
                gameState.unemployedWorkers--;
                refreshUI();
            }
        };

        controlsDiv.appendChild(removeBtn);
        controlsDiv.appendChild(statusSpan);
        controlsDiv.appendChild(addBtn);

        li.appendChild(nameSpan);
        li.appendChild(controlsDiv);
        workerAssignmentsList.appendChild(li);
    });
}

function populateResearchPanel() {
    researchPanelElement.innerHTML = '';
    for (const techId in researchTree) {
        const tech = researchTree[techId];
        const button = document.createElement('button');
        
        const isUnlocked = gameState.unlockedTechs.includes(techId);
        
        button.innerHTML = `${tech.name}<br><small>Cost: ${tech.cost} Knowledge</small>`;
        button.disabled = isUnlocked || gameState.resources.knowledge < tech.cost;
        
        if (isUnlocked) {
            button.innerHTML += `<br><small>Researched</small>`;
        }

        button.addEventListener('click', () => {
            if (gameState.resources.knowledge >= tech.cost) {
                gameState.resources.knowledge -= tech.cost;
                gameState.unlockedTechs.push(techId);
                tech.unlocks.forEach(buildingId => {
                    buildingBlueprints[buildingId].locked = false;
                });
                refreshUI();
            }
        });
        researchPanelElement.appendChild(button);
    }
}

function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');
}
function generateEnvironment() {
    gameState.environment = [];
}

function init() {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
    
    loadGame();
    loadImages();
    setupEventListeners();
    refreshUI();
    
    setInterval(saveGame, 10000);
    requestAnimationFrame(gameLoop);
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});

init();
