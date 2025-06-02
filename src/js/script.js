import { initializeSession } from './core/session.js';
import { setupDualAgentApp } from './components/dualAgent.js';

window.addEventListener("load", () => {
    console.log("Deulin' Agents loaded and ready!");
    initializeSession();
    setupDualAgentApp();
});