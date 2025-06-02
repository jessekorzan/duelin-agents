
// Core configuration and constants
export const CONFIG = {
    maxStoredMessages: 15
};

export const ELEMENTS = {
    target: () => document.querySelector('.out'),
    textarea: () => document.querySelector('textarea'),
    main: () => document.querySelector('main')
};

export const baseHeight = document.querySelector('textarea')?.scrollHeight || 40;
