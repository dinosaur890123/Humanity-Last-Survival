const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resourceList = document.getElementById('resource-list');
const buildMenu = document.getElementById('build-menu');
const researchMenu = document.getElementById('research-menu');
const scenarioTitleElement = document.getElementById('scenario-title');
const objectivesListElement = document.getElementById('objectives-list');
const messageBox = document.getElementById('message-box');
const openWorkerPanelButton = document.getElementById('open-worker-panel-button');
const workerPanelModal = document.getElementById('worker-panel-modal');
const closeWorkerPanelButton = document.getElementById('close-worker-panel-button');
const workerAssignmentsDiv = document.getElementById('worker-assignments');
const unemployedWorkersSpan = document.getElementById('unemployed-workers');
const statsPanelModal = document.getElementById('stats-panel-modal');
const statsImage = document.getElementById('stats-image');
const statsList = document.getElementById('stats-list');
const closeStatsPanelButton = document.getElementById('close-stats-panel-button');
const newGameButton = document.getElementById('settings-new-game-button');
const eventBar = document.getElementById('event-notification-bar');
const eventTitle = document.getElementById('event-title');
const eventDescription = document.getElementById('event-description');
const eventProgressBar = document.getElementById('event-progress-bar');
const selectedBuildingPanel = document.getElementById('selected-building-panel');
const selectedBuildingName = document.getElementById('selected-building-name');
const selectedBuildingStats = document.getElementById('selected-building-stats');
let upgradeButton = document.getElementById('upgrade-button');
let demolishButton = document.getElementById('demolish-button');
const closeSelectedPanelButton = document.getElementById('close-selected-panel-button');

const GRID_SIZE = 30;

const GAME_CONFIG = {
    initialResources: {
        wood: 100,
        stone: 50,
        food: 20,
        sand: 0,
        glass: 0,
        tools: 5,
        knowledge: 0,
    },
    population: {
        consumptionRate: 0.0005,
        growthFactor: 0.0001,
        initialWorkers: 5,
    },
    timers: {
        saveInterval: 10000,
        eventIntervalMin: 60000,
        eventIntervalRandom: 60000
    },
    demolitionRefund: 0.5
};

let gameState = {
    resources: {...GAME_CONFIG.initialResources},
    buildings: [],
    unlockedTechs: [],
    buildMode: null,
    selectedBuilding: null,
    currentScenarioIndex: 0,
    currentObjectiveIndex: 0,
    population: 0,
    maxPopulation: 0,
    unemployedWorkers: GAME_CONFIG.population.initialWorkers,
    happiness: 50,
    floatingTexts: [],
    environment: [],
    lastSaveTime: Date.now(),
    lastEventTime: Date.now(),
    activeEvent: null,
    nextEventTime: 0,
};

