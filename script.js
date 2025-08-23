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
let scenarioToggleIcon = document.getElementById('scenario-toggle-icon');

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
const openHelpButton = document.getElementById('open-help-button');
const helpModal = document.getElementById('help-modal');
const closeHelpButton = document.getElementById('close-help-button');

function fadeIn(el){ if(!el) return; el.classList.remove('hidden'); el.style.opacity=0; el.style.transition='opacity .25s ease'; requestAnimationFrame(()=>{ el.style.opacity=1; }); }
function fadeOut(el){ if(!el) return; el.style.transition='opacity .25s ease'; el.style.opacity=0; const handler=()=>{ el.classList.add('hidden'); el.style.transition=''; el.removeEventListener('transitionend', handler); }; el.addEventListener('transitionend', handler); }

const eventBar = document.getElementById('event-notification-bar');
const eventTitle = document.getElementById('event-title');
const eventDescription = document.getElementById('event-description');
const eventProgressBar = document.getElementById('event-progress-bar');

let gameState = {
    resources: { wood: 30, stone: 15, food: 60, sand: 0, glass: 0, tools: 5, knowledge: 0 },
    buildings: [],
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
    saveVersion: 1,
};

const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 12}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png' },
    'house': { name: 'House', category: 'Housing', cost: {wood: 28, stone: 14}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 70, stone: 40, glass: 25, tools: 8}, width: 60, height: 60, color: '#06b6d4', providesCap: 18, providesHappiness: 3, imgSrc: 'assets/apartment.png', locked: true },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 250, stone: 220, glass: 120, tools: 40}, width: 60, height: 60, color: '#4b5563', providesCap: 55, providesHappiness: 8, imgSrc: 'assets/skyscraper.png', locked: true },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 40, stone: 15}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.015 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 24}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.018 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png'},
    'quarry': {name: 'Quarry', category: 'Resources', cost: {wood: 22, stone: 20}, width: 60, height: 60, color: '#a9a9a9', produces: { stone: 0.013 }, workersRequired: 2, imgSrc: 'assets/quarry.png', consumes: { tools: 0.002 }},
    'sand_pit': {name: 'Sand Pit', category: 'Resources', cost: {wood: 35, stone: 18}, width: 60, height: 60, color: '#eab308', produces: { sand: 0.025 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'sawmill': {name: 'Sawmill', category: 'Industry', cost: {wood: 120, stone: 60, tools: 6}, width: 60, height: 60, color: '#800000', produces: { wood: 0.07 }, workersRequired: 3, imgSrc: 'assets/sawmill.png', locked: true, consumes: { tools: 0.004 }},
    'glassworks': {name: 'Glassworks', category: 'Industry', cost: {wood: 80, stone: 50, tools: 5}, width: 60, height: 60, color: '#06b6d4', consumes: { sand: 0.03, wood: 0.015, tools: 0.004 }, produces: { glass: 0.006 }, workersRequired: 3, imgSrc: 'assets/glassworks.png', locked: true },
    'toolsmith': {name: 'Toolsmith', category: 'Industry', cost: {wood: 60, stone: 60}, width: 60, height: 60, color: '#f97316', consumes: { wood: 0.02, stone: 0.02 }, produces: { tools: 0.005 }, workersRequired: 3, imgSrc: 'assets/toolsmith.png'},
    'research_lab': {name: 'Research Lab', category: 'Industry', cost: {wood: 140, stone: 70}, width: 60, height: 60, color: '#a78bfa', produces: { knowledge: 0.015 }, workersRequired: 4, imgSrc: 'assets/research_lab.png'},
    'park': { name: 'Park', category: 'Life', cost: {wood: 70, stone: 30}, width: 60, height: 60, color: '#22c55e', providesHappiness: 6, imgSrc: 'assets/park.png' },
};

const researchTree = {
    'advanced_woodcutting': { name: 'Advanced Woodcutting', cost: 150, unlocks: ['sawmill'] },
    'glass_blowing': { name: 'Glass Blowing', cost: 400, unlocks: ['glassworks', 'apartment'] },
    'urban_planning': { name: 'Urban Planning', cost: 1000, unlocks: ['skyscraper'] },
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
    { id: 'harvest', title: 'Bountiful Harvest!', description: 'Farm production +60%', duration: 60000, modifier: { building: 'farm', type: 'produces', resource: 'food', multiplier: 1.6 } },
    { id: 'immigration', title: 'Immigration Boom!', description: '+4 population', duration: 1000, effect: () => { 
        const add = Math.min(4, gameState.populationCap - gameState.population);
        gameState.population += add;
        gameState.unemployedWorkers += add;
     }},
    { id: 'tool_shortage', title: 'Tool Shortage!', description: 'Tool consumption x2.5', duration: 45000, modifier: { type: 'consumes', resource: 'tools', multiplier: 2.5 } },
    { id: 'builders', title: 'Efficient Builders', description: 'Construction costs -15%', duration: 90000, modifier: { type: 'cost', multiplier: 0.85 } },
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
    const { activeEvent, nextEventTime, ...rest } = gameState;
    localStorage.setItem('humanitySurvivalSave', JSON.stringify(rest));
}

function loadGame() {
    const savedGame = localStorage.getItem('humanitySurvivalSave');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        gameState = { ...gameState, ...parsed };
        scenarios.forEach((scenario, sIndex) => {
            scenario.objectives.forEach((obj, oIndex) => {
                obj.completed = (sIndex < gameState.currentScenarioIndex || (sIndex === gameState.currentScenarioIndex && oIndex < gameState.currentObjectiveIndex));
            });
        });
    if (!('saveVersion' in gameState)) gameState.saveVersion = 1;
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
        gameState.nextEventTime = timestamp + 180000 + Math.random() * 120000;
    }

    if (timestamp >= gameState.nextEventTime && !gameState.activeEvent) {
        if (Math.random() < 0.6) {
            const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            gameState.activeEvent = { ...event, startTime: timestamp };
            fadeIn(eventBar);
            eventTitle.textContent = event.title;
            eventDescription.textContent = event.description;
            if (event.effect) event.effect();
        }
        gameState.nextEventTime = 0;
    }

    if (gameState.activeEvent) {
        const elapsed = timestamp - gameState.activeEvent.startTime;
        const progress = Math.max(0, Math.min(1, elapsed / gameState.activeEvent.duration));
        eventProgressBar.style.width = `${(1 - progress) * 100}%`;
        if (elapsed >= gameState.activeEvent.duration) {
            gameState.activeEvent = null;
            fadeOut(eventBar);
        }
    }
}
function update(deltaMs) {
    updateScenario();
    const deltaSec = deltaMs / 1000;
    let baseHappiness = 45;
    let happinessFactors = 0;
    happinessFactors += (gameState.resources.food > 0) ? 20 : -30;
    happinessFactors -= gameState.unemployedWorkers * 2;
    for(const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (blueprint.providesHappiness) happinessFactors += blueprint.providesHappiness;
    }
    let targetHappiness = Math.max(0, Math.min(100, baseHappiness + happinessFactors));
    const happinessEaseRate = 0.25;
    gameState.happiness += (targetHappiness - gameState.happiness) * happinessEaseRate * (deltaSec / 10);
    let happinessModifier = 1;
    if (gameState.happiness > 80) happinessModifier = 1.2;
    else if (gameState.happiness > 65) happinessModifier = 1.05;
    else if (gameState.happiness < 35) happinessModifier = 0.75;
    else if (gameState.happiness < 20) happinessModifier = 0.5;
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        building.needsTools = false;
        if (building.workersAssigned > 0) {
            let productionModifier = 1.0;
            let canProduce = true;
            if (blueprint.consumes) {
                if (blueprint.consumes.tools && gameState.resources.tools < blueprint.consumes.tools * deltaSec) {
                    productionModifier = 0.5;
                    building.needsTools = true;
                }
                for (const resource in blueprint.consumes) {
                    if (resource === 'tools') continue;
                    if (gameState.resources[resource] < blueprint.consumes[resource] * deltaSec) {
                        canProduce = false;
                        break;
                    }
                }
            }
            if (canProduce) {
                if (blueprint.consumes) {
                    for (const resource in blueprint.consumes) {
                        let consumptionRate = blueprint.consumes[resource] * deltaSec;
                        if (gameState.activeEvent?.modifier?.type === 'consumes' && gameState.activeEvent.modifier.resource === resource) {
                            consumptionRate *= gameState.activeEvent.modifier.multiplier;
                        }
                        gameState.resources[resource] -= consumptionRate;
                    }
                }
                if (blueprint.produces) {
                    for (const resource in blueprint.produces) {
                        let productionRate = blueprint.produces[resource] * deltaSec;
                        if (gameState.activeEvent?.modifier?.building === building.type && gameState.activeEvent.modifier.resource === resource) {
                            productionRate *= gameState.activeEvent.modifier.multiplier;
                        }
                        const staffedFrac = blueprint.workersRequired ? (building.workersAssigned / blueprint.workersRequired) : 1;
                        const efficiency = getBuildingEfficiency(building.type);
                        const finalProduction = productionRate * staffedFrac * happinessModifier * productionModifier * efficiency;
                        gameState.resources[resource] += finalProduction;
                    }
                }
            }
        }
    }
    if (gameState.population > 0) {
        const foodConsumed = gameState.population * 0.002 * deltaSec;
        gameState.resources.food -= foodConsumed;
        if (gameState.resources.food < 0) gameState.resources.food = 0;
    }
    gameState.populationCap = gameState.buildings.reduce((sum, b) => sum + (buildingBlueprints[b.type].providesCap || 0), 0);
    if (gameState.population < gameState.populationCap) {
        const foodBufferRatio = Math.min(1, gameState.resources.food / (gameState.population * 4 + 1));
        const happinessFactor = gameState.happiness / 100;
        const baseBirthsPerMinute = 1.2;
        const birthsPerMinute = baseBirthsPerMinute * foodBufferRatio * (0.5 + happinessFactor);
        const probabilityThisFrame = (birthsPerMinute / 60) * deltaSec;
        if (gameState.resources.food > 5 && Math.random() < probabilityThisFrame) {
            gameState.population++;
            gameState.unemployedWorkers++;
        }
    }
    clampResources();
}

