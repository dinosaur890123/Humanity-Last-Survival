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
const scenarioPanelElement = document.getElementById('scenario-panel');
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
const eventProgressBar = document.getElementById('event-progress-bar');
const eventChoiceModal = document.getElementById('event-choice-modal');
const eventChoiceTitle = document.getElementById('event-choice-title');
const eventDescription = document.getElementById('event-description');
const eventChoiceDescription = document.getElementById('event-choice-description');
const eventChoicesList = document.getElementById('event-choices-list');
const selectedBuildingInfo = document.getElementById('selected-building-info');
const cancelTutorialButton = document.getElementById('cancel-tutorial-button');
const tutorialHud = document.getElementById('tutorial-hud');
const hudStepNum = document.getElementById('hud-step-num');
const hudStepTotal = document.getElementById('hud-step-total');
const hudAction = document.getElementById('hud-action');
const hudHintButton = document.getElementById('hud-hint-button');
const hudNextButton = document.getElementById('hud-next-button');
const upgradeCurrentName = document.getElementById('upgrade-current-name');
const upgradeCurrentImage = document.getElementById('upgrade-current-image');
const upgradeCurrentStats = document.getElementById('upgrade-current-stats');
const upgradeNextWrapper = document.getElementById('upgrade-next-wrapper');
const upgradeNextName = document.getElementById('upgrade-next-name');
const upgradeNextImage = document.getElementById('upgrade-next-image');
const upgradeNextBenefits = document.getElementById('upgrade-next-benefits');
const upgradeCosts = document.getElementById('upgrade-costs');
const upgradeButton = document.getElementById('upgrade-button');
const upgradeRequirements = document.getElementById('upgrade-requirements');
const noUpgradeMessage = document.getElementById('no-upgrade-message');
const upgradeCloseButton = document.getElementById('upgrade-close-button');
const demolishButton = document.getElementById('demolish-button');

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
let derivedDirty = {
    populationCap: true,
    happinessStructure: true,
};
let buildMenuDirty = true;
let researchPanelDirty = true;
let scenarioPanelDirty = true;
const RESOURCE_LIST = ['wood','stone','food','sand','glass','tools','knowledge'];
const resourceRateTracker = {
    windowSeconds: 60,
    sampleInterval: 1000,
    lastSampleTime: performance.now(),
    lastValues: {},
    perSecondDeltas: {},
};
RESOURCE_LIST.forEach(r => {
    resourceRateTracker.lastValues[r] = gameState.resources[r] || 0;
    resourceRateTracker.perSecondDeltas[r] = [];
})
function getPrestigeTooltip() {
    const mul = getMetaMultipliers();
    const pts = gameState.meta?.prestigePoints ?? 0;
    const prod = Math.round((mul.production - 1) * 100);
    const know = Math.round((mul.knowledgeProduction - 1) * 100);
    const cost = Math.round((1 - mul.costReduction) * 100);
    const happy = Math.round(mul.happinessBonus);
    const growth = Math.round((mul.growthRate - 1) * 100);
    const start = Math.round((mul.startingResourcesMult - 1) * 100);
    return `Prestige Points: ${pts}\nProduction: +${prod}%\nKnowledge: +${know}%\nCosts: -${cost}%\nHappiness: +${happy}\nGrowth: +${growth}%\nStarting resources: +${start}%\nClick to open`;
}
function updateUIDisplays() {
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
    const ppEl = document.getElementById('prestige-count');
    if (ppEl) ppEl.textContent = gameState.meta?.prestigePoints ?? 0;
    const ppWrap = document.getElementById('prestige-indicator');
    if (ppWrap) ppWrap.title = getPrestigeTooltip();
    updateResourceRateUI();
}
function sampleResourceRates(now) {
    if (now - resourceRateTracker.lastSampleTime < resourceRateTracker.sampleInterval) return;
    const elapsedSeconds = (now - resourceRateTracker.lastSampleTime) / 1000;
    resourceRateTracker.lastSampleTime = now;
    RESOURCE_LIST.forEach(r => {
        const current = gameState.resources[r] || 0;
        const prev = resourceRateTracker.lastValues[r];
        const deltaPerSecond = (current - prev) / Math.max(elapsedSeconds, 0.001);
        resourceRateTracker.lastValues[r] = current;
        const arr = resourceRateTracker.perSecondDeltas[r];
        arr.push(deltaPerSecond);
        while (arr.length > resourceRateTracker.windowSeconds) arr.shift();
    });
}
function getNetRatePerMinute(resource) {
    const arr = resourceRateTracker.perSecondDeltas[resource];
    if (!arr.length) return 0;
    const avgPerSecond = arr.reduce((a,b)=>a+b,0) / arr.length;
    return avgPerSecond * 60;
}
function formatRate(val) {
    if (Math.abs(val) < 0.01) return '0.00/m';
    const sign = val > 0 ? '+' : '';
    const decimals = Math.abs(val) < 1 ? 2 : 1;
    return `${sign}${val.toFixed(decimals)}/m`;
}
function updateResourceRateUI() {
    RESOURCE_LIST.forEach(r => {
        const el = document.getElementById(r + '-rate');
        if (!el) return;
        const perMin = getNetRatePerMinute(r);
        el.textContent = formatRate(perMin);
        el.classList.remove('pos','neg','neu');
        if (perMin > 0.05) el.classList.add('pos');
        else if (perMin < -0.05) el.classList.add('neg');
        else el.classList.add('neu');
    })
}
const tipBanner = document.getElementById('tip-banner');
let tipTimeoutId = null;
function showTip(text, kind = 'info', duration = 7000) {
    if (!tipBanner) return;
    tipBanner.classList.remove('hidden','warning','danger');
    if (kind !== 'info') tipBanner.classList.add(kind);
    tipBanner.textContent = text;
    scenarioPanelElement?.classList.add('hidden');
    clearTimeout(tipTimeoutId);
    tipTimeoutId = setTimeout(() => {
        tipBanner.classList.add('hidden');
        tipBanner.classList.remove('warning', 'danger');
        scenarioPanelElement?.classList.remove('hidden');
    }, duration);
}
function clearTip() {
    if (!tipBanner) return;
    tipBanner.classList.add('hidden');
    clearTimeout(tipTimeoutId);
}
gameState.tips = {
    foodIntro: false,
    buildFarmHint: false,
    unemployedHint: false,
    assignWorkerHint: false,
    housingCapHint: false,
    upgradeHint: false,
    saveWoodForCutterHint: false,
}
function evaluateContextualTips() {
    if (!gameState.tips.foodIntro && gameState.resources.food < GAME_CONFIG.initialResources.food) {
        gameState.tips.foodIntro = true;
        showTip("Food is dropping. Build a Farm to sustain growth.", 'warning');
    }
    if (!gameState.tips.assignWorkerHint) {
        const idleWorkplace = gameState.buildings.find(b => {
            const bp = buildingBlueprints[b.type];
            return bp.workersRequired && b.workersAssigned === 0;
        });
        if (idleWorkplace) {
            gameState.tips.assignWorkerHint = true;
            showTip("Assign workers: click 'Manage Workers' to staff buildings.", 'info');
        }
    }
    if (!gameState.tips.buildFarmHint) {
        const hasFarm = gameState.buildings.some(b => b.type === 'farm');
        if (!hasFarm && gameState.population >= 3 && gameState.resources.food < GAME_CONFIG.initialResources.food * 0.85) {
            gameState.tips.buildFarmHint = true;
            showTip("Build a farm soon or food will run out.", 'danger');
        }
    }
    if (!gameState.tips.unemployedHint && gameState.unemployedWorkers > 0) {
        const hasSlot = gameState.buildings.some(b => {
            const bp = buildingBlueprints[b.type];
            return bp.workersRequired && b.workersAssigned < bp.workersRequired;
        });
        if (hasSlot) {
            gameState.tips.unemployedHint = true;
            showTip("You have unemployed citizens. Assign them for more production.", 'info');
        }
    }
    if (!gameState.tips.housingCapHint && gameState.population === gameState.populationCap && gameState.populationCap > 0) {
        gameState.tips.housingCapHint = true;
        showTip("Population capped. Build or upgrade housing to grow further.", 'warning');
    }
}
function pulseManageWorkersIfNeeded() {
    if (!openWorkerPanelButton) return;
    const idle = gameState.buildings.find(b => {
        const bp = buildingBlueprints[b.type];
        return bp?.workersRequired && (b.workersAssigned || 0) === 0;
    });
    openWorkerPanelButton.classList.toggle('attention-pulse', !!idle);
}
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
        const loadedState = JSON.parse(savedGame);
        const defaultState = {
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
            tips: {
                foodIntro: false,
                buildFarmHint: false,
                unemployedHint: false,
                assignWorkerHint: false,
                housingCapHint: false,
                upgradeHint: false,
                saveWoodForCutterHint: false,
            }
        };
        Object.assign(gameState, defaultState, loadedState);
        gameState.resources = {
            ...defaultState.resources,
            ...(loadedState.resources || {})
        };
        gameState.buildings = Array.isArray(loadedState.buildings) ? loadedState.buildings.map(b => ({...b})) : [];
        gameState.environment = Array.isArray(loadedState.environment) ? loadedState.environment.map(f => ({...f})) : [];
        gameState.floatingTexts = Array.isArray(loadedState.floatingTexts) ? loadedState.floatingTexts.map(ft => ({...ft})) : [];
        gameState.population = loadedState.population ?? defaultState.population;
        gameState.unemployedWorkers = loadedState.unemployedWorkers ?? defaultState.unemployedWorkers;
        gameState.populationCap = loadedState.populationCap ?? defaultState.populationCap;
        gameState.happiness = loadedState.happiness ?? defaultState.happiness;
        gameState.buildMode = loadedState.buildMode ?? defaultState.buildMode;
        gameState.selectedBuilding = loadedState.selectedBuilding ?? defaultState.selectedBuilding;
        gameState.unlockedTechs = Array.isArray(loadedState.unlockedTechs) ? [...loadedState.unlockedTechs] : [];
        gameState.currentScenarioIndex = loadedState.currentScenarioIndex ?? defaultState.currentScenarioIndex;
        gameState.currentObjectiveIndex = loadedState.currentObjectiveIndex ?? defaultState.currentObjectiveIndex;
        gameState.scenarioComplete = loadedState.scenarioComplete ?? defaultState.scenarioComplete;
        gameState.activeEvent = loadedState.activeEvent ?? defaultState.activeEvent;
        gameState.nextEventTime = loadedState.nextEventTime ?? defaultState.nextEventTime;
        gameState.tips = {
            ...defaultState.tips,
            ...(loadedState.tips || {})
        };
        gameState.meta = {
            ...getDefaultMeta(),
            ...(loadedState.meta || {})
        };
        gameState.meta.upgrades = {
            ...DEFAULT_META.upgrades,
            ...(gameState.meta.upgrades || {})
        };
        
        scenarios.forEach((scenario, sIndex) => {
            scenario.objectives.forEach((obj, oIndex) => {
                obj.completed = sIndex < gameState.currentScenarioIndex || (sIndex === gameState.currentScenarioIndex && oIndex < gameState.currentObjectiveIndex);
            });
        });


    } else {
        initNewGame();
    }
}