const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 10}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png', upgradesTo: 'house', upgradeCost: {wood: 15, stone: 10} },
    'house': { name: 'House', category: 'Housing', cost: {wood: 20, stone: 10}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png', upgradesTo: 'apartment', upgradeCost: {wood: 30, stone: 15, glass: 10} },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 40, stone: 20, glass: 10}, width: 60, height: 60, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png', locked: true, upgradesTo: 'skyscraper', upgradeCost: {wood: 80, stone: 60, glass: 40} },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 100, stone: 80, glass: 50}, width: 60, height: 60, color: '#4b5563', providesCap: 50, providesHappiness: 5, imgSrc: 'assets/skyscraper.png', locked: true },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 30, stone: 10}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.025 }, workersRequired: 2, imgSrc: 'assets/farm.png', upgradesTo: 'automated_farm', upgradeCost: {wood: 40, stone: 20, tools: 10}},
    'automated_farm': {name: 'Automated Farm', category: 'Food', cost: {wood: 70, stone: 30, tools: 10}, width: 60, height: 60, color: '#facc15', produces: { food: 0.06 }, workersRequired: 3, imgSrc: 'assets/automated_farm.png', consumes: { tools: 0.002 }, locked: true },
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 20}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.02 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png', upgradesTo: 'sawmill', upgradeCost: { wood: 70, stone: 40 }},
    'quarry': {name: 'Quarry', category: 'Resources', cost: {wood: 15, stone: 15}, width: 60, height: 60, color: '#a9a9a9', produces: { stone: 0.015 }, workersRequired: 2, imgSrc: 'assets/quarry.png', consumes: { tools: 0.001 }},
    'sand_pit': {name: 'Sand Pit', category: 'Resources', cost: {wood: 25, stone: 10}, width: 60, height: 60, color: '#eab308', produces: { sand: 0.02 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'sawmill': {name: 'Sawmill', category: 'Industry', cost: {wood: 80, stone: 40}, width: 60, height: 60, color: '#800000', produces: { wood: 0.08 }, workersRequired: 3, imgSrc: 'assets/sawmill.png', locked: true, consumes: { tools: 0.002 }},
    'glassworks': {name: 'Glassworks', category: 'Industry', cost: {wood: 50, stone: 30}, width: 60, height: 60, color: '#06b6d4', consumes: { sand: 0.02, wood: 0.01, tools: 0.002 }, produces: { glass: 0.01 }, workersRequired: 3, imgSrc: 'assets/glassworks.png', locked: true },
    'toolsmith': {name: 'Toolsmith', category: 'Industry', cost: {wood: 40, stone: 40}, width: 60, height: 60, color: '#f97316', consumes: { wood: 0.01, stone: 0.01 }, produces: { tools: 0.01 }, workersRequired: 2, imgSrc: 'assets/toolsmith.png'},
    'research_lab': {name: 'Research Lab', category: 'Industry', cost: {wood: 100, stone: 50}, width: 60, height: 60, color: '#a78bfa', produces: { knowledge: 0.02 }, workersRequired: 4, imgSrc: 'assets/research_lab.png'},
    'park': { name: 'Park', category: 'Life', cost: {wood: 50, stone: 20}, width: 60, height: 60, color: '#22c55e', providesHappiness: 5, imgSrc: 'assets/park.png' },
};

const researchTree = {
    'advanced_farming': { name: 'Advanced Farming', cost: 75, unlocks: ['automated_farm']},
    'advanced_woodcutting': { name: 'Advanced Woodcutting', cost: 50, unlocks: ['sawmill'] },
    'glass_blowing': { name: 'Glass Blowing', cost: 100, unlocks: ['glassworks', 'apartment'] },
    'urban_planning': { name: 'Urban Planning', cost: 250, unlocks: ['skyscraper'] },
};

const scenarios = [
    {
        title: "A New Beginning",
        objectives: [
            { type: 'build', building: 'shack', count: 2, description: "Build 2 shacks for your survivors.", completed: false },
            { type: 'resource', resource: 'wood', count: 50, description: "Gather 50 wood.", completed: false },
            { type: 'build', building: 'farm', count: 1, description: "Build a farm to provide food.", completed: false },
        ]
    },
    {
        title: "Growing Community",
        objectives: [
            { type: 'population', count: 10, description: "Reach a population of 10.", completed: false },
            { type: 'build', building: 'house', count: 1, description: "Upgrade a shack to a house.", completed: false },
            { type: 'build', building: 'toolsmith', count: 1, description: "Build a toolsmith.", completed: false },
        ]
    },
     {
        title: "Industrial Revolution",
        objectives: [
            { type: 'research', tech: 'glass_blowing', description: "Research glass blowing.", completed: false },
            { type: 'build', building: 'glassworks', count: 1, description: "Build a glassworks.", completed: false },
            { type: 'resource', resource: 'glass', count: 20, description: "Produce 20 glass.", completed: false },
        ]
    }
];

const gameEvents = {
    'bountiful_harvest': {
        title: "Bountiful Harvest!",
        description: "Favorable weather leads to a massive food surplus.",
        duration: 30000,
        effect: () => { gameState.resources.food += 50; }
    },
    'tool_shipment': {
        title: "Supply Drop!",
        description: "A passing trade drone drops a crate of tools.",
        duration: 15000,
        effect: () => { gameState.resources.tools += 10; }
    },
    'inspiration': {
        title: "Scientific Breakthrough!",
        description: "Your researchers are inspired, granting a knowledge boost.",
        duration: 20000,
        effect: () => { gameState.resources.knowledge += 30; }
    },
};

let mousePos = { x: 0, y: 0 };
let images = {};

function preloadImages() {
    for (const key in buildingBlueprints) {
        const blueprint = buildingBlueprints[key];
        if (blueprint.imgSrc) {
            images[key] = new Image();
            images[key].src = blueprint.imgSrc;
        }
    }
    statsImage.src = 'assets/stats_icon.png';
}

function updateResourceDisplay() {
    resourceList.innerHTML = `
        <li>🧑‍🤝‍🧑 Population: ${Math.floor(gameState.population)} / ${gameState.maxPopulation}</li>
        <li>😊 Happiness: ${gameState.happiness}%</li>
        <li>🪵 Wood: ${gameState.resources.wood.toFixed(2)}</li>
        <li>🪨 Stone: ${gameState.resources.stone.toFixed(2)}</li>
        <li>🍞 Food: ${gameState.resources.food.toFixed(2)}</li>
        <li>🏖️ Sand: ${gameState.resources.sand.toFixed(2)}</li>
        <li>🥃 Glass: ${gameState.resources.glass.toFixed(2)}</li>
        <li>🛠️ Tools: ${gameState.resources.tools.toFixed(2)}</li>
        <li>💡 Knowledge: ${gameState.resources.knowledge.toFixed(2)}</li>
    `;
}

function populateMenus() {
    buildMenu.innerHTML = '';
    const categories = {};
    for (const type in buildingBlueprints) {
        const blueprint = buildingBlueprints[type];
        if (!categories[blueprint.category]) {
            categories[blueprint.category] = [];
        }
        categories[blueprint.category].push({ type, blueprint });
    }

    for (const category in categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        const buildingsContainer = document.createElement('div');
        buildingsContainer.className = 'buildings-container';
        categoryDiv.appendChild(buildingsContainer);

        categories[category].forEach(({ type, blueprint }) => {
            const isLocked = blueprint.locked && !gameState.unlockedTechs.some(techId => researchTree[techId]?.unlocks.includes(type));
            if (isLocked) return;

            const button = document.createElement('button');
            const costString = Object.entries(blueprint.cost).map(([res, val]) => `${val} ${res}`).join(', ');
            button.innerHTML = `${blueprint.name} <small>(${costString})</small>`;
            button.onclick = () => setBuildMode(type);
            
            let canAfford = true;
            for(const resource in blueprint.cost) {
                if (gameState.resources[resource] < blueprint.cost[resource]) {
                    canAfford = false;
                    break;
                }
            }
            button.disabled = !canAfford;
            buildingsContainer.appendChild(button);
        });
        buildMenu.appendChild(categoryDiv);
    }

    researchMenu.innerHTML = '';
    for (const techId in researchTree) {
        if (gameState.unlockedTechs.includes(techId)) continue;
        const tech = researchTree[techId];
        const button = document.createElement('button');
        button.innerHTML = `${tech.name} <small>(${tech.cost} knowledge)</small>`;
        button.onclick = () => research(techId);
        button.disabled = gameState.resources.knowledge < tech.cost;
        researchMenu.appendChild(button);
    }
}

function setBuildMode(type) {
    gameState.buildMode = type;
    canvas.classList.add('build-cursor');
}

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
    
    const clickedBuilding = getBuildingAt(mousePos.x, mousePos.y);
    if (clickedBuilding) {
        gameState.selectedBuilding = clickedBuilding;
        showSelectedBuildingPanel(clickedBuilding);
    } else {
        gameState.selectedBuilding = null;
        hideSelectedBuildingPanel();
    }
});

