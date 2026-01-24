window.renderGraphs = function() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <div class="card"><h4>📉 몸무게 변화</h4><canvas id="wChart" style="height:200px;"></canvas></div>
        <div class="card"><h4>🍗 단백질 섭취</h4><canvas id="pChart" style="height:200px;"></canvas></div>
    `;
    const labels = [], ws = [], ps = [];
    for(let i=29; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const s = d.toISOString().split('T')[0];
        labels.push(s.slice(5));
        const day = fitData[s] || {};
        ws.push(day.weight || null);
        ps.push((day.food || []).reduce((sum, f) => sum + Number(f.prot), 0));
    }
    new Chart(document.getElementById('wChart'), { type:'line', data:{ labels, datasets:[{ label:'kg', data:ws, borderColor:'#2563eb', spanGaps:true }] } });
    new Chart(document.getElementById('pChart'), { type:'bar', data:{ labels, datasets:[{ label:'g', data:ps, backgroundColor:'#059669' }] } });
};