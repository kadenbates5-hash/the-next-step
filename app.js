// ==================== CONFIGURATION ====================
const CONFIG = {
    // Get free API key from: https://serpapi.com/
    SEARCH_API_KEY: 'YOUR_SERPAPI_KEY_HERE',
    // Create GitHub token at: https://github.com/settings/tokens
    GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN_HERE',
    GITHUB_USERNAME: 'kadenbates5-hash'
};

// ==================== NAVIGATION ====================
function showSection(id, link) {
    document.querySelectorAll('section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    var target = document.getElementById(id);
    if (target) { target.classList.add('active'); target.style.display = 'block'; }
    link.classList.add('active');
}

// ==================== CRM SYSTEM ====================
let companies = JSON.parse(localStorage.getItem('tns_companies')) || [];

function save() {
    localStorage.setItem('tns_companies', JSON.stringify(companies));
}

function renderCRM() {
    const tbody = document.getElementById('crmBody');
    const filterStatus = document.getElementById('filterStatus').value;
    const filterNiche = document.getElementById('filterNiche').value;
    tbody.innerHTML = '';
    const filtered = companies.filter(c => {
        return (filterStatus === '' || c.status === filterStatus) &&
               (filterNiche === '' || c.niche === filterNiche);
    });
    filtered.forEach((c, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.name}</td>
            <td>${c.niche}</td>
            <td>${c.contact || ''}</td>
            <td>${c.email || ''}</td>
            <td>${c.phone || ''}</td>
            <td>
                <select onchange="updateStatus(${i}, this.value)">
                    <option ${c.status==='New'?'selected':''}>New</option>
                    <option ${c.status==='Contacted'?'selected':''}>Contacted</option>
                    <option ${c.status==='Call Booked'?'selected':''}>Call Booked</option>
                    <option ${c.status==='Proposal Sent'?'selected':''}>Proposal Sent</option>
                    <option ${c.status==='Closed Won'?'selected':''}>Closed Won</option>
                    <option ${c.status==='Not Interested'?'selected':''}>Not Interested</option>
                </select>
            </td>
            <td>${c.notes || ''}</td>
            <td><button onclick="deleteCompany(${i})" class="secondary"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addCompany() {
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

function saveCompany() {
    const name = document.getElementById('mCompany').value;
    if (!name) return alert('Company name is required');
    companies.push({
        name: name,
        niche: document.getElementById('mNiche').value,
        contact: document.getElementById('mContact').value,
        email: document.getElementById('mEmail').value,
        phone: document.getElementById('mPhone').value,
        status: 'New',
        notes: document.getElementById('mNotes').value
    });
    save();
    renderCRM();
    closeModal();
    document.querySelectorAll('.modal input, .modal textarea').forEach(i => i.value = '');
}

function updateStatus(i, val) {
    companies[i].status = val;
    save();
}

function deleteCompany(i) {
    if (confirm('Delete this company?')) {
        companies.splice(i, 1);
        save();
        renderCRM();
    }
}

function filterTable() {
    renderCRM();
}

function exportCSV() {
    let csv = 'Company,Niche,Contact,Email,Phone,Status,Notes\n';
    companies.forEach(c => {
        csv += `"${c.name}","${c.niche}","${c.contact||''}","${c.email||''}","${c.phone||''}","${c.status}","${c.notes||}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'crm_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ==================== ONLINE COMPANY SEARCH ====================
async function searchCompaniesOnline() {
    const query = document.getElementById('companySearch').value;
    if (!query) return alert('Please enter a search query');
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    
    if (CONFIG.SEARCH_API_KEY === 'YOUR_SERPAPI_KEY_HERE') {
        resultsDiv.innerHTML = `
            <div class="api-setup-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>API Key Required</h3>
                <p>To search companies online, you need a free SerpAPI key:</p>
                <ol>
                    <li>Go to <a href="https://serpapi.com/" target="_blank">https://serpapi.com/</a></li>
                    <li>Sign up for a free account (100 searches/month)</li>
                    <li>Copy your API key</li>
                    <li>Open app.js and replace 'YOUR_SERPAPI_KEY_HERE' with your key</li>
                </ol>
                <p><strong>For now, showing demo results:</strong></p>
            </div>
        `;
        // Show demo results
        setTimeout(() => showDemoResults(query, resultsDiv), 500);
        return;
    }
    
    try {
        const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${CONFIG.SEARCH_API_KEY}`);
        const data = await response.json();
        displaySearchResults(data.local_results || [], resultsDiv);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Search failed. Check your API key.</div>';
    }
}

function showDemoResults(query, resultsDiv) {
    const demoResults = [
        {title: 'Example Law Firm LLC', address: 'Milwaukee, WI', phone: '(414) 555-0100'},
        {title: 'Best Dental Practice', address: 'Brookfield, WI', phone: '(414) 555-0200'},
        {title: 'Pro HVAC Services', address: 'Milwaukee, WI', phone: '(414) 555-0300'}
    ];
    displaySearchResults(demoResults, resultsDiv);
}

function displaySearchResults(results, resultsDiv) {
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div>No results found.</div>';
        return;
    }
    let html = '<h3>Search Results:</h3><div class="result-grid">';
    results.forEach(r => {
        html += `
            <div class="result-card">
                <h4>${r.title}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${r.address || 'N/A'}</p>
                <p><i class="fas fa-phone"></i> ${r.phone || 'N/A'}</p>
                <button onclick="addFromSearch('${r.title}','${r.phone||''}')" class="secondary"><i class="fas fa-plus"></i> Add to CRM</button>
            </div>
        `;
    });
    html += '</div>';
    resultsDiv.innerHTML = html;
}

function addFromSearch(name, phone) {
    companies.push({name, phone, niche: 'Other', contact: '', email: '', status: 'New', notes: 'Added from search'});
    save();
    renderCRM();
    alert('Added to CRM!');
}

// ====================WEBSITE GENERATOR & GITHUB====================
async function generateFullSite() {
    const name = document.getElementById('bizName').value || 'Business Name';
    const city = document.getElementById('bizCity').value || 'City';
    const phone = document.getElementById('bizPhone').value || '(555) 000-0000';
    const niche = document.getElementById('bizNiche').value;
    
    const preview = document.getElementById('sitePreview');
    preview.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Generating website...</div>';
    
    // Generate HTML
    const siteHTML = generateSiteHTML(name, city, phone, niche);
    
    // Show preview
    setTimeout(() => {
        preview.innerHTML = siteHTML;
        preview.innerHTML += `
            <div class="gen-actions">
                <button onclick="createGitHubRepo('${name}','${niche}')"><i class="fab fa-github"></i> Create GitHub Repo & Deploy</button>
                <button onclick="downloadSite('${name}')" class="secondary"><i class="fas fa-download"></i> Download HTML</button>
            </div>
        `;
    }, 1000);
}

function generateSiteHTML(name, city, phone, niche) {
    const templates = {
        law: `<div style="font-family:serif;color:#1a1a1a;min-height:500px">
            <header style="background:#000;color:#fff;padding:3rem 2rem;text-align:center">
                <h1 style="font-size:2.5rem;margin-bottom:1rem">${name}</h1>
                <p style="font-size:1.2rem;color:#c5a059">Expert Legal Defense in ${city}</p>
            </header>
            <section style="padding:4rem 2rem;max-width:1200px;margin:0 auto;text-align:center">
                <h2>Trusted Legal Representation</h2>
                <p style="font-size:1.1rem;line-height:1.8;max-width:700px;margin:2rem auto">Serving ${city} with aggressive defense and personalized legal counsel you can trust.</p>
                <button style="background:#c5a059;color:#fff;border:none;padding:1.2rem 3rem;font-size:1.2rem;border-radius:5px;cursor:pointer;margin-top:2rem">Book Free Consultation</button>
            </section>
            <section style="background:#f9f9f9;padding:3rem 2rem;text-align:center">
                <h3>Practice Areas</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem;max-width:1000px;margin:2rem auto">
                    <div><h4>Criminal Defense</h4></div>
                    <div><h4>Personal Injury</h4></div>
                    <div><h4>Family Law</h4></div>
                </div>
            </section>
            <footer style="background:#222;color:#fff;padding:2rem;text-align:center">
                <p>📞 Call Us: ${phone}</p>
            </footer>
        </div>`,
        dental: `<div style="font-family:sans-serif;color:#2c3e50;min-height:500px">
            <header style="padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #3498db">
                <h1 style="color:#3498db;font-size:2rem">${name}</h1>
                <div style="font-weight:bold;font-size:1.2rem">${phone}</div>
            </header>
            <section style="padding:5rem 2rem;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff">
                <h2 style="font-size:3rem;margin-bottom:1rem">A Brighter Smile for ${city}</h2>
                <p style="font-size:1.3rem">Modern dentistry for the whole family</p>
                <button style="background:#fff;color:#667eea;border:none;padding:1.2rem 2.5rem;border-radius:50px;font-size:1.1rem;margin-top:2rem;cursor:pointer;font-weight:bold">Schedule Appointment</button>
            </section>
            <section style="padding:4rem 2rem;max-width:1200px;margin:0 auto">
                <h3 style="text-align:center;margin-bottom:3rem">Our Services</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem">
                    <div style="text-align:center;padding:2rem;border:1px solid #eee;border-radius:10px"><h4>General Dentistry</h4></div>
                    <div style="text-align:center;padding:2rem;border:1px solid #eee;border-radius:10px"><h4>Cosmetic Procedures</h4></div>
                    <div style="text-align:center;padding:2rem;border:1px solid #eee;border-radius:10px"><h4>Emergency Care</h4></div>
                </div>
            </section>
        </div>`,
        hvac: `<div style="font-family:sans-serif;color:#333;min-height:500px">
            <header style="background:#0056b3;color:#fff;padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center">
                <h1 style="margin:0">${name}</h1>
                <div>${phone}</div>
            </header>
            <section style="background:url('https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?w=1200');background-size:cover;padding:8rem 2rem;color:#fff;text-align:center;position:relative">
                <div style="position:relative;z-index:2">
                    <h2 style="font-size:3.5rem;text-shadow:2px 2px 8px rgba(0,0,0,0.7);margin-bottom:1rem">Reliable HVAC in ${city}</h2>
                    <button style="background:#ff4400;color:#fff;border:none;padding:1.5rem 3rem;font-size:1.3rem;border-radius:5px;cursor:pointer;font-weight:bold">Get Fast Service Now</button>
                </div>
            </section>
            <section style="padding:4rem 2rem;max-width:1200px;margin:0 auto">
                <h3 style="text-align:center">24/7 Emergency Service</h3>
                <p style="text-align:center;font-size:1.2rem;margin-top:1rem">Heating, Cooling, Installation & Repair</p>
            </section>
        </div>`
    };
    return templates[niche] || templates.law;
}

async function createGitHubRepo(name, niche) {
    if (CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
        alert('GitHub Token Required!\n\n1. Go to: https://github.com/settings/tokens\n2. Generate new token (classic)\n3. Check "repo" permissions\n4. Copy token and add to CONFIG in app.js');
        return;
    }
    
    const repoName = name.toLowerCase().replace(/[^a-z0-9]/g,'-');
    try {
        // Create repo
        const createResponse = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,'Content-Type': 'application/json'},
            body: JSON.stringify({name: repoName, description: `Website for ${name}`, auto_init: true})
        });
        
        if (!createResponse.ok) throw new Error('Failed to create repo');
        
        // Upload index.html
        const siteHTML = generateSiteHTML(name, document.getElementById('bizCity').value, document.getElementById('bizPhone').value, niche);
        const content = btoa(unescape(encodeURIComponent(siteHTML)));
        
        await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${repoName}/contents/index.html`, {
            method: 'PUT',
            headers: {'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,'Content-Type': 'application/json'},
            body: JSON.stringify({message: 'Add website', content: content})
        });
        
        alert(`Success! Repo created: https://github.com/${CONFIG.GITHUB_USERNAME}/${repoName}\nEnable GitHub Pages in repo settings to deploy!`);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function downloadSite(name) {
    const html = document.getElementById('sitePreview').innerHTML;
    const blob = new Blob([html], {type: 'text/html'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.toLowerCase().replace(/[^a-z0-9]/g,'-') + '.html';
    a.click();
}

// ==================== AI CHAT DEMO ====================
function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value;
    if (!msg) return;
    
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<div class="chat-msg user">${msg}</div>`;
    input.value = '';
    
    setTimeout(() => {
        const response = generateAIResponse(msg);
        chatBox.innerHTML += `<div class="chat-msg bot">${response}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

function generateAIResponse(msg) {
    const lower = msg.toLowerCase();
    
    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        return "Our pricing varies based on your specific needs. Would you like to book a quick 10-minute discovery call to get an exact quote? I can also email you our standard pricing guide.";
    }
    if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule')) {
        return "I can certainly help you book that! What day of the week works best for you? We have availability Monday through Friday, 9 AM to 5 PM.";
    }
    if (lower.includes('hours') || lower.includes('open') || lower.includes('available')) {
        return "We're open Monday through Friday, 9 AM to 5 PM, and Saturday 10 AM to 2 PM. Would you like to schedule an appointment during one of those times?";
    }
    if (lower.includes('services') || lower.includes('what do you') || lower.includes('help with')) {
        return "We offer comprehensive services including consultations, ongoing support, and custom solutions. Can I get your email so I can send you our full service brochure?";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hello! Thanks for reaching out. How can I assist you today? I can help with scheduling, pricing questions, or general inquiries about our services.";
    }
    if (lower.includes('email') || lower.includes('contact')) {
        return "Absolutely! What's the best email address to reach you at? I'll make sure someone from our team follows up within 24 hours.";
    }
    
    // Default response
    return "That sounds great. I'd love to help you with that. Can I get your phone number or email so one of our specialists can follow up with you directly?";
}

// ==================== EMAIL TEMPLATES ====================
function copyEmail(btn) {
    const body = btn.parentElement.querySelector('.email-body').innerText;
    navigator.clipboard.writeText(body);
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = original, 2000);
}

// ==================== INITIALIZATION ====================
window.onload = function() {
    renderCRM();
        // Setup nav click listeners
    document.querySelectorAll('nav a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var sectionId = this.dataset.section;
            showSection(sectionId, this);
        });
    });
    console.log('The Next Step Platform Loaded Successfully!');
    console.log('To enable API features:');
    console.log('1. SerpAPI: Get key from https://serpapi.com/');
    console.log('2. GitHub: Create token at https://github.com/settings/tokens');
};
