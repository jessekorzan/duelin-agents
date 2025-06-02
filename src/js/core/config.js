
// Core configuration and constants
export const CONFIG = {
    webhookUrl: 'https://n8n-service-u37x.onrender.com/webhook/agent-pmm',
    webhookImage: 'https://n8n-service-u37x.onrender.com/webhook/pmm-image',
    maxStoredMessages: 15
};

export const ELEMENTS = {
    target: () => document.querySelector('.out'),
    textarea: () => document.querySelector('textarea'),
    main: () => document.querySelector('main')
};

export const baseHeight = document.querySelector('textarea')?.scrollHeight || 40;