function placeBuilding() {
    const blueprint = buildingBlueprints[gameState.buildMode];
    const gridX = Math.floor(mousePos.x / GRID_SIZE) * GRID_SIZE;
    const gridY = Math.floor(mousePos.y / GRID_SIZE) * GRID_SIZE;
    
    const newBuilding = {
        type: gameState.buildMode,
        x: gridX,
        y: gridY,
        workersAssigned: 0,
        productionTimer: 0,
    };

    const rect1 = { x: newBuilding.x, y: newBuilding.y, width: blueprint.width, height: blueprint.height };
    for (const building of gameState.buildings) {
        const bp = buildingBlueprints[building.type];
        const rect2 = { x: building.x, y: building.y, width: bp.width, height: bp.height };
        if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
            showMessage("Cannot place building here!", 2000);
            return;
        }
    }

    if (newBuilding.y + blueprint.height > canvas.height - 50) {
        showMessage("Cannot build on the ground!", 2000);
        return;
    }

    let canAfford = true;
    for (const resource in blueprint.cost) {
        if (gameState.resources[resource] < blueprint.cost[resource]) {
            canAfford = false;
            break;
        }
    }

    if (canAfford) {
        for (const resource in blueprint.cost) {
            gameState.resources[resource] -= blueprint.cost[resource];
        }
        gameState.buildings.push(newBuilding);
        checkObjectives({ type: 'build', building: newBuilding.type, count: 1 });
    }

    if (!event.ctrlKey) {
        gameState.buildMode = null;
        canvas.classList.remove('build-cursor');
    }
}

