// Patch Node.js os.hostname() to return ASCII name
// Workaround for Vercel CLI error with Chinese computer names
const os = require('os');
const realHostname = os.hostname;
os.hostname = function() { return 'laptop-win11'; };
console.log('[patch] os.hostname() ->', os.hostname());
