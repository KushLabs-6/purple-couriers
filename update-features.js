const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// 1. Fix Awaiting Dropoff issue
serverContent = serverContent.replace(
  /if \(status === 'Received'\) \{\s*pkg\.receivedDate = new Date\(\)\.toLocaleDateString\('en-US', \{ month: 'short', day: 'numeric' \}\);\s*pkg\.step = 'Processing at US Facility';\s*\}/,
  `if (status !== 'Pending' && pkg.receivedDate === 'Awaiting Dropoff') {
      pkg.receivedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (status === 'Received') {
      pkg.step = 'Processing at US Facility';
    }`
);

// 2. Add endpoint to delete history
const deleteHistoryEndpoint = `
// 5. Delete a history process step
app.delete('/api/packages/:id/history/:index', async (req, res) => {
  try {
    const pkg = await Package.findOne({ id: req.params.id });
    if (!pkg) return res.status(404).send('Not found');
    
    const index = parseInt(req.params.index);
    if (index >= 0 && index < pkg.history.length) {
      pkg.history.splice(index, 1);
      
      if (pkg.history.length > 0) {
        let lastStatus = pkg.history[pkg.history.length - 1].status;
        if (lastStatus.includes('Received from')) lastStatus = 'Received';
        if (lastStatus === 'Receipt Submitted by Customer') lastStatus = 'Pending';
        pkg.status = lastStatus;
      } else {
        pkg.status = 'Pending';
      }
      await pkg.save();
    }
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history' });
  }
});
`;

serverContent = serverContent.replace("app.delete('/api/packages/:id',", deleteHistoryEndpoint + "\napp.delete('/api/packages/:id',");

fs.writeFileSync(serverPath, serverContent, 'utf8');


// 3. Update customer.html to support ?track=PC-XXXXX
const customerPath = path.join(__dirname, 'public', 'customer.html');
let customerContent = fs.readFileSync(customerPath, 'utf8');

const trackQueryLogic = `
    // Check if URL has ?track=PC-XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('track');
    if (trackParam) {
      document.getElementById('trackQuery').value = trackParam;
      document.getElementById('track-form').dispatchEvent(new Event('submit'));
    }
`;
customerContent = customerContent.replace(
  "if (window.location.search.includes('tab=submit')) {",
  trackQueryLogic + "\n    if (window.location.search.includes('tab=submit')) {"
);

fs.writeFileSync(customerPath, customerContent, 'utf8');


// 4. Update staff.html to add hyperlink and history edit
const staffPath = path.join(__dirname, 'public', 'staff.html');
let staffContent = fs.readFileSync(staffPath, 'utf8');

// Change package ID to a hyperlink
staffContent = staffContent.replace(
  /<td><strong>\$\{p\.id\}<\/strong><\/td>/,
  `<td><a href="/customer.html?track=\${p.id}" target="_blank" style="color:var(--primary); font-weight:bold; text-decoration:underline;" title="View Customer Tracking">\${p.id}</a></td>`
);

// Add "Edit History" button to notes section
staffContent = staffContent.replace(
  `<button onclick="openNoteModal('\${p.id}', '\${(p.staffNote || '').replace(/'/g, "\\'")}')" class="text-btn">`,
  `<button onclick="openHistoryModal('\${p.id}')" class="text-btn" style="color:#d97706; margin-bottom:0.3rem;">📜 History</button><br>
               <button onclick="openNoteModal('\${p.id}', '\${(p.staffNote || '').replace(/'/g, "\\'")}')" class="text-btn">`
);

// Add history modal HTML
const historyModalHtml = `
  <!-- History Modal -->
  <div id="history-modal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
      <h3>Edit Package History</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">Delete incorrect steps. The package status will automatically revert to the most recent step.</p>
      <div id="history-list" style="margin-bottom:1rem; max-height:300px; overflow-y:auto; text-align:left;"></div>
      <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
        <button class="btn-outline" onclick="document.getElementById('history-modal').style.display='none'">Close</button>
      </div>
    </div>
  </div>
`;
staffContent = staffContent.replace("<!-- Note Modal -->", historyModalHtml + "\n  <!-- Note Modal -->");

// Add history logic script
const historyLogic = `
    let currentHistoryId = null;

    async function openHistoryModal(id) {
      currentHistoryId = id;
      document.getElementById('history-modal').style.display = 'flex';
      renderHistoryList();
    }

    function renderHistoryList() {
      const pkg = packages.find(p => p.id === currentHistoryId);
      if (!pkg) return;
      
      let html = '';
      if (pkg.history && pkg.history.length > 0) {
        pkg.history.forEach((h, index) => {
          html += \`
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; border-bottom:1px solid #e2e8f0;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">\${h.status}</div>
                <div style="font-size:0.8rem; color:#64748b;">\${new Date(h.date).toLocaleString()}</div>
              </div>
              <button onclick="deleteHistory(\${index})" style="background:#fee2e2; color:#ef4444; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:bold;">Delete</button>
            </div>
          \`;
        });
      } else {
        html = '<p>No history available.</p>';
      }
      document.getElementById('history-list').innerHTML = html;
    }

    async function deleteHistory(index) {
      if (!confirm('Are you sure you want to delete this process step?')) return;
      try {
        const res = await fetch(\`/api/packages/\${currentHistoryId}/history/\${index}\`, { method: 'DELETE' });
        if (res.ok) {
          const updatedPkg = await res.json();
          const pIndex = packages.findIndex(p => p.id === currentHistoryId);
          packages[pIndex] = updatedPkg;
          renderHistoryList();
          renderTable();
        } else {
          alert('Failed to delete history');
        }
      } catch (err) {
        alert('Error deleting history');
      }
    }
`;

staffContent = staffContent.replace("function openNoteModal", historyLogic + "\n    function openNoteModal");

fs.writeFileSync(staffPath, staffContent, 'utf8');

console.log('Done modifying staff and customer files');