function getBuildingAt(x, y) {
    for (let i = gameState.buildings.length - 1; i >= 0; i--) {
        const building = gameState.buildings[i];
        const blueprint = buildingBlueprints[building.type];
        if (x >= building.x && x <= building.x + blueprint.width &&
            y >= building.y && y <= building.y + blueprint.height) {
            return building;
        }
    }
    return null;
}

function showSelectedBuildingPanel(building) {
    const blueprint = buildingBlueprints[building.type];
    selectedBuildingPanel.classList.remove('hidden');
    selectedBuildingName.textContent = blueprint.name;

    let statsText = '';
    if (blueprint.providesCap) statsText += `Capacity: ${blueprint.providesCap} | `;
    if (blueprint.workersRequired) statsText += `Workers: ${building.workersAssigned}/${blueprint.workersRequired}`;
    selectedBuildingStats.textContent = statsText;

    if (blueprint.upgradesTo) {
        const nextBlueprint = buildingBlueprints[blueprint.upgradesTo];
        const costString = Object.entries(blueprint.upgradeCost)
            .map(([res, val]) => `${val} ${res}`)
            .join(', ');
        
        upgradeButton.innerHTML = `Upgrade to ${nextBlueprint.name}<br><small>${costString}</small>`;
        upgradeButton.classList.remove('hidden');

        const newUpgradeButton = upgradeButton.cloneNode(true);
        upgradeButton.parentNode.replaceChild(newUpgradeButton, upgradeButton);
        upgradeButton = newUpgradeButton; 
        upgradeButton.addEventListener('click', () => upgradeBuilding(building));
    } else {
        upgradeButton.classList.add('hidden');
    }

    const newDemolishButton = demolishButton.cloneNode(true);
    demolishButton.parentNode.replaceChild(newDemolishButton, demolishButton);
    demolishButton = newDemolishButton;
    demolishButton.addEventListener('click', () => demolishBuilding(building));
}

function hideSelectedBuildingPanel() {
    selectedBuildingPanel.classList.add('hidden');
    gameState.selectedBuilding = null;
}

function upgradeBuilding(building) {
    const blueprint = buildingBlueprints[building.type];
    if (!blueprint.upgradesTo) return;

    const upgradeCost = blueprint.upgradeCost;
    const nextType = blueprint.upgradesTo;

    const nextBlueprint = buildingBlueprints[nextType];
    if (nextBlueprint.locked && !gameState.unlockedTechs.some(techId => researchTree[techId]?.unlocks.includes(nextType))) {
        showMessage(`Research required to upgrade to ${nextBlueprint.name}.`, 2000);
        return;
    }

    let canAfford = true;
    for (const resource in upgradeCost) {
        if (gameState.resources[resource] < upgradeCost[resource]) {
            canAfford = false;
            showMessage(`Not enough ${resource} to upgrade!`, 2000);
            break;
        }
    }

    if (canAfford) {
        for (const resource in upgradeCost) {
            gameState.resources[resource] -= upgradeCost[resource];
        }

        gameState.unemployedWorkers += building.workersAssigned;
        building.workersAssigned = 0;
        
        building.type = nextType;
        
        showMessage(`${blueprint.name} upgraded to ${nextBlueprint.name}!`, 2000);
        showSelectedBuildingPanel(building);
    }
}

function demolishBuilding(building) {
    const blueprint = buildingBlueprints[building.type];
    for (const resource in blueprint.cost) {
        gameState.resources[resource] += Math.floor(blueprint.cost[resource] * GAME_CONFIG.demolitionRefund);
    }

    gameState.unemployedWorkers += building.workersAssigned;

    gameState.buildings = gameState.buildings.filter(b => b !== building);
    
    hideSelectedBuildingPanel();
    showMessage(`${blueprint.name} demolished.`, 2000);
}

