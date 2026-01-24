window.renderGraphs = async function() {
    const content = document.getElementById('app-content');
    content.innerHTML = `<div class="card"><h4>📉 몸무게 (30일)</h4><canvas id="wChart" style="height:200px;"></canvas></div><div class="card"><h4>🍗 단백질 현황</h4><canvas id="pChart" style="height:200px;"></canvas></div>`;
    const { data: all } = await supabase.from('fit_data').select('*').eq('user_id', USER_ID);
    if(!all) return;
    const labels = [], ws = [], ps = [];
    for(let i=29; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i); const s = d.toISOString().split('T')[0];
        labels.push(s.slice(5));
        const day = all.filter(r => r.date_str === s);
        const w = day.find(r => r.category === 'weight'); ws.push(w ? Number(w.content.value) : null);
        ps.push(day.filter(r => r.category === 'food').reduce((sum, f) => sum + Number(f.content.prot), 0));
    }
    new Chart(document.getElementById('wChart'), { type:'line', data:{ labels, datasets:[{ label:'kg', data:ws, borderColor:'#2563eb', spanGaps:true }] } });
    new Chart(document.getElementById('pChart'), { type:'bar', data:{ labels, datasets:[{ label:'g', data:ps, backgroundColor:'#059669' }] } });
};