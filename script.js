const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const woodCountElement = document.getElementById('wood-count');
const stoneCountElement = document.getElementById('stone-count');
const foodCountElement = document.getElementById('food-count');
const sandCountElement = document.getElementById('sand-count');
const glassCountElement = document.getElementById('glass-count');
const populationCountElement = document.getElementById('population-count');
const populationCapElement = document.getElementById('population-cap');
const unemployedWorkersElement = document.getElementById('unemployed-workers-count');
const happinessElement = document.getElementById('happiness-count');
const buildMenuElement = document.getElementById('build-menu');
const messageBoxElement = document.getElementById('message-box');

const inspectorPanel = document.getElementById('inspector-panel');
const inspectorName = document.getElementById('inspector-name');
const workersAssignedSpan = document.getElementById('workers-assigned');
const workersRequiredSpan = document.getElementById('workers-required');
const addWorkerButton = document.getElementById('add-worker-button');
const removeWorkerButton = document.getElementById('remove-worker-button');
const closeInspectorButton = document.getElementById('close-inspector-button');

const gameState = {
    resources: {
        wood: 50,
        stone: 50,
        food: 100,
        sand: 0,
        glass: 0,
    },
    buildings: [],
    population: 0,
    unemployedWorkers: 0,
    populationCap: 0,
    happiness: 100,
    buildMode: null,
    selectedBuilding: null,
};

const buildingBlueprints = {
    'shack': { name: 'Shack', category: 'Housing', cost: {wood: 10}, width: 60, height: 60, color: '#A0522D', providesCap: 2, imgSrc: 'assets/shack.png' },
    'house': { name: 'House', category: 'Housing', cost: {wood: 20, stone: 10}, width: 60, height: 60, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', category: 'Housing', cost: {wood: 40, stone: 20, glass: 10}, width: 60, height: 60, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png' },
    'skyscraper': { name: 'Skyscraper', category: 'Housing', cost: {wood: 100, stone: 80, glass: 50}, width: 60, height: 60, color: '#4b5563', providesCap: 50, providesHappiness: 5, imgSrc: 'assets/skyscraper.png' },
    'farm': {name: 'Farm', category: 'Food', cost: {wood: 30, stone: 10}, width: 60, height: 60, color: '#b8860b', produces: { food: 0.03 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'woodcutter': {name: 'Woodcutter', category: 'Resources', cost: {wood: 20}, width: 60, height: 60, color: '#8b4513', produces: { wood: 0.02 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png'},
    'quarry': {name: 'Quarry', category: 'Resources', cost: {wood: 15, stone: 15}, width: 60, height: 60, color: '#a9a9a9', produces: { stone: 0.01 }, workersRequired: 2, imgSrc: 'assets/quarry.png'},
    'sand_pit': {name: 'Sand Pit', category: 'Resources', cost: {wood: 25, stone: 10}, width: 60, height: 60, color: '#eab308', produces: { sand: 0.02 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'sawmill': {name: 'Sawmill', category: 'Industry', cost: {wood: 80, stone: 40}, width: 60, height: 60, color: '#800000', produces: { wood: 0.08 }, workersRequired: 3, imgSrc: 'assets/sawmill.png'},
    'glassworks': {name: 'Glassworks', category: 'Industry', cost: {wood: 50, stone: 30}, width: 60, height: 60, color: '#06b6d4', consumes: { sand: 0.02, wood: 0.01 }, produces: { glass: 0.01 }, workersRequired: 3, imgSrc: 'assets/glassworks.png'},
    'park': { name: 'Park', category: 'Life', cost: {wood: 50, stone: 20}, width: 60, height: 60, color: '#22c55e', providesHappiness: 5, imgSrc: 'assets/park.png' },
}

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

function update() {
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
    gameState.happiness += (targetHappiness - gameState.happiness) * 0.001;

    let happinessModifier = 1;
    if (gameState.happiness > 70) happinessModifier = 1.1;
    if (gameState.happiness < 30) happinessModifier = 0.8;

    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (building.workersAssigned > 0) {
            let canProduce = true;
            if (blueprint.consumes) {
                for (const resource in blueprint.consumes) {
                    if (gameState.resources[resource] < blueprint.consumes[resource]) {
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
                        const productionRate = blueprint.produces[resource] * building.workersAssigned * happinessModifier;
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

    if (gameState.population < gameState.populationCap && Math.random() < 0.001) {
        gameState.population++;
        gameState.unemployedWorkers++;
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
    if (populationCountElement) populationCountElement.textContent = gameState.population;
    if (populationCapElement) populationCapElement.textContent = gameState.populationCap;
    
    if (unemployedWorkersElement) {
        unemployedWorkersElement.textContent = gameState.unemployedWorkers;
    }
    if (happinessElement) {
        happinessElement.textContent = Math.floor(gameState.happiness);
    }
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

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (gameState.buildMode) {
        gameState.buildMode = null;
        canvas.classList.remove('build-cursor');
        showMessage('Build has been cancelled.', 1500);
    }
});

let messageTimeout;
function showMessage(text, duration) {
    messageBoxElement.textContent = text;
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        messageBoxElement.textContent = '';
    }, duration);
}

function init() {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
    
    buildMenuElement.innerHTML = ''; 
    const categories = {};

    for (const type in buildingBlueprints) {
        const blueprint = buildingBlueprints[type];
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
            let infoParts = ['Cost: ${costString}'];
            if (building.providesCap) {
                infoParts.push('Capacity: ${building.providesCap}');
            }
            if (building.providesHappiness) {
                infoParts.push('Happiness: +{building.providesHappiness}');
            }
            let additionalInfo = infoParts.join(' | ');

            button.innerHTML = `${building.name} <br><small>Cost: ${costString}</small>`;
            
            button.addEventListener('click', () => {
                gameState.buildMode = building.type;
                canvas.classList.add('build-cursor');
                hideInspector();
            });
            buildMenuElement.appendChild(button);
        }
    }

    requestAnimationFrame(gameLoop);
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});
init();
