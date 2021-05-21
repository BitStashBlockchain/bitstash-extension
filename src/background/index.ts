import BitstashController from './controllers';

// Add instance to window for debugging
const controller = new BitstashController();
Object.assign(window, { controller });
