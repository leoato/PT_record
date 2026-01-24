window.renderWorkout = async function() {
    const content = document.getElementById('app-content');
    const lib = JSON.parse(localStorage.getItem("w_lib") || "[]");
    content.innerHTML = `
        <form id="work-form" class="card">
            <h3>🏋️ 운동 기록</h3>
            <select id="w-type" onchange="toggleWType(this.value)"><option value="weight">웨이트</option><option value="cardio">유산소</option></select>
            <div id="w-fields">
                <select id="w-part"><option>가슴</option><option>등</option><option>어깨</option><option>하체</option><option>팔</option><option>기타</option></select>
                <input type="text" id="w-name" list="w-lib" oninput="autoFillW(this.value)" placeholder="운동명">
                <datalist id="w-lib">${lib.map(l=>`<option value="${l}">`).join('')}</datalist>
                <div style="display:flex; gap:5px;"><input type="number" id="w-w" placeholder="kg"><input type="number" id="w-s" placeholder="세트"><input type="number" id="w-r" placeholder="회"></div>
            </div>
            <textarea id="w-memo" placeholder="메모"></textarea>
            <button type="submit" class="primary" id="w-btn">서버 저장</button>
        </form><div id="w-list"></div>`;
    document.getElementById('work-form').onsubmit = saveW;
    loadWList();
};

window.toggleWType = (t) => document.getElementById('w-fields').style.display = t==='weight'?'block':'none';
window.autoFillW = (n) => {
    const p = JSON.parse(localStorage.getItem("w_pre") || "{}")[n];
    if(p) { document.getElementById('w-part').value=p.part; document.getElementById('w-w').value=p.w; document.getElementById('w-s').value=p.s; document.getElementById('w-r').value=p.r; }
};

async function saveW(e) {
    e.preventDefault();
    const btn = document.getElementById('w-btn'); btn.disabled=true;
    const name = document.getElementById('w-name').value;
    const content = {
        name, part: document.getElementById('w-part').value,
        w: document.getElementById('w-w').value, s: document.getElementById('w-s').value, r: document.getElementById('w-r').value,
        memo: document.getElementById('w-memo').value, type: document.getElementById('w-type').value
    };
    const { error } = await supabase.from('fit_data').insert([{ id: "W"+Date.now(), user_id: USER_ID, date_str: window.currentDate, category: 'workout', content }]);
    if(!error) {
        const lib = JSON.parse(localStorage.getItem("w_lib") || "[]"); if(!lib.includes(name)) { lib.push(name); localStorage.setItem("w_lib", JSON.stringify(lib)); }
        const pre = JSON.parse(localStorage.getItem("w_pre") || "{}"); pre[name] = content; localStorage.setItem("w_pre", JSON.stringify(pre));
        renderActiveTab();
    } else { alert("저장 실패"); btn.disabled=false; }
}

async function loadWList() {
    const { data } = await supabase.from('fit_data').select('*').eq('date_str', window.currentDate).eq('category', 'workout');
    document.getElementById('w-list').innerHTML = `<div class="card"><h4>오늘의 운동</h4>${data?.map(d=>`<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>${d.content.name} (${d.content.w}kg)</span><button onclick="delData('${d.id}')" style="color:red; border:none; background:none;">삭제</button></div>`).join('') || '없음'}</div>`;
}
window.delData = async (id) => { if(confirm("삭제?")) { await supabase.from('fit_data').delete().eq('id', id); renderActiveTab(); } };