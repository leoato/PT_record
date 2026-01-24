window.renderDashboard = async function() {
    const content = document.getElementById('app-content');
    const sel = new Date(window.currentDate);
    const y = sel.getFullYear(), m = sel.getMonth();
    const { data: all } = await supabase.from('fit_data').select('*').eq('user_id', USER_ID);
    const today = all?.filter(r => r.date_str === window.currentDate) || [];
    const weight = today.find(r => r.category === 'weight')?.content.value || "";

    content.innerHTML = `
        <div class="card"><h3>${y}년 ${m+1}월</h3><div class="calendar" id="cal"></div></div>
        <div class="card">
            <h4>공복 몸무게</h4>
            <div style="display:flex; gap:10px;"><input type="number" id="q-w" value="${weight}" step="0.1"><button onclick="saveQW()" class="btn-sm" style="background:var(--primary); color:white;">저장</button></div>
        </div>`;
    renderCal(y, m, all);
};

async function renderCal(y, m, data) {
    const cal = document.getElementById('cal');
    const first = new Date(y, m, 1).getDay(), last = new Date(y, m+1, 0).getDate();
    for(let i=0; i<first; i++) cal.innerHTML += `<div></div>`;
    for(let d=1; d<=last; d++) {
        const s = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const day = data?.filter(r => r.date_str === s) || [];
        const isSel = window.currentDate === s;
        cal.innerHTML += `<div class="calendar-day" style="${isSel?'border:2px solid var(--primary); background:#eff6ff;':''}" onclick="updateGlobalDate('${s}')"><strong>${d}</strong><small>${day.find(r=>r.category==='weight')?.content.value || ''}</small></div>`;
    }
}
window.saveQW = async () => {
    const val = document.getElementById('q-w').value;
    await supabase.from('fit_data').upsert([{ id: "WT"+window.currentDate, user_id: USER_ID, date_str: window.currentDate, category: 'weight', content: { value: val } }]);
    renderActiveTab();
};