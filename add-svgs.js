const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const icons = {
  '🛒': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  
  '📤': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>`,
  
  '🏭': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"></path><path d="M4 22V2l6 4v16"></path><path d="M10 22V8l6 4v10"></path><path d="M16 22v-5l4 3v2"></path></svg>`,
  
  '🔔': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  
  '✈️': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.1.4.1.8.5 1l6.1 3.1-2.9 2.9-2.5-.8c-.4-.1-.8 0-1.1.3l-1.6 1.6c-.3.3-.3.8 0 1.1l3.6 2c.2.1.4.3.5.5l2 3.6c.3.3.8.3 1.1 0l1.6-1.6c.3-.3.4-.7.3-1.1l-.8-2.5 2.9-2.9 3.1 6.1c.2.4.6.6 1 .5l3.3-1.2c.5-.2.8-.6.7-1.1z"></path></svg>`,
  
  '🇯🇲': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  
  '📬': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
  
  '🎉': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
};

// Replace emojis in step cards with SVGs
for (const [emoji, svg] of Object.entries(icons)) {
  const regex = new RegExp(`<span class="step-icon">${emoji}</span>`, 'g');
  content = content.replace(regex, `<span class="step-icon" style="margin-bottom: 1rem; display: flex; justify-content: center;">${svg}</span>`);
}

// Remove the cart from the hero section, replace with plane icon
content = content.replace(
  /<h1>From Online Order<br>to <span>Your Door<\/span> 🛒<\/h1>/g,
  `<h1>From Online Order<br>to <span>Your Door</span></h1>`
);
content = content.replace(
  /hands in Jamaica 🌴\./g,
  `hands in Jamaica.`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Replaced emojis with clean SVGs');