function setupEventListeners() {
    scenarioTitleElement.addEventListener('click', () => {
        objectivesListElement.classList.toggle('collapsed');
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameState.buildMode) {
            gameState.buildMode = null;
            canvas.classList.remove('build-cursor');
            showMessage('Build cancelled.', 1500);
        } else if (gameState.selectedBuilding) {
            hideSelectedBuildingPanel();
        }
    });

    openWorkerPanelButton.addEventListener('click', () => {
        workerPanelModal.classList.remove('hidden');
        populateWorkerPanel();
    });

    closeWorkerPanelButton.addEventListener('click', () => {
        workerPanelModal.classList.add('hidden');
    });

    closeSelectedPanelButton.addEventListener('click', hideSelectedBuildingPanel);

    closeStatsPanelButton.addEventListener('click', () => {
        statsPanelModal.classList.add('hidden');
    });
    
    newGameButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
            localStorage.removeItem('humanitySurvivalSave');
            window.location.reload();
        }
    });
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
    const scenario = scenarios[gameState.currentScenarioIndex];
    if (!scenario) {
        scenarioTitleElement.textContent = "All Scenarios Complete!";
        objectivesListElement.innerHTML = '<li>You have built a thriving civilization.</li>';
        return;
    }
    scenarioTitleElement.textContent = scenario.title;
    let html = '';
    scenario.objectives.forEach((obj, index) => {
        const isCurrent = index === gameState.currentObjectiveIndex;
        const progress = getObjectiveProgress(obj);
        let progressText = '';
        if (obj.type === 'resource' || obj.type === 'population') {
            progressText = `(${progress.current}/${progress.target})`;
        }
        html += `<li class="${obj.completed ? 'completed' : (isCurrent ? 'current' : '')}">${obj.description} ${progressText}</li>`;
    });
    objectivesListElement.innerHTML = html;
}

function getObjectiveProgress(objective) {
    switch (objective.type) {
        case 'resource':
            return { current: Math.floor(gameState.resources[objective.resource]), target: objective.count };
        case 'population':
            return { current: Math.floor(gameState.population), target: objective.count };
        default:
            return { current: 0, target: 0 };
    }
}

function checkObjectives(action) {
    const scenario = scenarios[gameState.currentScenarioIndex];
    if (!scenario) return;
    const objective = scenario.objectives[gameState.currentObjectiveIndex];
    if (!objective || objective.completed) return;

    let progressMade = false;
    if (action.type === 'build' && objective.type === 'build' && action.building === objective.building) {
        const count = gameState.buildings.filter(b => b.type === objective.building).length;
        if (count >= objective.count) {
            progressMade = true;
        }
    } else if (action.type === 'resource' && objective.type === 'resource' && action.resource === objective.resource) {
        if (gameState.resources[action.resource] >= objective.count) {
            progressMade = true;
        }
    } else if (action.type === 'population' && objective.type === 'population') {
        if (gameState.population >= objective.count) {
            progressMade = true;
        }
    } else if (action.type === 'research' && objective.type === 'research' && action.tech === objective.tech) {
        progressMade = true;
    }
    
    if (progressMade) {
        objective.completed = true;
        gameState.currentObjectiveIndex++;
        if (gameState.currentObjectiveIndex >= scenario.objectives.length) {
            gameState.currentScenarioIndex++;
            gameState.currentObjectiveIndex = 0;
            showMessage(`Scenario Complete: ${scenario.title}!`, 5000, 'success');
        } else {
            showMessage('Objective Complete!', 3000, 'success');
        }
    }
}


function research(techId) {
    const tech = researchTree[techId];
    if (gameState.resources.knowledge >= tech.cost) {
        gameState.resources.knowledge -= tech.cost;
        gameState.unlockedTechs.push(techId);
        showMessage(`Researched: ${tech.name}`, 3000, 'success');
        checkObjectives({ type: 'research', tech: techId });
    }
}

function showMessage(text, duration = 3000, type = 'info') {
    messageBox.textContent = text;
    messageBox.className = type;
    messageBox.style.opacity = 1;
    setTimeout(() => {
        messageBox.style.opacity = 0;
    }, duration);
}

