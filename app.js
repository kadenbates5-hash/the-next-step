// Navigation
document.querySelectorAll('nav a').forEach(link=>{
  link.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
    document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
    link.classList.add('active');
    document.querySelector(link.getAttribute('href')).classList.add('active');
  });
});

// CRM
let companies=JSON.parse(localStorage.getItem('tns_companies')||'[]');
const statuses=['New','Contacted','Replied','Closed Won','Closed Lost'];
const niches=['Law Firm','Dental','HVAC','Real Estate','Chiropractic','Med Spa','Roofing','Plumbing','Auto Shop','Insurance'];

function save(){localStorage.setItem('tns_companies',JSON.stringify(companies));}
function renderCRM(){
  const tbody=document.getElementById('crmBody');
  tbody.innerHTML='';
  companies.forEach((c,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.name}</td><td>${c.niche}</td><td>${c.contact||'-'}</td><td><span class="status ${c.status.toLowerCase().replace(' ','')}">${c.status}</span></td><td><button onclick="editStatus(${i})">Update</button> <button style="background:#ef4444" onclick="deleteCompany(${i})">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}
function addCompany(){
  const name=prompt('Company Name:');
  if(!name)return;
  const niche=prompt('Niche (e.g. Law Firm, HVAC):','Law Firm');
  const contact=prompt('Contact Name (optional):');
  companies.push({name,niche:niche||'General',contact:contact||'',status:'New'});
  save();renderCRM();
}
function editStatus(i){
  const s=prompt('New status:\n'+statuses.join(', '),companies[i].status);
  if(s&&statuses.includes(s)){companies[i].status=s;save();renderCRM();}
}
function deleteCompany(i){
  if(confirm('Delete '+companies[i].name+'?')){companies.splice(i,1);save();renderCRM();}
}
function exportCSV(){
  let csv='Company,Niche,Contact,Status\n';
  companies.forEach(c=>csv+=`${c.name},${c.niche},${c.contact||''},${c.status}\n`);
  const a=document.createElement('a');
  a.href='data:text/csv,'+encodeURIComponent(csv);
  a.download='crm_export.csv';
  a.click();
}
renderCRM();

// Website Generator
const templates={
  law:{headline:'Experienced Legal Representation',sub:'Fighting for your rights since 1995. Free consultations available.',cta:'Schedule Free Consultation',color:'#1e3a5f'},
  dental:{headline:'Your Smile Deserves the Best',sub:'Gentle, modern dental care for the whole family.',cta:'Book an Appointment',color:'#0d6e8a'},
  hvac:{headline:'Fast, Reliable HVAC Service',sub:'24/7 emergency service. Licensed & insured. 100% satisfaction guaranteed.',cta:'Get a Free Quote',color:'#b45309'}
};
function generatePreview(){
  const name=document.getElementById('genName').value||'Your Business';
  const niche=document.getElementById('genNiche').value;
  const city=document.getElementById('genCity').value||'Your City';
  const t=templates[niche];
  document.getElementById('previewArea').innerHTML=`
    <div style="background:${t.color};color:white;padding:2rem;border-radius:8px 8px 0 0">
      <h2 style="font-size:1.5rem;margin-bottom:.5rem">${name}</h2>
      <p style="font-size:.9rem;opacity:.8">${city}</p>
    </div>
    <div style="padding:2rem;border-radius:0 0 8px 8px;background:white">
      <h3 style="font-size:1.3rem;margin-bottom:.75rem">${t.headline}</h3>
      <p style="color:#64748b;margin-bottom:1.5rem">${t.sub}</p>
      <button style="background:${t.color};color:white;border:none;padding:.75rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600">${t.cta} &rarr;</button>
      <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;display:flex;gap:2rem;font-size:.85rem;color:#64748b">
        <span>&#9742; (555) 000-0000</span>
        <span>&#128337; Open 24/7</span>
        <span>&#127775; 4.9/5 Stars</span>
      </div>
    </div>`;
}

// Chat Bot
const botResponses=[
  [['hours','open','close'],'We are open Monday through Friday 8am-6pm and Saturday 9am-2pm. Emergency services are available 24/7.'],
  [['price','cost','quote','estimate'],'Pricing depends on your specific needs. I can schedule a free consultation to give you an accurate estimate!'],
  [['appointment','book','schedule','meet'],'I would be happy to schedule an appointment for you. What day works best - morning or afternoon?'],
  [['location','address','where'],'We serve the greater area and can come to your location. What city are you in?'],
  [['hello','hi','hey'],'Hello! Great to hear from you. How can I help you today?'],
  [['thanks','thank'],'You are welcome! Is there anything else I can help you with?']
];
function sendMessage(){
  const input=document.getElementById('userInput');
  const msg=input.value.trim();
  if(!msg)return;
  addMessage(msg,'user');
  input.value='';
  setTimeout(()=>{
    const lower=msg.toLowerCase();
    let reply='Thanks for reaching out! Let me connect you with our team for more details. Can I get your name and phone number?';
    for(const [kws,res] of botResponses){
      if(kws.some(k=>lower.includes(k))){reply=res;break;}
    }
    addMessage(reply,'bot');
  },600);
}
function addMessage(text,type){
  const div=document.createElement('div');
  div.className='message '+type;
  div.textContent=text;
  document.getElementById('chatWindow').appendChild(div);
  document.getElementById('chatWindow').scrollTop=99999;
}
document.getElementById('userInput').addEventListener('keypress',e=>{if(e.key==='Enter')sendMessage();});

// Email Templates
const emailTemplates=[
  {title:'Law Firm - After Hours',subject:'Missing calls after 5pm?',body:`Hi [First Name],

Most law firms lose 2-4 qualified leads every week to after-hours voicemail.

I set up AI receptionists that answer calls 24/7, qualify the lead, and book the consultation automatically.

Would it be worth a 10-minute call to see if it fits [Firm Name]?

[Your Name]`},
  {title:'Dental - Booking',subject:'[Practice Name] - quick question',body:`Hi [First Name],

I was on your website and noticed there is no live chat or after-hours booking.

Most practices lose 20-30% of new patient inquiries from slow response time.

I build AI chatbots that capture and book patients automatically. Want me to show you what it looks like for [Practice Name]?

[Your Name]`},
  {title:'HVAC/Home Services',subject:'HVAC companies in [City] - saves 8hrs/week',body:`Hi [First Name],

I help HVAC and home service businesses set up AI phone assistants that handle incoming calls, book jobs, and filter emergencies after hours.

Most owners save 8+ hours a week and stop missing jobs to competitors.

Can I send you a quick 2-minute demo?

[Your Name]`},
  {title:'Real Estate',subject:'Agents in [City] missing leads overnight',body:`Hi [First Name],

Real estate leads go cold fast - most buyers expect a response within 5 minutes.

I set up AI chatbots that respond instantly to property inquiries, qualify buyers, and book showings automatically - even at 2am.

Worth a quick 10-minute call this week?

[Your Name]`}
];
const grid=document.getElementById('templateGrid');
emailTemplates.forEach(t=>{
  const card=document.createElement('div');
  card.className='template-card';
  card.innerHTML=`<h3>${t.title}</h3><p style="font-size:.85rem;color:#64748b;margin-bottom:.5rem"><strong>Subject:</strong> ${t.subject}</p><pre>${t.body}</pre><button class="copy-btn" onclick="copyText(\`${t.body.replace(/`/g,"'")}\`)">Copy Template</button>`;
  grid.appendChild(card);
});
function copyText(text){navigator.clipboard.writeText(text).then(()=>alert('Copied to clipboard!'));}
