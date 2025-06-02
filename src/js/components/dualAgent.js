
import { getSessionID } from '../core/session.js';

let agentConfig = {
    left: { name: '', webhook: '', imageWebhook: '' },
    right: { name: '', webhook: '', imageWebhook: '' },
    starterPrompt: '',
    startingAgent: 'left'
};

let battleState = {
    isRunning: false,
    isPaused: false,
    turnCount: 0,
    currentAgent: 'left',
    lastMessage: ''
};

export function setupDualAgentApp() {
    setupSetupScreen();
    setupBattleControls();
    loadSavedConfig();
}

function setupSetupScreen() {
    const startButton = document.getElementById('start-battle');
    
    startButton.addEventListener('click', () => {
        if (validateConfig()) {
            saveConfig();
            startBattle();
        } else {
            alert('Please fill in all required fields!');
        }
    });
    
    // Add auto-save on input changes for better UX
    const inputs = [
        'left-name', 'left-webhook', 'left-image-webhook', 
        'right-name', 'right-webhook', 'right-image-webhook',
        'starter-prompt', 'starting-agent'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                // Auto-save config when user types
                setTimeout(saveCurrentFormState, 500);
            });
        }
    });
}

function saveCurrentFormState() {
    const currentConfig = {
        left: {
            name: document.getElementById('left-name').value,
            webhook: document.getElementById('left-webhook').value,
            imageWebhook: document.getElementById('left-image-webhook').value
        },
        right: {
            name: document.getElementById('right-name').value,
            webhook: document.getElementById('right-webhook').value,
            imageWebhook: document.getElementById('right-image-webhook').value
        },
        starterPrompt: document.getElementById('starter-prompt').value,
        startingAgent: document.getElementById('starting-agent').value
    };
    
    localStorage.setItem('duelAgentsConfig', JSON.stringify(currentConfig));
}

function validateConfig() {
    const leftWebhook = document.getElementById('left-webhook').value;
    const rightWebhook = document.getElementById('right-webhook').value;
    const starterPrompt = document.getElementById('starter-prompt').value;
    
    return leftWebhook && rightWebhook && starterPrompt;
}

function saveConfig() {
    agentConfig.left.name = document.getElementById('left-name').value;
    agentConfig.left.webhook = document.getElementById('left-webhook').value;
    agentConfig.left.imageWebhook = document.getElementById('left-image-webhook').value;
    agentConfig.right.name = document.getElementById('right-name').value;
    agentConfig.right.webhook = document.getElementById('right-webhook').value;
    agentConfig.right.imageWebhook = document.getElementById('right-image-webhook').value;
    agentConfig.starterPrompt = document.getElementById('starter-prompt').value;
    agentConfig.startingAgent = document.getElementById('starting-agent').value;
    
    // Save to localStorage
    localStorage.setItem('duelAgentsConfig', JSON.stringify(agentConfig));
}

function loadSavedConfig() {
    const savedConfig = localStorage.getItem('duelAgentsConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            // Populate form fields
            document.getElementById('left-name').value = config.left?.name || '';
            document.getElementById('left-webhook').value = config.left?.webhook || '';
            document.getElementById('left-image-webhook').value = config.left?.imageWebhook || '';
            document.getElementById('right-name').value = config.right?.name || '';
            document.getElementById('right-webhook').value = config.right?.webhook || '';
            document.getElementById('right-image-webhook').value = config.right?.imageWebhook || '';
            document.getElementById('starter-prompt').value = config.starterPrompt || '';
            document.getElementById('starting-agent').value = config.startingAgent || 'left';
            
            // Update agentConfig object
            agentConfig = { ...agentConfig, ...config };
        } catch (error) {
            console.error('Error loading saved config:', error);
        }
    }
}

