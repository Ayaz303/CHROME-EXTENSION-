   let websiteData = {};
   let currentTabId = null;

   chrome.tabs.onActivated.addListener(activeInfo => {
     if (currentTabId !== null) {
       updateTimeSpent(currentTabId);
     }
     currentTabId = activeInfo.tabId;
   });

   chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
     if (changeInfo.status === 'complete') {
       updateTimeSpent(tabId);
     }
   });

   function updateTimeSpent(tabId) {
     chrome.tabs.get(tabId, (tab) => {
       const url = new URL(tab.url);
       const hostname = url.hostname;

       if (!websiteData[hostname]) {
         websiteData[hostname] = { timeSpent: 0, productive: classifyWebsite(hostname) };
       }

       websiteData[hostname].timeSpent += 1; // Increment by 1 minute (or use actual timing)
       chrome.storage.local.set({ websiteData });
     });
   }

   function classifyWebsite(hostname) {
     const productiveWebsites = ['github.com', 'stackoverflow.com', 'codepen.io'];
     const unproductiveWebsites = ['facebook.com', 'twitter.com', 'instagram.com'];

     if (productiveWebsites.includes(hostname)) return 'Productive';
     if (unproductiveWebsites.includes(hostname)) return 'Unproductive';
     return 'Neutral';
   }
      document.getElementById('refresh').addEventListener('click', loadAnalytics);

   function loadAnalytics() {
     chrome.storage.local.get('websiteData', (data) => {
       const analyticsDiv = document.getElementById('analytics');
       analyticsDiv.innerHTML = '';

       for (const [website, info] of Object.entries(data.websiteData)) {
         const div = document.createElement('div');
         div.textContent = ${website}: ${info.timeSpent} minutes (${info.productive});
         analyticsDiv.appendChild(div);
       }
     });
   }

   loadAnalytics(); // Load data when popup opens
      const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');

   const app = express();
   app.use(cors());
   app.use(express.json());

   mongoose.connect('mongodb://localhost:27017/productivityTracker', { useNewUrlParser: true, useUnifiedTopology: true });

   const websiteSchema = new mongoose.Schema({
     hostname: String,
     timeSpent: Number,
     productive: String,
   });

   const Website = mongoose.model('Website', websiteSchema);

   app.post('/api/websites', async (req, res) => {
     const { hostname, timeSpent, productive } = req.body;
     await Website.updateOne({ hostname }, { $inc: { timeSpent }, productive }, { upsert: true });
     res.sendStatus(200);
   });

   app.get('/api/websites', async (req, res) => {
     const websites = await Website.find();
     res.json(websites);
   });

   app.listen(5000, () => console.log('Server running on http://localhost:5000'));
   
   