function initNewGame() {
    const preservedMeta = gameState?.meta ? JSON.parse(JSON.stringify(gameState.meta)) : getDefaultMeta();
    gameState = {
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
        tips: {
            foodIntro: false,
            buildFarmHint: false,
            unemployedHint: false,
            assignWorkerHint: false,
            housingCapHint: false,
            upgradeHint: false,
            saveWoodForCutterHint: false,
        },
        meta: preservedMeta
    };
    gameState.meta = {
        ...getDefaultMeta(),
        ...(gameState.meta || {})
    };
    gameState.meta.upgrades = {
        ...DEFAULT_META.upgrades,
        ...(gameState.meta.upgrades || {})
    };
    const startMult = getMetaMultipliers().startingResourcesMult;
    RESOURCE_LIST.forEach(r => {
        gameState.resources[r] = Math.floor((gameState.resources[r] || 0) * startMult);
    });
    generateEnvironment();
    RESOURCE_LIST.forEach(r => {
        resourceRateTracker.lastValues[r] = gameState.resources[r] || 0;
        resourceRateTracker.perSecondDeltas[r] = [];
    });
}
function getDefaultMeta() {
    return JSON.parse(JSON.stringify(DEFAULT_META));
}
function getMetaMultipliers() {
    const u = (gameState.meta?.upgrades) || DEFAULT_META.upgrades;
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    return {
        production: 1 + 0.15 * clamp(u.productionBoost, 0, PRESTIGE_DEFS.productionBoost.max),
        costReduction: Math.max(0.4, 1 - 0.03 * clamp(u.frugalBuilders, 0, PRESTIGE_DEFS.frugalBuilders.max)),
        happinessBonus: 2 * clamp(u.happyHearts, 0, PRESTIGE_DEFS.happyHearts.max),
        knowledgeProduction: 1 + 0.25 * clamp(u.quickStudies, 0, PRESTIGE_DEFS.quickStudies.max),
        growthRate: 1 + 0.20 * clamp(u.growthSpurt, 0, PRESTIGE_DEFS.growthSpurt.max),
        startingResourcesMult: 1 + 0.50 * clamp(u.startingKit, 0, PRESTIGE_DEFS.startingKit.max),
    };
}
function calculatePrestigeGains() {
    const meta = gameState.meta || getDefaultMeta();
    const knowledgeScore = Math.sqrt((meta.totalKnowledgeEarned || 0) / 25);
    const popScore = Math.sqrt(Math.max(meta.totalPopulationEver, gameState.population)) / 2;
    const builtScore = (meta.totalBuildingsBuilt || 0) / 50;
    const hasVictory = gameState.buildings.some(b => b.type === 'victory-project');
    const milestoneScore = hasVictory ? 25 : 0;
    const total = Math.floor(knowledgeScore + popScore + builtScore + milestoneScore);
    return Math.max(0, total);
}
function doPrestige() {
    const gains = calculatePrestigeGains();
    if (gains <= 0) {
        showMessage('Not enough progress to prestige yet.', 3000);
        return;
    }
    const confirmMsg = `Prestige will reset your current run but grant ${gains} Prestige Points.\nPermanent upgrades persist across runs.\nProceed?`;
    if (!confirm(confirmMsg)) return;
    if (!gameState.meta) gameState.meta = getDefaultMeta();
    gameState.meta.prestigePoints += gains;
    gameState.meta.totalPrestiges += 1;
    const preservedMeta = JSON.parse(JSON.stringify(gameState.meta));
    localStorage.removeItem('humanitySurvivalSave');
    initNewGame();
    gameState.meta = preservedMeta;
    saveGame();
    showMessage(`Prestiged! Gained ${gains} Prestige Points.`, 4000);
    buildMenuDirty = true;
    researchPanelDirty = true;
    scenarioPanelDirty = true;
    refreshUI();
}
function openPrestigePanel() {
    let modal = document.getElementById('prestige-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prestige-modal';
        modal.className = 'modal';
        modal.style.inset = '0';
        modal.style.position = 'fixed';
        modal.style.background = 'rgba(0,0,0,0.55)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
        <div style="background:#1f2937;color:#fff;padding:16px;max-width:680px;width:95%;border-radius:8px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <h2 style="margin:0">Prestige & Meta Upgrades</h2>
                <button id="prestige-close" title="Close">✕</button>
            </div>
            <div id="prestige-summary" style="margin-bottom:8px"></div>
            <div id="prestige-upgrades" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:50vh;overflow:auto"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
                <button id="prestige-now" class="danger">Prestige Now</button>
                <small id="prestige-tip" style="opacity:.8"></small>
            </div>
        </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#prestige-close').onclick = () => modal.remove();
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#prestige-now').onclick = () => {
            doPrestige();
            modal.remove();
        };
    }
    const gains = calculatePrestigeGains();
    const pts = (gameState.meta?.prestigePoints) || 0;
    modal.querySelector('#prestige-summary').innerHTML = `
        <div><strong>Current Prestige points:</strong> ${pts}</div>
        <div><strong>Prestige now to gain:</strong> +${gains}</div>
    `;
    modal.querySelector('#prestige-tip').textContent = 'Tip: Build, research, grow population, and complete milestones to earn more points.';
    const container = modal.querySelector('#prestige-upgrades');
    container.innerHTML = '';
    const meta = gameState.meta || getDefaultMeta();
    const points = meta.prestigePoints;
    Object.entries(PRESTIGE_DEFS).forEach(([key, def]) => {
        const level = meta.upgrades[key] || 0;
        const atMax = level >= def.max;
        const canBuy = points >= def.cost && !atMax;
        const card = document.createElement('div');
        card.style.border = '1px solid #374151';
        card.style.borderRadius = '6px';
        card.style.padding = '8px';
        card.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px">${def.name}</div>
            <div style="font-size:12px;opacity:.9;margin-bottom:6px">${def.desc}</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
            <small>Level: ${level}/${def.max}</small>
            <button ${canBuy ? '' : 'disabled'} data-upgrade="${key}">Buy (-${def.cost})</button>
        </div>`;
        const btn = card.querySelector('button');
        btn.onclick = () => {
            if (!gameState.meta) gameState.meta = getDefaultMeta();
            if (gameState.meta.prestigePoints < def.cost || gameState.meta.upgrades[key] >= def.max) return;
            gameState.meta.prestigePoints -= def.cost;
            gameState.meta.upgrades[key] += 1;
            saveGame();
            openPrestigePanel();
            showMessage(`Purchased ${def.name}`, 2500);
        };
        container.appendChild(card);
    })
}
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    trapFocusInWelcome();
    scenarioPanelElement?.classList.add('hidden');
}
function hideWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    untrapFocusInWelcome();
    scenarioPanelElement?.classList.remove('hidden');
}
function wireWelcomeButtons() {
    const startBtn = document.getElementById('welcome-start-tutorial');
    const skipBtn = document.getElementById('welcome-skip-tutorial');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            gameState.meta = gameState.meta || getDefaultMeta();
            gameState.meta.tutorialCompleted = false;
            gameState.meta.tutorialPending = true;
            hideWelcomeModal();
            showTip('Starting tutorial', 'info', 3500);
            if (typeof startOnboarding === 'function') startOnboarding();
            saveGame();
        });
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            cancelOnboarding();
            gameState.meta = gameState.meta || getDefaultMeta();
            gameState.meta.tutorialCompleted = true;
            gameState.meta.tutorialPending = false;
            hideWelcomeModal();
            showTip('Tutorial skipped. You can replay it from settings.', 'info', 3000);
            saveGame();
        });
    }
    cancelTutorialButton?.addEventListener('click', () => {
        if (confirm('Cancel the tutorial?')) cancelOnboarding();
    });
}
function showEventChoiceModal(event) {
    if (!eventChoiceModal || !eventChoiceTitle || !eventChoiceDescription || !eventChoicesList) return;
    eventChoiceTitle.textContent = event.title;
    eventChoiceDescription.textContent = event.description;
    eventChoicesList.innerHTML = '';
    event.choices.forEach(choice => {
        const canAfford = Object.entries(choice.cost || {}).every(([resource, amount]) => gameState.resources[resource] >= amount);
        const costString = Object.entries(choice.cost || {}).map(([r,a]) => `${a} ${r}`).join(', ');
        const button = document.createElement('button');
        button.className = 'event-choice-button';
        button.disabled = !canAfford;
        let buttonHTML = `<span>${choice.text}</span>`;
        if (costString) {
            buttonHTML += `<small>Cost: ${costString}</small>`;
        }
        button.innerHTML = buttonHTML;
        button.onclick = () => {
            Object.entries(choice.cost || {}).forEach(([resource, amount]) => {
                gameState.resources[resource] -= amount;
            });
            if (choice.effect) {
                choice.effect();
            }
            eventChoiceModal.classList.add('hidden');
            gameState.activeEvent = null; 
        };
        eventChoicesList.appendChild(button);
    });
    eventChoiceModal.classList.remove('hidden');
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
    if (gameState.activeEvent && gameState.activeEvent.type !== 'choice') {
        const elapsed = timestamp - gameState.activeEvent.startTime;
        const progress = (elapsed / gameState.activeEvent.duration);
        const pct = Math.max(0, Math.min(100, progress * 100));
        eventProgressBar?.style && (eventProgressBar.style.width = `${pct}%`);
        if (elapsed >= gameState.activeEvent.duration) {
            gameState.activeEvent = null;
            eventBar?.classList.add('hidden');
        }
    }
    if (!gameState.nextEventTime) {
        gameState.nextEventTime = timestamp + GAME_CONFIG.timers.eventIntervalMin + Math.random() * GAME_CONFIG.timers.eventIntervalRandom;
    }
    if (timestamp >= gameState.nextEventTime && !gameState.activeEvent) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        gameState.activeEvent = { ...event, startTime: timestamp };
        const nextEventDelay = (event.duration || 0) + GAME_CONFIG.timers.eventIntervalMin + Math.random() * GAME_CONFIG.timers.eventIntervalRandom;
        gameState.nextEventTime = timestamp + nextEventDelay;

        if (event.type === 'choice') {
            showEventChoiceModal(event);
        } else {
            if (eventTitle) eventTitle.textContent = event.title;
            if (eventDescription) eventDescription.textContent = event.description;
            eventBar?.classList.remove('hidden');
            if (event.effect) {
                event.effect();
            }
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
function getAdjacentBuildings(building, range) {
    const adjacent = [];
    const buildingCenterX = building.x + building.width / 2;
    const buildingCenterY = building.y + building.height / 2;
    for (const other of gameState.buildings) {
        if (other === building) continue;
        const otherCenterX = other.x + other.width / 2;
        const otherCenterY = other.y + other.height / 2;
        const distance = Math.sqrt(Math.pow(buildingCenterX - otherCenterX, 2) + Math.pow(buildingCenterY - otherCenterY, 2));
        if (distance <= range) {
            adjacent.push(other);
        }
    }
    return adjacent;
}
function updateHappiness(delta) {
    let baseHappiness = GAME_CONFIG.happiness.base;
    let happinessFactors = 0;
    happinessFactors += gameState.globalHappinessBonus || 0;
    happinessFactors += (gameState.resources.food > 0) ? GAME_CONFIG.happiness.foodBonus : GAME_CONFIG.happiness.foodPenalty;
    happinessFactors -= gameState.unemployedWorkers * GAME_CONFIG.happiness.unemployedPenalty;
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (!blueprint) continue;
        if (blueprint.providesHappiness) {
            happinessFactors += blueprint.providesHappiness;
        }
        if (blueprint.adjacency && blueprint.adjacency.to === 'happiness') {
            const neighbors = getAdjacentBuildings(building, blueprint.adjacency.range);
            const fromTypes = Array.isArray(blueprint.adjacency.from) ? blueprint.adjacency.from : [blueprint.adjacency.from];
            for (const neighbor of neighbors) {
                if (fromTypes.includes(neighbor.type)) {
                    happinessFactors += blueprint.adjacency.bonus;
                }
            }
        }
    }
    happinessFactors += getMetaMultipliers().happinessBonus;
    let targetHappiness = baseHappiness + happinessFactors;
    if (targetHappiness > 100) targetHappiness = 100;
    if (targetHappiness < 0) targetHappiness = 0;
    gameState.happiness += (targetHappiness - gameState.happiness) * GAME_CONFIG.rates.happinessChangeSpeed * delta;
}

function getHappinessModifier() {
    if (gameState.happiness > GAME_CONFIG.happiness.highHappinessThreshold) {
        return GAME_CONFIG.happiness.highHappinessModifier;
    } else if (gameState.happiness < GAME_CONFIG.happiness.lowHappinessThreshold) {
        return GAME_CONFIG.happiness.lowHappinessModifier;
    }
    return 1;
}

function getEventModifier(type) {
    if (gameState.activeEvent?.modifier?.type === type) {
        return gameState.activeEvent.modifier.multiplier;
    }
    return 1.0;
}

function updateProduction(delta) {
    const happinessModifier = getHappinessModifier();
    const eventProductionModifier = getEventModifier('produces');
    const eventCostModifier = getEventModifier('cost');
    let globalProductionModifier = 1.0;
    let globalFoodConsumptionModifier = 1.0;
    gameState.globalHappinessBonus = 0;
    const metaMul = getMetaMultipliers();
    gameState.buildings.forEach(building => {
        const blueprint = buildingBlueprints[building.type];
        if (blueprint.globalModifier) {
            const isPowered = !blueprint.workersRequired || building.workersAssigned >= blueprint.workersRequired;
            if (isPowered) {
                if (blueprint.globalModifier.type === 'produces') {
                    globalProductionModifier *= blueprint.globalModifier.multiplier;
                }
                if (blueprint.globalModifier.happiness) {
                    gameState.globalHappinessBonus += blueprint.globalModifier.happiness;
                }
                if (blueprint.globalModifier.foodConsumption) {
                    globalFoodConsumptionModifier *= blueprint.globalModifier.foodConsumption;
                }
            }
        }
    });
    const adjacencyMultipliers = new Map();
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        if (!blueprint.adjacency || blueprint.adjacency.to === 'happiness') continue;
        
        let bonusMultiplier = 1.0;
        const fromTypes = Array.isArray(blueprint.adjacency.from) ? blueprint.adjacency.from : [blueprint.adjacency.from];
        const neighbors = getAdjacentBuildings(building, blueprint.adjacency.range);

        for (const neighbor of neighbors) {
            if (fromTypes.includes(neighbor.type)) {
                bonusMultiplier += blueprint.adjacency.bonus;
            }
        }

        if (bonusMultiplier > 1.0) {
            adjacencyMultipliers.set(building, { resource: blueprint.adjacency.to, multiplier: bonusMultiplier });
        }
    }
    for (const building of gameState.buildings) {
        const blueprint = buildingBlueprints[building.type];
        building.needsTools = false;

        if (building.workersAssigned > 0) {
            let currentProductionModifier = 1.0;
            let canProduce = true;
            if (blueprint.consumes?.tools && gameState.resources.tools < (blueprint.consumes.tools * building.workersAssigned * delta)) {
                currentProductionModifier = GAME_CONFIG.production.noToolsModifier;
                building.needsTools = true;
            }

            if (blueprint.consumes) {
                for (const resource in blueprint.consumes) {
                    if (resource !== 'tools' && gameState.resources[resource] < (blueprint.consumes[resource] * building.workersAssigned * delta)) {
                        canProduce = false;
                        break;
                    }
                }
            }
            if (canProduce) {
                if (blueprint.consumes) {
                    for (const resource in blueprint.consumes) {
                        let consumptionRate = blueprint.consumes[resource] * building.workersAssigned;
                        if (gameState.activeEvent?.modifier?.type === 'consumes' && gameState.activeEvent.modifier.resource === resource) {
                            consumptionRate *= gameState.activeEvent.modifier.multiplier;
                        }
                        const amountToConsume = consumptionRate * eventCostModifier * delta;
                        if (resource === 'tools') {
                            const actual = Math.min(gameState.resources.tools, amountToConsume);
                            gameState.resources.tools -= actual;
                        } else {
                            gameState.resources[resource] = Math.max(0, gameState.resources[resource] - amountToConsume);
                        }
                    }
                }
                if (blueprint.produces) {
                    for (const resource in blueprint.produces) {
                        let baseProductionRate = blueprint.produces[resource];
                        let adjacencyMultiplier = 1.0;
                        const adjBonus = adjacencyMultipliers.get(building);
                        if (adjBonus && adjBonus.resource === resource) {
                            adjacencyMultiplier = adjBonus.multiplier;
                        }
                        let prestigeProd = metaMul.production;
                        if (resource === 'knowledge') prestigeProd *= metaMul.knowledgeProduction;
                        const finalProduction = baseProductionRate * building.workersAssigned * happinessModifier * currentProductionModifier * eventProductionModifier * adjacencyMultiplier * globalProductionModifier * prestigeProd;
                        gameState.resources[resource] += finalProduction * delta;
                        if (resource === 'knowledge') {
                            if (!gameState.meta) gameState.meta = getDefaultMeta();
                            gameState.meta.totalKnowledgeEarned = (gameState.meta.totalKnowledgeEarned || 0) + (finalProduction * delta);
                        }
                        if (finalProduction > 0 && Math.random() < 0.05) {
                            createFloatingText(`+${(finalProduction * 60).toFixed(2)}`, building.x + building.width / 2, building.y);
                        }
                    }
                }
            }
        }
    }
    if (gameState.population > 0) {
        const foodConsumed = gameState.population * GAME_CONFIG.rates.foodConsumption * globalFoodConsumptionModifier * delta;
        gameState.resources.food -= foodConsumed;
        if (gameState.resources.food < 0) {
            gameState.resources.food = 0;
        }
    }
}
function updatePopulation(delta) {
    if (gameState.population < gameState.populationCap && gameState.resources.food > 0) {
        const metaMul = getMetaMultipliers();
        if (gameState.population === 0) {
        const starterBase = GAME_CONFIG.rates.initialPopulationGrowthChance || 0.02;
        const foodFactor = Math.min(1, (gameState.resources.food || 0) / Math.max(1, GAME_CONFIG.initialResources.food));
        const starterChance = Math.min(1, starterBase * 6 * metaMul.growthRate + 0.35 * foodFactor);
        if (Math.random() < starterChance * delta) {
            gameState.population++;
            gameState.unemployedWorkers++;
            if (!gameState.meta) gameState.meta = getDefaultMeta();
            gameState.meta.totalPopulationEver = (gameState.meta.totalPopulationEver || 0) + 1;
        }
        gameState.population = Math.max(0, gameState.population);
        gameState.unemployedWorkers = Math.max(0, gameState.unemployedWorkers);
        return;
    }
        const growthChanceBase = (gameState.population === 0) ? GAME_CONFIG.rates.initialPopulationGrowthChance : GAME_CONFIG.rates.populationGrowthChance;
        const growthChance = growthChanceBase * metaMul.growthRate;
        if (Math.random() < growthChance * delta) {
            gameState.population++;
            gameState.unemployedWorkers++;
            if (!gameState.meta) gameState.meta = getDefaultMeta();
            gameState.meta.totalPopulationEver = (gameState.meta.totalPopulationEver || 0) + 1;
        }
    }
    gameState.population = Math.max(0, gameState.population);
    gameState.unemployedWorkers = Math.max(0, gameState.unemployedWorkers);
}
function updatePopulationCap() {
    let newPopCap = 0;
    for (const building of gameState.buildings) {
        if (buildingBlueprints[building.type].providesCap) {
            newPopCap += buildingBlueprints[building.type].providesCap;
        }
    }
    gameState.populationCap = newPopCap;
    derivedDirty.populationCap = false;
}

function update(delta) {
    updateScenario();
    evaluateContextualTips();
    updateProduction(delta);
    updateHappiness(delta);
    updatePopulationCap();
    updatePopulation(delta);
    updateFloatingTexts();
}

function isImageReady(blueprint) {
    return blueprint.img && blueprint.img.complete && !blueprint.img.failed && blueprint.img.naturalWidth !== 0;
}
function findLowestSupportY(x, width) {
    const groundY = canvas.height - 50;
    let highestY = groundY;
    for (const building of gameState.buildings) {
        const overlapsX = x < building.x + building.width && x + width > building.x;
        if (overlapsX) {
            if (building.y < highestY) {
                highestY = building.y;
            }
        }
    }
    return highestY;
}
function isAreaOccupied(x, y, width, height) {
    for (const building of gameState.buildings) {
        if (x < building.x + building.width &&
            x + width > building.x &&
            y < building.y + building.height &&
            y + height > building.y) {
            return true;
        }
    }
    return false;
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gs = (typeof GRID_SIZE !== 'undefined') ? GRID_SIZE : 32;
    if (gridCanvas) {
        ctx.drawImage(gridCanvas, 0, 0);
    } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += gs) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gs) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(canvas.width, y + 0.5);
            ctx.stroke();
        }
    }
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    for (const feature of gameState.environment) {
        ctx.fillStyle = feature.color;
        ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
    }
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

    if (gameState.buildMode && mousePos.x !== null && mousePos.y !== null) {
        const blueprint = buildingBlueprints[gameState.buildMode];
        if (blueprint) {
            const previewX = Math.floor(mousePos.x / GRID_SIZE) * GRID_SIZE;
            const supportY = findLowestSupportY(previewX, blueprint.width);
            const previewY = supportY - blueprint.height;
            const occupied = isAreaOccupied(previewX, previewY, blueprint.width, blueprint.height);

            ctx.save();
            ctx.globalAlpha = 0.6;
            if (occupied) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.fillRect(previewX, previewY, blueprint.width, blueprint.height);
            } else {
                if (isImageReady(blueprint)) {
                    ctx.drawImage(blueprint.img, previewX, previewY, blueprint.width, blueprint.height);
                } else {
                    ctx.fillStyle = blueprint.color || '#ffffff';
                    ctx.fillRect(previewX, previewY, blueprint.width, blueprint.height);
                }
            }
            ctx.restore();
        }
    }
    for (const ft of gameState.floatingTexts) {
        ctx.globalAlpha = ft.duration / ft.maxDuration;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;
}
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 100;
let lastUIUpdateTime = 0;
const UI_UPDATE_INTERVAL = 250;

function gameLoop(timestamp) {
    if (!lastUpdateTime) {
        lastUpdateTime = timestamp;
    }
    const deltaTime = timestamp - lastUpdateTime;

    if (deltaTime >= UPDATE_INTERVAL) {
        const logicTicks = Math.floor(deltaTime / UPDATE_INTERVAL);
        const deltaInSeconds = UPDATE_INTERVAL / 1000.0;

        for (let i = 0; i < logicTicks; i++) {
            update(deltaInSeconds);
        }
        
        updateEvents(timestamp);
        sampleResourceRates(timestamp);
        lastUpdateTime += logicTicks * UPDATE_INTERVAL;
        if (timestamp - lastUIUpdateTime >= UI_UPDATE_INTERVAL) {
            refreshUI();
            lastUIUpdateTime = timestamp;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

const mousePos = { x: null, y: null };
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    if (isAnyModalOpen() && !(gameState.onboarding && gameState.onboarding.step === 3)) {
        return;
    }
    mousePos.x = clickX;
    mousePos.y = clickY;
    if (gameState.buildMode) {
        placeBuilding(clickX, clickY);
        return;
    }
    const clickedBuilding = getBuildingAt(clickX, clickY);
    if (clickedBuilding) {
        gameState.selectedBuilding = clickedBuilding;
        openUpgradePanel(gameState.selectedBuilding);
        return;
    }
    const clickedFeature = getEnvironmentFeatureAt(clickX, clickY);
    if (clickedFeature) {
        harvestFeature(clickedFeature);
        return;
    }
    hideUpgradePanel();
}
if (canvas.__mainClickHandler) {
    canvas.removeEventListener('click', canvas.__mainClickHandler);
}
    canvas.__mainClickHandler = handleCanvasClick;
canvas.addEventListener('click', handleCanvasClick);

function placeBuilding(clickX, clickY) {
    const blueprint = buildingBlueprints[gameState.buildMode];
    if (!blueprint) {
        return;
    }
    const useX = (typeof clickX === 'number') ? clickX : mousePos.x;
    const useY = (typeof clickY === 'number') ? clickY : mousePos.y;
    if (useX == null || useY == null) {
        showMessage('Invalid build position.', 1500);
        return;
    }
    let costModifier = 1.0;
    if (gameState.activeEvent?.modifier?.type === 'cost') {
        costModifier = gameState.activeEvent.modifier.multiplier;
    }
    costModifier *= getMetaMultipliers().costReduction;
    const snappedX = Math.floor(useX / GRID_SIZE) * GRID_SIZE;
    const supportY = findLowestSupportY(snappedX, blueprint.width);
    const snappedY = supportY - blueprint.height;
    if (
        snappedX < 0 ||
        snappedY < 0 ||
        snappedX + blueprint.width > canvas.width ||
        snappedY + blueprint.height > canvas.height
    ) {
        showMessage("Cannot build outside the map.", 2000);
        return;
    }
    let canAfford = true;
    for (const resource in blueprint.cost) {
        if (gameState.resources[resource] < blueprint.cost[resource] * costModifier) {
            canAfford = false;
            const needed = Math.ceil(blueprint.cost[resource] * costModifier);
            const have = Math.floor(gameState.resources[resource] || 0);
            showTip(`Not enough ${resource} to build ${blueprint.name}. Need ${needed}, have ${have}.`, 'warning', 5000);
            showMessage(`Not enough ${resource}!`, 2000);
            break;
        }
    }
    if (!canAfford) {
        return;
    }
    if (isAreaOccupiedByFeature(snappedX, snappedY, blueprint.width, blueprint.height)) {
        showMessage("Cannot build here, area must be cleared first.", 2000);
        showTip("Clear forests or stone deposits before building.", "warning", 5000);
        return;
    }
    if (isAreaOccupied(snappedX, snappedY, blueprint.width, blueprint.height)) {
        showMessage("Cannot build here, area is occupied.", 2000);
        return;
    }
    for (const resource in blueprint.cost) {
        gameState.resources[resource] -= blueprint.cost[resource] * costModifier;
    }
    const newBuilding = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(16).slice(2)),
        type: gameState.buildMode,
        x: snappedX,
        y: snappedY,
        width: blueprint.width,
        height: blueprint.height,
        color: blueprint.color,
        workersAssigned: 0,
    };
    gameState.buildings.push(newBuilding);
    derivedDirty.populationCap = true;
    derivedDirty.happinessStructure = true;
    if (!gameState.meta) gameState.meta = getDefaultMeta();
    gameState.meta.totalBuildingsBuilt = (gameState.meta.totalBuildingsBuilt || 0) + 1;
    gameState.buildMode = null;
    canvas.classList.remove('build-cursor');
    updateUIDisplays();
    populateBuildMenu();
}
function isAreaOccupiedByFeature(x, y, width, height) {
    for (const feature of gameState.environment) {
        if (
            x < feature.x + feature.width &&
            x + width > feature.x &&
            y < feature.y + feature.height &&
            y + height > feature.y
        ) {
            return true;
        }
    }
    return false;
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
    if (scenarioTitleElement && objectivesListElement && scenarioToggleIcon) {
        scenarioTitleElement.addEventListener('click', () => {
            objectivesListElement.classList.toggle('collapsed');
            if (objectivesListElement.classList.contains('collapsed')) {
                scenarioToggleIcon.style.transform = 'rotate(-90deg)';
            } else {
                scenarioToggleIcon.style.transform = 'rotate(0deg)';
            }
        })
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameState.buildMode) {
            gameState.buildMode = null;
            canvas.classList.remove('build-cursor');
            showMessage('Build cancelled.', 1500);
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
    openWorkerPanelButton?.addEventListener('click', () => {
        workerPanelModal?.classList.remove('hidden');
        populateWorkerPanel();
    });

    closeWorkerPanelButton?.addEventListener('click', () => {
        workerPanelModal?.classList.add('hidden');
    });

    closeStatsPanelButton?.addEventListener('click', () => {
        statsPanelModal?.classList.add('hidden');
    });
    
    newGameButton?.addEventListener('click', () => {
        if (confirm('Are you sure? Your current progress will be lost.')) {
            localStorage.removeItem('humanitySurvivalSave');
            window.location.reload();
        }
    });

    if (newGameButton && !document.getElementById('settings-prestige-button')) {
        const prestigeBtn = document.createElement('button');
        prestigeBtn.id = 'settings-prestige-button';
        prestigeBtn.textContent = 'Prestige';
        prestigeBtn.title = 'Reset run for permanent points & upgrades';
        prestigeBtn.style.marginLeft = '8px';
        prestigeBtn.addEventListener('click', openPrestigePanel);
        newGameButton.parentElement?.appendChild(prestigeBtn);
    }
    document.getElementById('prestige-indicator')?.addEventListener('click', openPrestigePanel);
    upgradeCloseButton?.addEventListener('click', hideUpgradePanel);
    upgradeButton?.addEventListener('click', performUpgrade);
    demolishButton?.addEventListener('click', performDemolish);
}
let messageTimeout;
function showMessage(text, duration = 2000) {
    clearTimeout(messageTimeout);
    if (!messageBoxElement) return;
    messageBoxElement.textContent = text;
    messageTimeout = setTimeout(() => {
        if (messageBoxElement) messageBoxElement.textContent = '';
    }, duration);
}

function refreshUI() {
    updateUIDisplays();
    if (buildMenuDirty) {
        populateBuildMenu();
        buildMenuDirty = false;
    }
    if (researchPanelDirty) {
        populateResearchPanel();
        researchPanelDirty = false;
    }
    if (scenarioPanelDirty) {
        populateScenarioPanel();
        scenarioPanelDirty = false;
    }
    pulseManageWorkersIfNeeded();
}

function hideUpgradePanel() {
    selectedBuildingInfo?.classList.add('hidden');
}

function openUpgradePanel(building, isRefresh = false) {
    if (!building) return hideUpgradePanel();
    const blueprint = buildingBlueprints[building.type];
    if (!blueprint) return hideUpgradePanel();
    if (demolishButton) demolishButton.style.display = 'block';
    if (upgradeCurrentStats) upgradeCurrentStats.innerHTML = '';

    if (upgradeCurrentName) upgradeCurrentName.textContent = blueprint.name + (building.needsTools ? ' (Needs Tools)' : '');
    if (upgradeCurrentImage) upgradeCurrentImage.src = blueprint.imgSrc || '';
    const addStat = (ul, text) => { const li = document.createElement('li'); li.textContent = text; ul.appendChild(li); };
    if (upgradeCurrentStats) {
        if (blueprint.providesCap) addStat(upgradeCurrentStats, `Housing: +${blueprint.providesCap}`);
        if (blueprint.providesHappiness) addStat(upgradeCurrentStats, `Happiness: +${blueprint.providesHappiness}`);
        if (blueprint.produces) for (const r in blueprint.produces) addStat(upgradeCurrentStats, `Produces ${r}: ${blueprint.produces[r].toFixed(3)}/tick`);
        if (blueprint.consumes) for (const r in blueprint.consumes) addStat(upgradeCurrentStats, `Consumes ${r}: ${blueprint.consumes[r].toFixed(3)}/tick`);
        if (blueprint.workersRequired) addStat(upgradeCurrentStats, `Workers: ${building.workersAssigned||0}/${blueprint.workersRequired}`);
    }

    const nextType = upgradePaths[building.type];
    if (!nextType) {
        upgradeNextWrapper?.classList.add('hidden');
        noUpgradeMessage?.classList.remove('hidden');
        if (upgradeButton) upgradeButton.disabled = true;
    } else {
        const nextBlueprint = buildingBlueprints[nextType];
        if (!nextBlueprint) return;
        noUpgradeMessage?.classList.add('hidden');
        upgradeNextWrapper?.classList.remove('hidden');
        if (upgradeNextName) upgradeNextName.textContent = nextBlueprint.name;
        if (upgradeNextImage) upgradeNextImage.src = nextBlueprint.imgSrc || '';
        if (upgradeNextBenefits) upgradeNextBenefits.innerHTML = '';
        if (upgradeNextBenefits) {
            if (nextBlueprint.providesCap) addStat(upgradeNextBenefits, `Housing: +${nextBlueprint.providesCap}`);
            if (nextBlueprint.providesHappiness) addStat(upgradeNextBenefits, `Happiness: +${nextBlueprint.providesHappiness}`);
            if (nextBlueprint.produces) for (const r in nextBlueprint.produces) addStat(upgradeNextBenefits, `Produces ${r}: ${nextBlueprint.produces[r].toFixed(3)}/tick`);
            if (nextBlueprint.consumes) for (const r in nextBlueprint.consumes) addStat(upgradeNextBenefits, `Consumes ${r}: ${nextBlueprint.consumes[r].toFixed(3)}/tick`);
            if (nextBlueprint.workersRequired) addStat(upgradeNextBenefits, `Workers: ${nextBlueprint.workersRequired}`);
        }
        const discountedCost = {};
        const prestigeCostReduction = getMetaMultipliers().costReduction;
        const eventCostMultiplier = (gameState.activeEvent?.modifier?.type === 'cost') ? gameState.activeEvent.modifier.multiplier : 1;
        for (const r in nextBlueprint.cost) {
            const base = nextBlueprint.cost[r] * (typeof UPGRADE_COST_MULTIPLIER !== 'undefined' ? UPGRADE_COST_MULTIPLIER : 1);
            discountedCost[r] = Math.ceil(base * prestigeCostReduction * eventCostMultiplier);
        }
        if (upgradeCosts) upgradeCosts.innerHTML = Object.entries(discountedCost).map(([r,v]) => `<span>${r}: ${v}</span>`).join('');
        let reqText = '';
        if (nextBlueprint.locked && !gameState.unlockedTechs.some(t => (researchTree[t]?.unlocks||[]).includes(nextType))) {
            reqText = 'Requires research to unlock.';
        }
        if (upgradeRequirements) upgradeRequirements.textContent = reqText;
        let canAfford = !reqText;
        if (canAfford) {
            for (const r in discountedCost) {
                if ((gameState.resources[r]||0) < discountedCost[r]) { canAfford = false; break; }
            }
        }
        if (upgradeButton) {
            upgradeButton.disabled = !canAfford;
            upgradeButton.dataset.nextType = nextType;
            upgradeButton.dataset.cost = JSON.stringify(discountedCost);
        }
    }

    selectedBuildingInfo?.classList.remove('hidden');
    if (building && !gameState.tips.upgradeHint && upgradePaths[building.type]) {
        gameState.tips.upgradeHint = true;
        showTip("Upgrading saves space and boosts stats. Check costs here.", 'info', 8000);
    }
    if (demolishButton) {
        demolishButton.disabled = false;
        updateDemolishTooltip(building);
    }
}
function updateDemolishTooltip(building) {
    if (!demolishButton || !building) return;
    const bp = buildingBlueprints[building.type];
    if (!bp) { demolishButton.title = 'Demolish'; return;}
    let refundText = 'No build cost to refund';
    if (bp.cost) {
        const parts = Object.entries(bp.cost)
        .map(([r,v]) => `${Math.floor(v * 0.5)} ${r}`);
        if (parts.length) refundText = 'Refund:' + parts.join(', ');
    }
    let warning = '';
    const capLoss = bp.providesCap || 0;
    if (capLoss > 0) {
        const newCap = gameState.populationCap - capLoss;
        if (gameState.population > newCap) {
            const over = gameState.population - newCap;
            warning = `\nWarning: Population would exceed housing by ${over}. (Growth will halt)`;
        }
    }
    demolishButton.title = `Demolish ${bp.name}\n${refundText}${warning}\nClick to remove this building.`;

}
function performUpgrade() {
    if (!gameState.selectedBuilding || !upgradeButton?.dataset.nextType) return;
    const nextType = upgradeButton.dataset.nextType;
    const cost = JSON.parse(upgradeButton.dataset.cost || '{}');
    for (const r in cost) {
        if ((gameState.resources[r]||0) < cost[r]) {
            showMessage('Not enough resources.', 2500);
            return;
        }
    }
    for (const r in cost) gameState.resources[r] -= cost[r];
    const old = gameState.selectedBuilding;
    const idx = gameState.buildings.indexOf(old);
    if (idx === -1) return;
    const newBlueprint = buildingBlueprints[nextType];
    const oldWorkers = old.workersAssigned || 0;
    const newMaxWorkers = newBlueprint.workersRequired || 0;
    const newAssignedWorkers = Math.min(oldWorkers, newMaxWorkers);
    const returnedWorkers = oldWorkers - newAssignedWorkers;
    if (returnedWorkers > 0) {
        gameState.unemployedWorkers += returnedWorkers;
    }
    const upgraded = {
        ...old,
        type: nextType,
        width: newBlueprint.width,
        height: newBlueprint.height,
        color: newBlueprint.color,
        workersAssigned: newAssignedWorkers
    };
    gameState.buildings[idx] = upgraded;
    gameState.selectedBuilding = upgraded;
    derivedDirty.populationCap = true;
    derivedDirty.happinessStructure = true;
    updatePopulationCap();
    showMessage('Upgraded to ' + newBlueprint.name + '!', 3000);
    populateBuildMenu();
    populateResearchPanel();
    updateUIDisplays();
    openUpgradePanel(upgraded, true);
}
function performDemolish() {
    if (!gameState.selectedBuilding) return;
    const building = gameState.selectedBuilding;
    const blueprint = buildingBlueprints[building.type];
    if (!blueprint) return;
    if (!confirm(`Demolish ${blueprint.name}? You will receive 50% of its build cost back.`)) return;
    if (blueprint.cost) {
        for (const resource in blueprint.cost) {
            const refund = Math.floor(blueprint.cost[resource] * 0.5);
            if (refund > 0) gameState.resources[resource] += refund;
        }
    }
    if (building.workersAssigned > 0) {
        gameState.unemployedWorkers += building.workersAssigned;
    }
    gameState.unemployedWorkers = Math.min(gameState.unemployedWorkers, gameState.population);
    const idx = gameState.buildings.indexOf(building);
    if (idx !== -1) gameState.buildings.splice(idx, 1);
    updatePopulationCap();
    derivedDirty.populationCap = false;
    gameState.selectedBuilding = null;
    hideUpgradePanel();
    if (gameState.population > gameState.populationCap) {
        showTip(`Warning: Population exceeds housing cap by ${gameState.population - gameState.populationCap}. Population growth halted until more housing is built.`, 'danger', 9000);
    }
    showMessage('Building demolished.', 2000);
    updatePopulationCap();
    populateBuildMenu();
    populateResearchPanel();
    updateUIDisplays();
}
function populateScenarioPanel() {
    const currentScenario = (typeof scenarios !== 'undefined') ? scenarios[gameState.currentScenarioIndex] : null;
    if (!currentScenario) return;
    if (!scenarioTitleElement || !objectivesListElement) return;
    scenarioTitleElement.querySelectorAll('.scenario-title-text').forEach(n => n.remove());
    Array.from(scenarioTitleElement.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) node.remove();
    });
    const span = document.createElement('span');
    span.className = 'scenario-title-text';
    span.textContent = currentScenario.title + ' ';
    scenarioTitleElement.insertBefore(span, scenarioTitleElement.firstChild || null);
    span.textContent = currentScenario.title + ' ';
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
    if (!buildMenuElement) return;
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
    const categoryOrder = ['Housing', 'Food', 'Resources', 'Industry', 'Life', 'Special'];
    for (const categoryName of categoryOrder) {
        if (!categories[categoryName]) continue;
        const header = document.createElement('h2');
        header.textContent = categoryName;
        header.className = 'build-category-header';
        buildMenuElement.appendChild(header);

        for (const building of categories[categoryName]) {
            const button = document.createElement('button');
            button.dataset.type = building.type;
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
    if (!workerAssignmentsList) return;
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
                statusSpan.textContent = `${building.workersAssigned}/${blueprint.workersRequired}`;
                updateUIDisplays();
                if (building === gameState.selectedBuilding) {
                openUpgradePanel(building, true);
            }
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
                statusSpan.textContent = `${building.workersAssigned}/${blueprint.workersRequired}`;
                updateUIDisplays();
                if (building === gameState.selectedBuilding) {
                openUpgradePanel(building, true);
            }
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
    if (!researchPanelElement) return;
    researchPanelElement.innerHTML = '';
    for (const techId in researchTree) {
        const tech = researchTree[techId];
        const button = document.createElement('button');
        const isUnlocked = gameState.unlockedTechs.includes(techId);
        const requires = tech.requires || [];
        const hasPrereqs = requires.every(id => gameState.unlockedTechs.includes(id));
        tech.unlocks.forEach(buildingId => {
            if (buildingBlueprints[buildingId]) {
                buildingBlueprints[buildingId].locked = false;
            } else {
                console.warn('Missing blueprint for unlocked id:', buildingId);
            }
        });
        button.innerHTML = `${tech.name}<br><small>Cost: ${tech.cost} Knowledge</small>`;
        if (!hasPrereqs && requires.length) {
            const reqNames = requires.map(id => researchTree[id]?.name || id).join(', ');
            button.innerHTML += `<br><small>Requires: ${reqNames}</small>`;
        }
        if (isUnlocked) {
            button.innerHTML += `<br><small>Researched</small>`;
        }
        button.disabled = isUnlocked || !hasPrereqs || gameState.resources.knowledge < tech.cost;
        button.addEventListener('click', () => {
            if (gameState.resources.knowledge >= tech.cost) {
                gameState.resources.knowledge -= tech.cost;
                gameState.unlockedTechs.push(techId);
                tech.unlocks.forEach(buildingId => {
                    buildingBlueprints[buildingId].locked = false;
                });
                buildMenuDirty = true;
                researchPanelDirty = true;
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
    const btn = document.querySelector(`.tab-button[data-tab="${tabName}"]`) || document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`);
    if (btn) btn.classList.add('active');
}
function harvestFeature(feature) {
    if (feature.beingHarvested) {
        showMessage("This area is already being cleared.");
        return;
    }
    if (gameState.unemployedWorkers < 1) {
        showMessage("No unemployed workers available to clear the area.");
        return;
    }
    feature.beingHarvested = true;
    if (gameState.unemployedWorkers < 1) {
        feature.beingHarvested = false;
        showMessage("No unemployed workers available to clear the area.");
        return;
    }
    gameState.unemployedWorkers--;
    feature.beingHarvested = true; 
    const harvestTime = 3000; 
    createFloatingText('Clearing...', feature.x + feature.width / 2, feature.y, '#ffff00');
    setTimeout(() => {
        let resourceType = '';
        let resourceAmount = 0;
        if (feature.type === 'forest') {
            resourceType = 'wood';
            resourceAmount = 50 + Math.floor(Math.random() * 50);
        } else if (feature.type === 'stone_deposit') {
            resourceType = 'stone';
            resourceAmount = 40 + Math.floor(Math.random() * 40);
        }

        if (resourceType) {
            gameState.resources[resourceType] += resourceAmount;
            createFloatingText(`+${resourceAmount}`, feature.x + feature.width / 2, feature.y, '#67e8f9');
            const index = gameState.environment.indexOf(feature);
            if (index > -1){
                gameState.environment.splice(index, 1);
            }
            showMessage(`Cleared ${feature.type.replace('_', ' ')} for ${resourceAmount} ${resourceType}.`, 2500);
        }
        gameState.unemployedWorkers++;
    }, harvestTime);
}
function getEnvironmentFeatureAt(x, y) {
    for (let i = gameState.environment.length - 1; i >= 0; i--) {
        const feature = gameState.environment[i];
        if (x > feature.x && x < feature.x + feature.width &&
            y > feature.y && y < feature.y + feature.height) {
            return feature;
        }
    }
    return null;
}
function generateEnvironment() {
    gameState.environment = [];
    const groundY = canvas.height - 50;
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 200);
        const width = 100 + Math.random() * 100;
        gameState.environment.push({type: 'forest', x, y: groundY - 20, width, height: 20, color: '#006400'});
    }
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * (canvas.width - 150);
        const width = 80 + Math.random() * 70;
        gameState.environment.push({type: 'stone_deposit', x, y: groundY - 15, width, height: 15, color: '#8d8d8d'});
    }
}
function getBuildButton(type) {
    return document.querySelector(`#build-menu button[data-type="${type}"]`);
}
function clearOnboardingWatchers() {
    if (!gameState.onboarding) return;
    (gameState.onboarding.watchers || []).forEach(id => clearInterval(id));
    gameState.onboarding.watchers = [];
    document.querySelectorAll('.attention-pulse').forEach(el => el.classList.remove('attention-pulse'));
    cancelTutorialButton?.classList.add('hidden');
    hideTutorialHud();
}
function startOnboarding() {
    gameState.onboarding = {step: 0, watchers: []};
    cancelTutorialButton?.classList.remove('hidden');
    cancelTutorialButton?.setAttribute('aria-hidden', 'false');
    showTip('Tutorial: Open the build tab to begin.', 'info', 8000);
    showTutorialHud(1, 4, 'Open the build tab to begin.');
    const buildTabBtn = 
        document.querySelector('.tab-button[data-tab="build-menu"]') ||
        document.querySelector(`.tab-button[onclick*="build-menu"]`) ||
        document.querySelector('.tab-button');
    if (buildTabBtn) buildTabBtn.classList.add('attention-pulse');
    const watcher0 = setInterval(() => {
        if (buildMenuElement.classList.contains('active')) {
            clearInterval(watcher0);
            gameState.onboarding.watchers = (gameState.onboarding.watchers || []).filter(id => id !== watcher0);
            if (buildTabBtn) buildTabBtn.classList.remove('attention-pulse');
            advanceOnboarding(1);
        }
    }, 300);
    gameState.onboarding.watchers.push(watcher0);
}
function advanceOnboarding(step) {
    if (!gameState.onboarding) gameState.onboarding = { watchers: [] };
    gameState.onboarding.step = step;
    clearOnboardingWatchers();
    if (step === 1) {
        showTutorialHud(1, 4, 'Open Build → Housing → Click on the "shack".');
        showTip('Build → Housing → Shack. Click the Shack button to select it.', 'info', 10000);
        openTab('build-menu');
        const shackBtn = getBuildButton('shack');
        if (shackBtn) shackBtn.classList.add('attention-pulse');
        const watcher = setInterval(() => {
            const hasShack = gameState.buildings.some(b => b.type === 'shack' || b.type === 'house');
            if (hasShack) {
                clearInterval(watcher);
                advanceOnboarding(2);
            }
        }, 500)
        gameState.onboarding.watchers.push(watcher);
    } else if (step === 2) {
        showTutorialHud(2, 4, 'Open Build then build a Woodcutter to start wood production.');
        showTip('Great! Now build a Woodcutter to start wood production.', 'info', 9000);
        openTab('build-menu');
        const wcBtn = getBuildButton('woodcutter');
        if (wcBtn) wcBtn.classList.add('attention-pulse');
        const watcher = setInterval(() => {
            const hasWoodcutter = gameState.buildings.some(b => b.type === 'woodcutter');
            if (hasWoodcutter) {
                clearInterval(watcher);
                advanceOnboarding(3);
            }
        }, 500);
        gameState.onboarding.watchers.push(watcher);
    } else if (step === 3) {
        showTutorialHud(3, 4, 'Assign one worker to the Woodcutter (Manage workers).');
        showTip('Assign one worker to the Woodcutter. Click on "Manage Workers".', 'info', 10000);
        const manageBtn = document.getElementById('open-worker-panel-button');
        if (manageBtn) {
            manageBtn.classList.add('attention-pulse');
            workerPanelModal?.classList.remove('hidden');
            populateWorkerPanel();
        }
        const watcher = setInterval(() => {
            const staffed = gameState.buildings.some(b => {
                const bp = buildingBlueprints[b.type];
                return bp?.workersRequired && (b.workersAssigned || 0) > 0;
            });
            if (staffed) {
                clearInterval(watcher);
                if (manageBtn) manageBtn.classList.remove('attention-pulse');
                workerPanelModal?.classList.add('hidden');
                advanceOnboarding(4);
            }
        }, 500);
        gameState.onboarding.watchers.push(watcher);
    } else if (step === 4) {
        showTutorialHud(4, 4, 'Tutorial complete so enjoy the game!');
        finishOnboarding();
    }
}
function cancelOnboarding() {
    clearOnboardingWatchers();
    if (gameState.onboarding) {
        gameState.onboarding = null;
    }
    cancelTutorialButton?.classList.add('hidden');
    cancelTutorialButton?.setAttribute('aria-hidden', 'true');
    hideTutorialHud();
    document.getElementById('welcome-start-tutorial')?.focus();
    showTip('Tutorial cancelled.', 'info', 2000);
}
function finishOnboarding() {
    clearOnboardingWatchers();
    gameState.meta = gameState.meta || getDefaultMeta();
    gameState.meta.tutorialCompleted = true;
    gameState.meta.tutorialPending = false;
    if (gameState.onboarding) gameState.onboarding = null;
    showTip('Tutorial complete! You can replay it from settings.', 'info', 4000);
    saveGame();
}
function isAnyModalOpen() {
    const welcomeOpen = !!document.getElementById('welcome-modal') && !document.getElementById('welcome-modal').classList.contains('hidden');
    return welcomeOpen;
}
function wireTutorialHudButtons() {
    const hintBtn = document.getElementById('hud-hint-button');
    const nextBtn = document.getElementById('hud-next-button');
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const step = gameState.onboarding?.step || 1;
            if (step === 1) showTip('Open the Build tab, then choose Housing → Shack.', 'info', 5000);
            else if (step === 2) showTip('Select the Woodcutter in Resources and place it on the ground.', 'info', 5000);
            else if (step === 3) showTip('Open Manage Workers and press + on the Woodcutter entry.', 'info', 5000);
            else showTip('You are done — explore the game!', 'info', 3000);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cur = gameState.onboarding?.step || 0;
            const total = gameState.onboarding?.totalSteps || 4;
            advanceOnboarding(Math.min(cur + 1, total));
        });
    }

}
let _welcomeKeyHandler = null;
function trapFocusInWelcome() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;
    const focusable = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    let idx = 0;
    focusable[0].focus();
    _welcomeKeyHandler = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) idx = (idx - 1 + focusable.length) % focusable.length;
            else idx = (idx + 1) % focusable.length;
            focusable[idx].focus();
        } else if (e.key === 'Escape') {
            document.getElementById('welcome-skip-tutorial')?.click();
        }
    };
    document.addEventListener('keydown', _welcomeKeyHandler);
}
hudHintButton?.addEventListener('click', () => {
    const step = gameState.onboarding?.step || 1;
    if (step === 1) showTip('Open the Build tab, then choose Housing → Shack.', 'info', 5000);
    else if (step === 2) showTip('Select the Woodcutter in Resources and place it on the ground.', 'info', 5000);
    else if (step === 3) showTip('Open Manage Workers and press + on the Woodcutter entry.', 'info', 5000);
    else showTip('You are done — explore freely!', 'info', 3000);
});
hudNextButton?.addEventListener('click', () => {
    const cur = gameState.onboarding?.step || 0;
    advanceOnboarding(Math.min((cur || 0) + 1, 4));
});
function untrapFocusInWelcome() {
    if (_welcomeKeyHandler) {
        document.removeEventListener('keydown', _welcomeKeyHandler);
        _welcomeKeyHandler = null;
    }
}
function hideTutorialHud() {
    tutorialHud?.classList.add('hidden');
}
function showTutorialHud(step, total, actionText) {
    if (!tutorialHud) return;
    hudStepNum.textContent = String(step);
    hudStepTotal.textContent = String(total);
    hudAction.textContent = actionText || '';
    tutorialHud.classList.remove('hidden');
}
let prevCanvasHeight = null;
let gridCanvas = null;
function createGridCanvas() {
    if (!canvas) return null;
    const g = document.createElement('canvas');
    g.width = canvas.width;
    g.height = canvas.height;
    const gctx = g.getContext('2d');
    gctx.clearRect(0, 0, g.width, g.height);
    const gs = (typeof GRID_SIZE !== 'undefined') ? GRID_SIZE : 32;
    gctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    gctx.lineWidth = 1;
    for (let x = 0; x < g.width; x += gs) {
        gctx.beginPath();
        gctx.moveTo(x + 0.5, 0);
        gctx.lineTo(x + 0.5, g.height);
        gctx.stroke();
    }
    for (let y = 0; y < g.height; y += gs) {
        gctx.beginPath();
        gctx.moveTo(0, y + 0.5);
        gctx.lineTo(g.width, y + 0.5);
        gctx.stroke();
    }
    return g;
}
function init() {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = mainRect.width;
    canvas.height = mainRect.height;
    prevCanvasHeight = canvas.height;
    loadGame();
    loadImages();
    setupEventListeners();
    wireWelcomeButtons();
    wireTutorialHudButtons();
    refreshUI();
    gridCanvas = createGridCanvas();
    if (!gameState.meta || !gameState.meta.tutorialCompleted) {
        showWelcomeModal();
        setTimeout(() => {
            document.getElementById('welcome-start-tutorial')?.focus();
        }, 50);
    }
    setInterval(saveGame, GAME_CONFIG.timers.saveInterval);
    requestAnimationFrame(gameLoop);
}
window.addEventListener('resize', () => {
    const mainRect = canvas.parentElement.getBoundingClientRect();
    const newW = mainRect.width;
    const newH = mainRect.height;
    const dy = (prevCanvasHeight == null) ? 0 : (newH - prevCanvasHeight);
    canvas.width = newW;
    canvas.height = newH;
    gridCanvas = createGridCanvas();
    if (dy !== 0) {
        for (const b of gameState.buildings) b.y += dy;
        for (const f of gameState.environment) f.y += dy;
        for (const ft of gameState.floatingTexts) ft.y += dy;
    }
    prevCanvasHeight = newH;
});
init();