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

const inspectorPanel = document.getElementById('inspector-panel');
const inspectorName = document.getElementById('inspector-name');
const workersAssignedSpan = document.getElementById('workers-assigned');
const workersRequiredSpan = document.getElementById('workers-required');
const addWorkerButton = document.getElementById('add-worker-button');
const removeWorkerButton = document.getElementById('remove-worker-button');
const closeInspectorButton = document.getElementById('close-inspector-button');

const openWorkerPanelButton = document.getElementById('open-worker-panel-button');
const workerPanelModal = document.getElementById('worker-panel-modal');
const closeWorkerPanelButton = document.getElementById('close-worker-panel-button');
const workerAssignmentsList = document.getElementById('worker-assignments-list');

const statsPanelModal = document.getElementById('stats-panel-modal');
const statsName = document.getElementById('stats-name');
const statsImage = document.getElementById('stats-image');
const statsList = document.getElementById('stats-list');
const closeStatsPanelButton = document.getElementById('close-stats-panel-button');

const gameState = {
    resources: { wood: 50, stone: 50, food: 100, sand: 0, glass: 0, tools: 20, knowledge: 0 },
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
};

const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 10}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png' },
    'house': { name: 'House', category: 'Housing', cost: {wood: 20, stone: 10}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 40, stone: 20, glass: 10}, width: 60, height: 60, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png', locked: true },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 100, stone: 80, glass: 50}, width: 60, height: 60, color: '#4b5563', providesCap: 50, providesHappiness: 5, imgSrc: 'assets/skyscraper.png', locked: true },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 30, stone: 10}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.03 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 20}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.02 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png'},
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
                        gameState.resources[resource] -= blueprint.consumes[resource];
                    }
                }
                if (blueprint.produces) {
                    for (const resource in blueprint.produces) {
                        const productionRate = blueprint.produces[resource] * building.workersAssigned * happinessModifier * productionModifier;
                        gameState.resources[resource] += productionRate;
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

function gameLoop() {
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
    
    const clickedBuilding = getBuildingAt(mousePos.x, mousePos.y);
    if (clickedBuilding) {
        showInspector(clickedBuilding);
    } else {
        hideInspector();
    }
});

function placeBuilding() {
    const blueprint = buildingBlueprints[gameState.buildMode];

    let canAfford = true;
    for (const resource in blueprint.cost) {
        if (gameState.resources[resource] < blueprint.cost[resource]) {
            canAfford = false;
            showMessage(`Not enough ${resource}!`, 2000);
            break;
        }
    }

    if (canAfford) {
        for (const resource in blueprint.cost) {
            gameState.resources[resource] -= blueprint.cost[resource];
        }

        const newBuilding = {
            type: gameState.buildMode,
            x: mousePos.x - blueprint.width / 2,
            y: mousePos.y - blueprint.height,
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

function showInspector(building) {
    const blueprint = buildingBlueprints[building.type];
    if (!blueprint.workersRequired && !blueprint.providesHappiness) {
        hideInspector();
        return;
    }

    gameState.selectedBuilding = building;
    inspectorPanel.classList.remove('hidden');
    inspectorName.textContent = blueprint.name;
    
    if (blueprint.workersRequired) {
        document.getElementById('inspector-workers').style.display = 'flex';
        updateInspectorUI();
    } else {
        document.getElementById('inspector-workers').style.display = 'none';
    }
}

function updateInspectorUI() {
    if (!gameState.selectedBuilding) return;
    const building = gameState.selectedBuilding;
    const blueprint = buildingBlueprints[building.type];
    workersAssignedSpan.textContent = building.workersAssigned;
    workersRequiredSpan.textContent = blueprint.workersRequired;
}
function hideInspector() {
    gameState.selectedBuilding = null;
    inspectorPanel.classList.add('hidden');
}

function setupEventListeners() {
    addWorkerButton.addEventListener('click', () => {
        const building = gameState.selectedBuilding;
        if (!building) return;

        const blueprint = buildingBlueprints[building.type];
        if (gameState.unemployedWorkers > 0 && building.workersAssigned < blueprint.workersRequired) {
            building.workersAssigned++;
            gameState.unemployedWorkers--;
            updateInspectorUI();
        }
    });

    removeWorkerButton.addEventListener('click', () => {
        const building = gameState.selectedBuilding;
        if (!building || building.workersAssigned === 0) return;

        building.workersAssigned--;
        gameState.unemployedWorkers++;
        updateInspectorUI();
    });

    closeInspectorButton.addEventListener('click', hideInspector);

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
            const container = document.createElement('div');
            container.className = 'build-button-container';

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
                hideInspector();
            });

            const viewButton = document.createElement('span');
            viewButton.className = 'view-stats-button';
            viewButton.textContent = 'View';
            viewButton.onclick = (e) => {
                e.stopPropagation();
                showStatsPanel(building.type);
            };

            container.appendChild(button);
            container.appendChild(viewButton);
            buildMenuElement.appendChild(container);
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
    if (blueprint.produces) createStat('Produces', Object.entries(blueprint.produces).map(([k,v]) => `${v*60}/min ${k}`).join(', '));
    if (blueprint.consumes) createStat('Consumes', Object.entries(blueprint.consumes).map(([k,v]) => `${v*60}/min ${k}`).join(', '));
    
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

function init() {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
    
    setupEventListeners();
    refreshUI();
    requestAnimationFrame(gameLoop);
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});
init();