function populateWorkerPanel() {
    workerAssignmentsDiv.innerHTML = '';
    const buildingsWithWorkers = gameState.buildings.filter(b => buildingBlueprints[b.type].workersRequired > 0);
    
    buildingsWithWorkers.forEach(building => {
        const blueprint = buildingBlueprints[building.type];
        const div = document.createElement('div');
        div.className = 'worker-assignment';
        div.innerHTML = `
            <span>${blueprint.name} (${building.x}, ${building.y})</span>
            <div>
                <button class="worker-btn remove">-</button>
                <span>${building.workersAssigned} / ${blueprint.workersRequired}</span>
                <button class="worker-btn add">+</button>
            </div>
        `;
        div.querySelector('.add').addEventListener('click', () => assignWorker(building, 1));
        div.querySelector('.remove').addEventListener('click', () => assignWorker(building, -1));
        workerAssignmentsDiv.appendChild(div);
    });

    unemployedWorkersSpan.textContent = gameState.unemployedWorkers;
}

function assignWorker(building, amount) {
    const blueprint = buildingBlueprints[building.type];
    if (amount > 0 && gameState.unemployedWorkers > 0 && building.workersAssigned < blueprint.workersRequired) {
        gameState.unemployedWorkers--;
        building.workersAssigned++;
    } else if (amount < 0 && building.workersAssigned > 0) {
        gameState.unemployedWorkers++;
        building.workersAssigned--;
    }
    populateWorkerPanel();
}


function openTab(tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
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
    preloadImages();
    setupEventListeners();
    openTab('build-tab');
    
    gameState.nextEventTime = Date.now() + GAME_CONFIG.timers.eventIntervalMin + Math.random() * GAME_CONFIG.timers.eventIntervalRandom;

    gameLoop();
}

function updateResources() {
    gameState.buildings.forEach(building => {
        const blueprint = buildingBlueprints[building.type];
        
        if (blueprint.workersRequired > 0 && building.workersAssigned < blueprint.workersRequired) {
            return;
        }

        let efficiency = building.workersAssigned / blueprint.workersRequired;
        if (!blueprint.workersRequired) {
            efficiency = 1;
        }

        if (blueprint.produces) {
            let canProduce = true;
            if (blueprint.consumes) {
                for (const resource in blueprint.consumes) {
                    const consumedAmount = blueprint.consumes[resource] * efficiency;
                    if (gameState.resources[resource] < consumedAmount) {
                        canProduce = false;
                        break;
                    }
                }
            }

            if(canProduce) {
                if (blueprint.consumes) {
                    for (const resource in blueprint.consumes) {
                        gameState.resources[resource] -= blueprint.consumes[resource] * efficiency;
                    }
                }

                building.productionTimer += 1000/60; 
                if (building.productionTimer >= 2000) { 
                    building.productionTimer = 0;
                    for (const resource in blueprint.produces) {
                        const producedAmount = blueprint.produces[resource] * 60; 
                        
                        if (Math.random() < 0.1) {
                             gameState.floatingTexts.push({
                                text: `+${producedAmount.toFixed(2)}`,
                                x: building.x + blueprint.width / 2,
                                y: building.y,
                                life: 120,
                                color: 'white'
                            });
                        }
                    }
                }

                for (const resource in blueprint.produces) {
                    const producedAmount = blueprint.produces[resource] * efficiency;
                    gameState.resources[resource] += producedAmount;
                    checkObjectives({ type: 'resource', resource: resource });
                }
            }
        }
    });
}

