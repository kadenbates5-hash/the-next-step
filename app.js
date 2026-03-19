// Navigation
function showSection(id, link) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    link.classList.add('active');
}

// CRM
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
            <td>${c.contact}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
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
            <td>${c.notes}</td>
            <td>
                <button onclick="deleteCompany(${i})" class="secondary"><i class="fas fa-trash"></i></button>
            </td>
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
    // Reset form
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
    let csv = 'Company,Niche,Contact,Email,Phone,Status,Notes
';
    companies.forEach(c => {
        csv += `"${c.name}","${c.niche}","${c.contact}","${c.email}","${c.phone}","${c.status}","${c.notes}"
`;
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

// Site Generator
const templates = {
    law: (name, city, phone) => `
        <div style="font-family:serif; color:#1a1a1a;">
            <header style="background:#000; color:#fff; padding:2rem; text-align:center;">
                <h1>${name}</h1>
                <p>Top Rated Legal Defense in ${city}</p>
            </header>
            <section style="padding:4rem 2rem; text-align:center;">
                <h2>Expert Legal Counsel You Can Trust</h2>
                <p style="max-width:600px; margin:1rem auto;">Serving the ${city} area with aggressive representation and personalized care.</p>
                <button style="background:#c5a059; color:#fff; border:none; padding:1rem 2rem; font-size:1.2rem; cursor:pointer; margin-top:2rem;">Book Free Consultation</button>
            </section>
            <footer style="background:#f4f4f4; padding:2rem; text-align:center;">
                <p>Call Us: ${phone}</p>
            </footer>
        </div>
    `,
    hvac: (name, city, phone) => `
        <div style="font-family:sans-serif; color:#333;">
            <header style="background:#0056b3; color:#fff; padding:1.5rem; display:flex; justify-content:space-between; align-items:center;">
                <h1 style="margin:0;">${name}</h1>
                <div>${phone}</div>
            </header>
            <section style="background:url('https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&w=800&q=80'); background-size:cover; padding:6rem 2rem; color:#fff; text-align:center;">
                <h2 style="font-size:3rem; text-shadow:2px 2px 4px rgba(0,0,0,0.5);">Reliable HVAC in ${city}</h2>
                <button style="background:#ff4400; color:#fff; border:none; padding:1.2rem 2.5rem; font-size:1.3rem; border-radius:5px; cursor:pointer;">Get Fast Service Now</button>
            </section>
        </div>
    `,
    dental: (name, city, phone) => `
        <div style="font-family:sans-serif; color:#2c3e50;">
            <header style="padding:1rem 2rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee;">
                <h1 style="color:#3498db;">${name}</h1>
                <div style="font-weight:bold;">${phone}</div>
            </header>
            <section style="padding:5rem 2rem; text-align:center; background:#f9fbfc;">
                <h2 style="font-size:2.5rem;">A Brighter Smile for ${city}</h2>
                <p>Modern dentistry for the whole family.</p>
                <button style="background:#3498db; color:#fff; border:none; padding:1rem 2rem; border-radius:50px; font-size:1.1rem; margin-top:2rem;">Schedule Appointment</button>
            </section>
        </div>
    `
};

function generateSite() {
    const name = document.getElementById('bizName').value || 'Business Name';
    const city = document.getElementById('bizCity').value || 'City';
    const phone = document.getElementById('bizPhone').value || '(555) 000-0000';
    const niche = document.getElementById('bizNiche').value;
    
    const preview = document.getElementById('sitePreview');
    if (templates[niche]) {
        preview.innerHTML = templates[niche](name, city, phone);
    } else {
        preview.innerHTML = `<div style="padding:2rem; text-align:center;"><h2>${name}</h2><p>Serving ${city}</p><p>Call: ${phone}</p></div>`;
    }
}

// Phone Agent
function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value;
    if (!msg) return;
    
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<div class="chat-msg user">${msg}</div>`;
    input.value = '';
    
    setTimeout(() => {
        let response = "That sounds great. I'd love to help you with that. Can I get your phone number so one of our specialists can follow up?";
        if (msg.toLowerCase().includes('price') || msg.toLowerCase().includes('cost')) {
            response = "Our pricing varies based on your specific needs. Would you like to book a quick 10-minute discovery call to get an exact quote?";
        } else if (msg.toLowerCase().includes('book') || msg.toLowerCase().includes('appointment')) {
            response = "I can certainly help you book that. What day of the week works best for you?";
        }
        chatBox.innerHTML += `<div class="chat-msg bot">${response}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

// Email Copy
function copyEmail(btn) {
    const body = btn.parentElement.querySelector('.email-body').innerText;
    navigator.clipboard.writeText(body);
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = original, 2000);
}

// Init
window.onload = renderCRM;