function startBattle() {
    // Hide setup screen, show chat interface
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    // Initialize battle state
    battleState.isRunning = true;
    battleState.isPaused = false;
    battleState.turnCount = 1;
    battleState.currentAgent = agentConfig.startingAgent;
    battleState.lastMessage = agentConfig.starterPrompt;
    
    // Update agent names in headers
    updateAgentNames();
    
    // Clear any existing messages from both chat outputs
    document.getElementById('left-output').innerHTML = '';
    document.getElementById('right-output').innerHTML = '';
    
    // Show the starter prompt - it should appear as incoming on BOTH sides
    // since it's the initial prompt that starts the conversation
    addIncomingMessageToChat('left', agentConfig.starterPrompt, agentConfig.startingAgent);
    addIncomingMessageToChat('right', agentConfig.starterPrompt, agentConfig.startingAgent);
    
    updateTurnDisplay();
    
    // Start the conversation by sending to the OTHER agent (they respond to the starter)
    const respondingAgent = agentConfig.startingAgent === 'left' ? 'right' : 'left';
    battleState.currentAgent = respondingAgent;
    
    setTimeout(() => {
        sendMessageToAgent(respondingAgent, agentConfig.starterPrompt);
    }, 1000);
}

function setupBattleControls() {
    const pauseButton = document.getElementById('pause-battle');
    const resetButton = document.getElementById('reset-battle');
    
    pauseButton.addEventListener('click', () => {
        battleState.isPaused = !battleState.isPaused;
        pauseButton.textContent = battleState.isPaused ? '▶️ Resume' : '⏸️ Pause';
        updateAgentStatus();
    });
    
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the battle?')) {
            resetBattle();
        }
    });
    
    // Setup agent toggle controls
    setupAgentToggle();
}

function setupAgentToggle() {
    const toggleBoth = document.getElementById('toggle-both');
    const toggleLeft = document.getElementById('toggle-left');
    const toggleRight = document.getElementById('toggle-right');
    const chatContainer = document.querySelector('.chat-container');
    const leftAgent = document.querySelector('.left-agent');
    const rightAgent = document.querySelector('.right-agent');
    
    function setActiveToggle(activeButton) {
        [toggleBoth, toggleLeft, toggleRight].forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }
    
    toggleBoth.addEventListener('click', () => {
        chatContainer.classList.remove('single-agent');
        leftAgent.classList.remove('visible');
        rightAgent.classList.remove('visible');
        setActiveToggle(toggleBoth);
    });
    
    toggleLeft.addEventListener('click', () => {
        chatContainer.classList.add('single-agent');
        leftAgent.classList.add('visible');
        rightAgent.classList.remove('visible');
        setActiveToggle(toggleLeft);
    });
    
    toggleRight.addEventListener('click', () => {
        chatContainer.classList.add('single-agent');
        rightAgent.classList.add('visible');
        leftAgent.classList.remove('visible');
        setActiveToggle(toggleRight);
    });
}

function resetBattle() {
    battleState.isRunning = false;
    battleState.isPaused = false;
    battleState.turnCount = 0;
    
    // Clear chat outputs
    document.getElementById('left-output').innerHTML = '';
    document.getElementById('right-output').innerHTML = '';
    
    // Hide chat interface, show setup screen
    document.getElementById('chat-interface').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    
    // Reset pause button
    document.getElementById('pause-battle').textContent = '⏸️ Pause';
}

async function sendMessageToAgent(agent, message) {
    if (!battleState.isRunning || battleState.isPaused) return;
    
    const config = agentConfig[agent];
    const outputElement = document.getElementById(`${agent}-output`);
    const spinnerElement = document.querySelector(`.${agent}-spinner`);
    const statusElement = document.getElementById(`${agent}-status`);
    
    // Debug logging
    console.log(`Sending message to ${agent} agent using webhook:`, config.webhook);
    console.log(`Message being sent:`, message.substring(0, 100) + '...');
    
    // Update status to show thinking indicator
    statusElement.textContent = 'Thinking...';
    statusElement.className = 'agent-status thinking';
    statusElement.style.animation = 'thinking 0.75s forwards ease-in-out infinite';
    
    try {
        const response = await fetch(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatInput: message,
                action: "sendMessage",
                sessionId: getSessionID() + `-${agent}`
            })
        });
        
        const reader = response.body.getReader();
        let responseText = '';
        
        await readAgentStream(reader, (chunk) => {
            responseText += chunk;
            // Update the message in real-time
            updateAgentMessage(agent, responseText);
        });
        
        // Reset status and remove thinking animation
        statusElement.textContent = 'Ready';
        statusElement.className = 'agent-status ready';
        statusElement.style.animation = '';
        
        // Switch to the other agent
        switchTurn(responseText);
        
    } catch (error) {
        console.error(`Error with ${agent} agent:`, error);
        statusElement.textContent = 'Error';
        statusElement.className = 'agent-status error';
        statusElement.style.animation = '';
        
        // Add error message to chat
        addMessageToChat(agent, `❌ Error: ${error.message}`);
    }
}