function updatePopulation() {
    gameState.maxPopulation = gameState.buildings
        .map(b => buildingBlueprints[b.type].providesCap || 0)
        .reduce((a, b) => a + b, 0);

    const foodConsumption = gameState.population * GAME_CONFIG.population.consumptionRate;
    if (gameState.resources.food >= foodConsumption) {
        gameState.resources.food -= foodConsumption;
    } else {
        gameState.resources.food = 0;
        gameState.happiness -= 0.05;
    }

    const totalHappinessBonus = gameState.buildings
        .map(b => buildingBlueprints[b.type].providesHappiness || 0)
        .reduce((a, b) => a + b, 0);

    const baseHappiness = 50;
    const foodHappiness = (gameState.resources.food > gameState.population) ? 20 : -20;
    const housingHappiness = (gameState.population < gameState.maxPopulation * 0.8) ? 10 : (gameState.population > gameState.maxPopulation ? -30 : -5);
    
    const targetHappiness = Math.max(0, Math.min(100, baseHappiness + foodHappiness + housingHappiness + totalHappinessBonus));
    
    if (gameState.happiness < targetHappiness) {
        gameState.happiness += 0.01;
    } else if (gameState.happiness > targetHappiness) {
        gameState.happiness -= 0.01;
    }

    const growthRate = (gameState.happiness / 100 - 0.3) * GAME_CONFIG.population.growthFactor;
    if (gameState.population < gameState.maxPopulation && growthRate > 0) {
        const newPeople = gameState.population * growthRate;
        gameState.population += newPeople;
        gameState.unemployedWorkers += newPeople;
        checkObjectives({ type: 'population' });
    } else if (growthRate < 0) {
        const leavingPeople = gameState.population * Math.abs(growthRate);
        if (gameState.unemployedWorkers >= leavingPeople) {
            gameState.unemployedWorkers -= leavingPeople;
            gameState.population -= leavingPeople;
        }
    }

    if (gameState.population < 0) gameState.population = 0;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (building === gameState.selectedBuilding) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(building.x, building.y, blueprint.width, blueprint.height);
        }

        if (images[building.type] && images[building.type].complete) {
            ctx.drawImage(images[building.type], building.x, building.y, blueprint.width, blueprint.height);
        } else {
            ctx.fillStyle = blueprint.color;
            ctx.fillRect(building.x, building.y, blueprint.width, blueprint.height);
        }

        if (blueprint.workersRequired > 0 && building.workersAssigned < blueprint.workersRequired) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❓', building.x + blueprint.width / 2, building.y + blueprint.height / 2);
        }
    }
    
    gameState.floatingTexts.forEach((ft, index) => {
        ctx.fillStyle = ft.color;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = ft.life / 120;
        ctx.fillText(ft.text, ft.x, ft.y);
        ft.y -= 0.5;
        ft.life--;
        if (ft.life <= 0) {
            gameState.floatingTexts.splice(index, 1);
        }
    });
    ctx.globalAlpha = 1.0;


    if (gameState.buildMode) {
        const blueprint = buildingBlueprints[gameState.buildMode];
        const gridX = Math.floor(mousePos.x / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.floor(mousePos.y / GRID_SIZE) * GRID_SIZE;
        ctx.globalAlpha = 0.5;
        if (images[gameState.buildMode] && images[gameState.buildMode].complete) {
            ctx.drawImage(images[gameState.buildMode], gridX, gridY, blueprint.width, blueprint.height);
        } else {
            ctx.fillStyle = blueprint.color;
            ctx.fillRect(gridX, gridY, blueprint.width, blueprint.height);
        }
        ctx.globalAlpha = 1.0;
    }
}

function triggerRandomEvent() {
    const eventKeys = Object.keys(gameEvents);
    const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    const event = gameEvents[randomKey];
    
    gameState.activeEvent = {...event, startTime: Date.now()};
    event.effect();
    
    eventBar.classList.remove('hidden');
    eventTitle.textContent = event.title;
    eventDescription.textContent = event.description;
}

function updateEvents() {
    const now = Date.now();
    if (!gameState.activeEvent && now > gameState.nextEventTime) {
        triggerRandomEvent();
        gameState.nextEventTime = now + GAME_CONFIG.timers.eventIntervalMin + Math.random() * GAME_CONFIG.timers.eventIntervalRandom;
    }

    if (gameState.activeEvent) {
        const elapsed = now - gameState.activeEvent.startTime;
        const progress = 1 - (elapsed / gameState.activeEvent.duration);
        
        if (progress <= 0) {
            gameState.activeEvent = null;
            eventBar.classList.add('hidden');
        } else {
            eventProgressBar.style.width = `${progress * 100}%`;
        }
    }
}

function gameLoop() {
    const now = Date.now();
    updateResources();
    updatePopulation();
    draw();
    updateResourceDisplay();
    populateMenus();
    updateScenario();
    updateEvents();

    if (now - gameState.lastSaveTime > GAME_CONFIG.timers.saveInterval) {
        saveGame();
        gameState.lastSaveTime = now;
    }

    requestAnimationFrame(gameLoop);
}

init();

