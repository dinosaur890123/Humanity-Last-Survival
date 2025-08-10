const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const woodCountElement = document.getElementById('wood-count');
const stoneCountElement = document.getElementById('stone-count');
const foodCountElement = document.getElementById('food-count');
const populationCountElement = document.getElementById('population-count');
const populationCapElement = document.getElementById('population-cap');
const unemployedWorkersElement = document.getElementById('unemployed-workers-count');
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
    },
    buildings: [],
    population: 0,
    unemployedWorkers: 0,
    populationCap: 0,
    buildMode: null,
    selectedBuilding: null,
};

const buildingBlueprints = {
    'house': { name: 'House', cost: {wood: 20, stone: 10}, width: 60, height: 50, color: '#d2b48c', providesCap: 5, imgSrc: 'assets/house.png' },
    'apartment': { name: 'Apartment', cost: {wood: 40, stone: 20, glass: 10}, width: 70, height: 80, color: '#06b6d4', providesCap: 15, providesHappiness: 2, imgSrc: 'assets/apartment.png' },
    'park': { name: 'Park', cost: {wood: 50, stone: 20}, width: 50, height: 50, color: '#22c55e', providesHappiness: 5, imgSrc: 'assets/park.png' },
    'woodcutter': {name: 'Woodcutter', cost: {wood: 20}, width: 70, height: 60, color: '#8b4513', produces: { wood: 0.02 }, workersRequired: 1, imgSrc: 'assets/woodcutter.png'},
    'quarry': {name: 'Quarry', cost: {wood: 15, stone: 15}, width:80, height: 40, color: '#a9a9a9', produces: { stone: 0.01 }, workersRequired: 2, imgSrc: 'assets/quarry.png'},
    'farm': {name: 'Farm', cost: {wood: 30, stone: 10}, width: 100, height: 60, color: '#b8860b', produces: { food: 0.03 }, workersRequired: 2, imgSrc: 'assets/farm.png'},
    'sawmill': {name: 'Sawmill', cost: {wood: 80, stone: 40}, width: 90, height: 70, color: '#800000', produces: { wood: 0.08 }, workersRequired: 3, imgSrc: 'assets/sawmill.png'},
    'sand_pit': {name: 'Sand Pit', cost: {wood: 25, stone: 10}, width: 80, height: 50, color: '#eab308', produces: { sand: 0.02 }, workersRequired: 2, imgSrc: 'assets/sand_pit.png'},
    'glassworks': {name: 'Glassworks', cost: {wood: 50, stone: 30}, width: 80, height: 70, color: '#06b6d4', consumes: { sand: 0.02, wood: 0.01 }, produces: { glass: 0.01 }, workersRequired: 3, imgSrc: 'assets/glassworks.png'},
}

for (const type in buildingBlueprints) {
    const blueprint = buildingBlueprints[type];
    if (blueprint.imgSrc) {
        blueprint.img = new Image();
        blueprint.img.src = blueprint.imgSrc;
    }
}

function update() {
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (blueprint.produces && building.workersAssigned > 0) {
            for (const resource in blueprint.produces) {
                const productionRate = blueprint.produces[resource] * building.workersAssigned;
                gameState.resources[resource] += productionRate;
            }
        }
    }

    if (gameState.population > 0) {
        const foodConsumed = gameState.population * 0.002;
        gameState.resources.food -= foodConsumed;

        if (gameState.resources.food < 0) {
            gameState.resources.food = 0;
            showMessage("Your people are starving!", 2000);
        }
    }

    let newPopCap = 0;
    for (const building of gameState.buildings) {
        if (building.type === 'house') {
            newPopCap += buildingBlueprints.house.providesCap;
    }
    }
    gameState.populationCap = newPopCap;

    if (gameState.population < gameState.populationCap && Math.random() < 0.001) {
        gameState.population++;
        gameState.unemployedWorkers++;
    }
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

        if (blueprint.img && blueprint.img.complete) {
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
        if (blueprint.img && blueprint.img.complete) {
            ctx.drawImage(blueprint.img, mousePos.x - blueprint.width / 2, mousePos.y - blueprint.height, blueprint.width, blueprint.height);
        } else {
            ctx.fillStyle = blueprint.color;
            ctx.fillRect(mousePos.x - blueprint.width / 2, mousePos.y - blueprint.height, blueprint.width, blueprint.height);
        }
        ctx.globalAlpha = 1.0;
    }

    woodCountElement.textContent = Math.floor(gameState.resources.wood);
    stoneCountElement.textContent = Math.floor(gameState.resources.stone);
    foodCountElement.textContent = Math.floor(gameState.resources.food);
    populationCountElement.textContent = gameState.population;
    populationCapElement.textContent = gameState.populationCap;
    
    if (unemployedWorkersElement) {
        unemployedWorkersElement.textContent = gameState.unemployedWorkers;
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
    if (!blueprint.workersRequired) {
        hideInspector();
        return;
    }

    gameState.selectedBuilding = building;
    inspectorPanel.classList.remove('hidden');
    inspectorName.textContent = blueprint.name;
    
    updateInspectorUI();
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
        showMessage('Build cancelled.', 1500);
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
    
    for (const type in buildingBlueprints) {
        const blueprint = buildingBlueprints[type];
        const button = document.createElement('button');
        
        let costString = Object.entries(blueprint.cost)
            .map(([res, val]) => `${val} ${res}`)
            .join(', ');

        button.innerHTML = `${blueprint.name} <br><small>Cost: ${costString}</small>`;
        
        button.addEventListener('click', () => {
            gameState.buildMode = type;
            canvas.classList.add('build-cursor');
            hideInspector();
        });
        buildMenuElement.appendChild(button);
    }
    requestAnimationFrame(gameLoop);
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});
init();
