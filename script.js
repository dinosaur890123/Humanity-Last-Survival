const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const woodCountElement = document.getElementById('wood-count');
const stoneCountElement = document.getElementById('stone-count');
const populationCountElement = document.getElementById('population-count');
const populationCapElement = document.getElementById('population-cap');
const buildMenuElement = document.getElementById('build-menu');
const messageBoxElement = document.getElementById('message-box');

const gameState = {
    resources: {
        wood: 50,
        stone: 50,
    },
    buildings: [],
    population: 0,
    populationCap: 0,
    buildMode: null,
};

const buildingBlueprints = {
    'house': { name: 'House', cost: {wood: 20, stone: 10}, width: 60, height: 50, color: '#d2b48c', providesCap: 5 },
    'woodcutter': {name: 'Woodcutter', cost: {wood: 20}, width: 70, height: 60, color: '#8b4513', produces: { wood: 0.02 }},
    'quarry': {name: 'Quarry', cost: {wood: 15, stone: 15}, width:80, height: 40, color: '#a9a9a9', produces: { stone: 0.01 }},
}
function update() {
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (blueprint.produces) {
            for (const resource in blueprint.produces) {
                gameState.resources[resource] += blueprint.produces[resource];
            }
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
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    for (const building of gameState.buildings) {
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(building.x, building.y, building.width, building.height);
    }

    if (gameState.buildMode && mousePos.x !== null) {
        const blueprint = buildingBlueprints[gameState.buildMode];
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = blueprint.color;
        ctx.fillRect(mousePos.x - blueprint.width / 2, mousePos.y - blueprint.height, blueprint.width, blueprint.height);
        ctx.globalAlpha = 1.0;
    }

    woodCountElement.textContent = Math.floor(gameState.resources.wood);
    stoneCountElement.textContent = Math.floor(gameState.resources.stone);
    populationCountElement.textContent = gameState.population;
    populationCapElement.textContent = gameState.populationCap;
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
    if (!gameState.buildMode) return;

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

        gameState.buildings.push({
            type: gameState.buildMode,
            x: mousePos.x - blueprint.width / 2,
            y: mousePos.y - blueprint.height,
            width: blueprint.width,
            height: blueprint.height,
            color: blueprint.color,
        });
        
        gameState.buildMode = null;
        canvas.classList.remove('build-cursor');
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
            showMessage(`Placing ${blueprint.name}. Right-click to cancel.`, 3000);
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