function readAgentStream(reader, onChunk) {
    const decoder = new TextDecoder();
    
    return new Promise((resolve, reject) => {
        function processStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    resolve();
                    return;
                }
                
                const chunk = decoder.decode(value);
                try {
                    const payload = JSON.parse(chunk);
                    onChunk(payload.data || chunk);
                } catch (error) {
                    onChunk(chunk);
                }
                
                processStream();
            }).catch(reject);
        }
        
        processStream();
    });
}

function updateAgentMessage(agent, message) {
    const outputElement = document.getElementById(`${agent}-output`);
    
    // Remove the last message container if it exists
    const lastContainer = outputElement.querySelector('.message-container:last-child');
    if (lastContainer && lastContainer.querySelector('.agent-message[data-temp="true"]')) {
        lastContainer.remove();
    }
    
    // Create message container with label
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container outgoing';
    
    // Add agent label
    const labelElement = document.createElement('div');
    labelElement.className = 'message-label';
    const agentName = agentConfig[agent].name || (agent === 'left' ? 'Agent Left' : 'Agent Right');
    labelElement.textContent = `${agentName}:`;
    
    // Add the updated message
    const messageElement = document.createElement('div');
    messageElement.className = 'agent-message outgoing';
    messageElement.dataset.temp = 'true';
    messageElement.innerHTML = message;
    
    // Add webhook URL for debugging
    const webhookElement = document.createElement('div');
    webhookElement.className = 'webhook-debug';
    webhookElement.style.fontSize = '0.7rem';
    webhookElement.style.color = '#666';
    webhookElement.style.marginTop = '0.25rem';
    webhookElement.style.fontFamily = 'monospace';
    webhookElement.textContent = `🔗 ${agentConfig[agent].webhook}`;
    
    messageContainer.appendChild(labelElement);
    messageContainer.appendChild(messageElement);
    messageContainer.appendChild(webhookElement);
    outputElement.appendChild(messageContainer);
    
    // Auto-scroll to newest message
    scrollToBottom(outputElement);
}

function addMessageToChat(agent, message) {
    const outputElement = document.getElementById(`${agent}-output`);
    
    // Create message container with label
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container outgoing';
    
    // Add agent label
    const labelElement = document.createElement('div');
    labelElement.className = 'message-label';
    const agentName = agentConfig[agent].name || (agent === 'left' ? 'Agent Left' : 'Agent Right');
    labelElement.textContent = `${agentName}:`;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'agent-message outgoing';
    messageElement.innerHTML = message;
    
    messageContainer.appendChild(labelElement);
    messageContainer.appendChild(messageElement);
    outputElement.appendChild(messageContainer);
    
    // Auto-scroll to newest message
    scrollToBottom(outputElement);
}