function clampResources() {
    for (const key in gameState.resources) {
        let v = gameState.resources[key];
        if (!Number.isFinite(v) || v < 0) {
            gameState.resources[key] = Math.max(0, Number.isFinite(v) ? v : 0);
        }
    }
}

function isImageReady(blueprint) {
    return blueprint.img && blueprint.img.complete && !blueprint.img.failed && blueprint.img.naturalWidth !== 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
        ctx.globalAlpha = 0.5;
        if (isImageReady(blueprint)) {
            ctx.drawImage(blueprint.img, mousePos.x - blueprint.width / 2, mousePos.y - blueprint.height, blueprint.width, blueprint.height);
        } else {
            ctx.fillStyle = blueprint.color;
            ctx.fillRect(mousePos.x - blueprint.width / 2, mousePos.y - blueprint.height, blueprint.width, blueprint.height);
        }
        ctx.globalAlpha = 1.0;
    }

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

let lastTimestamp = performance.now();
function gameLoop(timestamp) {
    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    updateEvents(timestamp);
    const capped = Math.min(deltaMs, 1000);
    update(capped);
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

function aabbIntersect(a, b) {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

function placeBuilding() {
    const blueprint = buildingBlueprints[gameState.buildMode];
    let costModifier = 1.0;
    if (gameState.activeEvent?.modifier?.type === 'cost') {
        costModifier = gameState.activeEvent.modifier.multiplier;
    }

    let canAfford = true;
    for (const resource in blueprint.cost) {
        const base = blueprint.cost[resource];
        const scaledBase = getScaledBuildingCost(gameState.buildMode, resource, base);
        const adjustedCost = Math.round(scaledBase * costModifier);
        if (gameState.resources[resource] < adjustedCost) {
            canAfford = false;
            showMessage(`Not enough ${resource}!`, 2000);
            break;
        }
    }

    if (canAfford) {
        const x = mousePos.x - blueprint.width / 2;
        const y = mousePos.y - blueprint.height;
    const newBuilding = { type: gameState.buildMode, x, y, width: blueprint.width, height: blueprint.height, color: blueprint.color, workersAssigned: 0 };
        if (x < 0 || y < 0 || x + blueprint.width > canvas.width || y + blueprint.height > canvas.height) {
            showMessage('Invalid placement (bounds).', 2000);
            return;
        }
        for (const existing of gameState.buildings) {
            if (aabbIntersect(existing, newBuilding)) {
                showMessage('Cannot overlap another building.', 2000);
                return;
            }
        }
        for (const resource in blueprint.cost) {
            const base = blueprint.cost[resource];
            const scaledBase = getScaledBuildingCost(gameState.buildMode, resource, base);
            const adjustedCost = Math.round(scaledBase * costModifier);
            gameState.resources[resource] -= adjustedCost;
        }
        gameState.buildings.push(newBuilding);
        gameState.buildMode = null;
        canvas.classList.remove('build-cursor');
        refreshUI();
    } else {
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
        scenarioToggleIcon = document.getElementById('scenario-toggle-icon');
        if (scenarioToggleIcon) {
            if (objectivesListElement.classList.contains('collapsed')) scenarioToggleIcon.style.transform = 'rotate(-90deg)';
            else scenarioToggleIcon.style.transform = 'rotate(0deg)';
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
    fadeIn(workerPanelModal);
        populateWorkerPanel();
    });

    closeWorkerPanelButton.addEventListener('click', () => {
    fadeOut(workerPanelModal);
    });

    closeStatsPanelButton.addEventListener('click', () => { fadeOut(statsPanelModal); });

    if (newGameButton) newGameButton.addEventListener('click', () => {
        if (confirm("Start a new game? Progress will be lost.")) {
            localStorage.removeItem('humanitySurvivalSave');
            window.location.reload();
        }
    });
    if (openHelpButton && helpModal && closeHelpButton) {
        const openHelp = () => helpModal.classList.remove('hidden');
        const closeHelp = () => helpModal.classList.add('hidden');
    openHelpButton.addEventListener('click', ()=>{ fadeIn(helpModal); });
    closeHelpButton.addEventListener('click', ()=>{ fadeOut(helpModal); });
    helpModal.addEventListener('click', (e) => { if (e.target === helpModal) fadeOut(helpModal); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) fadeOut(helpModal); });
    }
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
    if (scenarioTitleElement && scenarioTitleElement.childNodes.length) {
        const textNode = scenarioTitleElement.childNodes[0];
        if (textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = currentScenario.title + ' ';
        } else {
            scenarioTitleElement.innerHTML = `${currentScenario.title} <span id="scenario-toggle-icon">▼</span>`;
        }
    }
    scenarioToggleIcon = document.getElementById('scenario-toggle-icon');
    objectivesListElement.innerHTML = '';
    currentScenario.objectives.forEach((obj, index) => {
        const li = document.createElement('li');
        li.textContent = obj.text;
        if (obj.completed) li.className = 'completed';
        else if (index === gameState.currentObjectiveIndex) li.className = 'active';
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
            button.className = 'build-btn';
            const costs = Object.entries(building.cost).map(([res,val]) => {
                const scaled = Math.round(getScaledBuildingCost(building.type,res,val));
                return `${scaled} ${res}`;
            }).join(', ');
            const info = [];
            info.push(`Cost: ${costs}`);
            if (building.providesCap) info.push(`Cap: ${building.providesCap}`);
            if (building.providesHappiness) info.push(`Happy:+${building.providesHappiness}`);
            button.innerHTML = `${building.name}<br><small>${info.join(' | ')}</small>`;
            let affordable = true;
            for (const [res,val] of Object.entries(building.cost)) {
                const scaled = Math.round(getScaledBuildingCost(building.type,res,val));
                if (gameState.resources[res] < scaled) { affordable = false; break; }
            }
            if (!affordable) button.disabled = true;
            button.addEventListener('click', () => {
                if (button.disabled) return;
                gameState.buildMode = building.type;
                canvas.classList.add('build-cursor');
                [...buildMenuElement.querySelectorAll('button')].forEach(b=>b.classList.remove('selected'));
                button.classList.add('selected');
            });
            button.addEventListener('contextmenu', e=>{ e.preventDefault(); showStatsPanel(building.type); });
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
    
    fadeIn(statsPanelModal);
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
    const dynamicCost = getScaledResearchCost(techId, tech.cost);
    button.disabled = isUnlocked || gameState.resources.knowledge < dynamicCost;
        
    if (isUnlocked) button.innerHTML += `<br><small>Researched</small>`;

        button.addEventListener('click', () => {
            if (gameState.resources.knowledge >= dynamicCost) {
                gameState.resources.knowledge -= dynamicCost;
                gameState.unlockedTechs.push(techId);
                tech.unlocks.forEach(buildingId => { buildingBlueprints[buildingId].locked = false; });
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

function countBuildingsOfType(type) {
    return gameState.buildings.filter(b => b.type === type).length;
}

function getBuildingEfficiency(type) {
    const n = countBuildingsOfType(type);
    if (n <= 1) return 1;
    const eff = Math.pow(0.93, n - 1);
    return Math.max(0.25, eff);
}

function getScaledBuildingCost(type, resource, base) {
    const n = countBuildingsOfType(type);
    const scaled = base * Math.pow(1.07, n);
    return scaled;
}

function getScaledResearchCost(techId, base) {
    const researched = gameState.unlockedTechs.length;
    return Math.round(base * Math.pow(1.15, researched));
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});

init();
