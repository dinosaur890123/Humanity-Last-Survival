const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const woodCountElement = document.getElementById('woodCount');
const stoneCountElement = document.getElementById('stoneCount');
const populationCountElement = document.getElementById('populationCount');
const populationCapElement = document.getElementById('population-count');
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
    'woodcutter': {name: 'Woodcutter', cost: {wood: 20}},
    'quarry': {name: 'Quarry', cost: {wood: 15, stone: 15}, width:80, height: 40, color},
};
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

    woodCountEl.textContent = Math.floor(gameState.resources.wood);
    stoneCountEl.textContent = Math.floor(gameState.resources.stone);
    populationCountEl.textContent = gameState.population;
    populationCapEl.textContent = gameState.populationCap;
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
const mousePosition = { x: null, y: null };
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
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
    messageBoxEl.textContent = text;
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        messageBoxEl.textContent = '';
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
        buildMenuEl.appendChild(button);
    }

    requestAnimationFrame(gameLoop);
}
        
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
});
init();