function addIncomingMessageToChat(agent, message, fromAgent = null) {
    const outputElement = document.getElementById(`${agent}-output`);
    
    // Create message container with label
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container incoming';
    
    // Add agent label - determine who sent this message
    const labelElement = document.createElement('div');
    labelElement.className = 'message-label';
    // Use the provided fromAgent or fall back to currentAgent
    const sendingAgent = fromAgent || battleState.currentAgent;
    const agentName = agentConfig[sendingAgent].name || (sendingAgent === 'left' ? 'Agent Left' : 'Agent Right');
    labelElement.textContent = `${agentName}:`;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'agent-message incoming';
    messageElement.innerHTML = message;
    
    // Add webhook URL for debugging (only if we have a valid sending agent)
    if (agentConfig[sendingAgent]?.webhook) {
        const webhookElement = document.createElement('div');
        webhookElement.className = 'webhook-debug';
        webhookElement.style.fontSize = '0.7rem';
        webhookElement.style.color = '#666';
        webhookElement.style.marginTop = '0.25rem';
        webhookElement.style.fontFamily = 'monospace';
        webhookElement.textContent = `🔗 ${agentConfig[sendingAgent].webhook}`;
        
        messageContainer.appendChild(labelElement);
        messageContainer.appendChild(messageElement);
        messageContainer.appendChild(webhookElement);
    } else {
        messageContainer.appendChild(labelElement);
        messageContainer.appendChild(messageElement);
    }
    
    outputElement.appendChild(messageContainer);
    
    // Auto-scroll to newest message
    scrollToBottom(outputElement);
}

function scrollToBottom(element) {
    setTimeout(() => {
        element.scrollTop = element.scrollHeight;
    }, 100);
}

function switchTurn(lastResponse) {
    if (!battleState.isRunning || battleState.isPaused) return;
    
    // Make the last message permanent
    const currentOutput = document.getElementById(`${battleState.currentAgent}-output`);
    const lastMessage = currentOutput.querySelector('.agent-message:last-child');
    if (lastMessage) {
        lastMessage.dataset.temp = 'false';
    }
    
    // Mirror the response on both sides - show as incoming message on the other side
    const otherAgent = battleState.currentAgent === 'left' ? 'right' : 'left';
    addIncomingMessageToChat(otherAgent, lastResponse, battleState.currentAgent);
    
    // Switch to the other agent for the next turn
    battleState.currentAgent = otherAgent;
    battleState.turnCount++;
    battleState.lastMessage = lastResponse;
    
    updateTurnDisplay();
    updateAgentStatus();
    
    // Add a small delay before the next agent responds
    setTimeout(() => {
        if (battleState.isRunning && !battleState.isPaused) {
            // Send the message to the agent that should respond next
            sendMessageToAgent(battleState.currentAgent, lastResponse);
        }
    }, 2000);
}

function updateTurnDisplay() {
    document.getElementById('turn-count').textContent = battleState.turnCount;
}

function updateAgentStatus() {
    const leftStatus = document.getElementById('left-status');
    const rightStatus = document.getElementById('right-status');
    
    if (battleState.isPaused) {
        leftStatus.textContent = 'Paused';
        leftStatus.className = 'agent-status paused';
        rightStatus.textContent = 'Paused';
        rightStatus.className = 'agent-status paused';
    } else if (!battleState.isRunning) {
        leftStatus.textContent = 'Ready';
        leftStatus.className = 'agent-status ready';
        rightStatus.textContent = 'Ready';
        rightStatus.className = 'agent-status ready';
    } else {
        if (battleState.currentAgent === 'left') {
            leftStatus.textContent = 'Active';
            leftStatus.className = 'agent-status active';
            rightStatus.textContent = 'Waiting';
            rightStatus.className = 'agent-status waiting';
        } else {
            leftStatus.textContent = 'Waiting';
            leftStatus.className = 'agent-status waiting';
            rightStatus.textContent = 'Active';
            rightStatus.className = 'agent-status active';
        }
    }
}

function updateAgentNames() {
    const leftNameElement = document.getElementById('left-agent-name');
    const rightNameElement = document.getElementById('right-agent-name');
    
    const leftName = agentConfig.left.name || 'Agent Left';
    const rightName = agentConfig.right.name || 'Agent Right';
    
    leftNameElement.textContent = `🤖 ${leftName}`;
    rightNameElement.textContent = `🤖 ${rightName}`;
}

// Expose functions for dev tools
window.duelAgents = {
    agentConfig,
    battleState,
    sendMessageToAgent,
    resetBattle
};
