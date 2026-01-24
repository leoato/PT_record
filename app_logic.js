// [데이터 구조] fit_data: { "2026-01-25": { weight: "62.2", workout: [], food: [] } }
let fitData = JSON.parse(localStorage.getItem("fit_data") || "{}");

function saveData() {
    localStorage.setItem("fit_data", JSON.stringify(fitData));
    renderActiveTab();
}

// 홈 화면 (캘린더)
window.renderDashboard = function() {
    const today = fitData[window.currentDate] || {};
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <div class="card">
            <h4>오늘의 공복 몸무게</h4>
            <div style="display:flex; gap:10px;">
                <input type="number" id="q-weight" value="${today.weight || ''}" step="0.1" placeholder="kg">
                <button onclick="saveWeight()" class="primary" style="margin:0; width:80px;">저장</button>
            </div>
        </div>
        <div class="card"><div class="calendar" id="cal-grid"></div></div>
    `;
    renderCalendar();
};

window.saveWeight = () => {
    const val = document.getElementById('q-weight').value;
    if(!fitData[window.currentDate]) fitData[window.currentDate] = {};
    fitData[window.currentDate].weight = val;
    saveData();
};

function renderCalendar() {
    const grid = document.getElementById('cal-grid');
    const now = new Date(window.currentDate);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for(let i=1; i<=lastDay; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const dayData = fitData[dateStr] || {};
        const isSel = window.currentDate === dateStr;
        grid.innerHTML += `
            <div class="calendar-day" style="${isSel?'border:2px solid var(--primary); background:#eff6ff;':''}" onclick="updateGlobalDate('${dateStr}')">
                <strong>${i}</strong>
                <small>${dayData.weight ? dayData.weight+'kg' : ''}</small>
                <span>${dayData.workout ? '💪' : ''}</span>
            </div>`;
    }
}

// 운동 기록
window.renderWorkout = function() {
    const today = fitData[window.currentDate] || { workout: [] };
    document.getElementById('app-content').innerHTML = `
        <form class="card" onsubmit="addWorkout(event)">
            <h3>🏋️ 운동 추가</h3>
            <input type="text" id="w-name" placeholder="운동명 (예: 스쿼트)" required>
            <div style="display:flex; gap:5px;">
                <input type="number" id="w-kg" placeholder="kg">
                <input type="number" id="w-set" placeholder="세트">
            </div>
            <button type="submit" class="primary">운동 저장</button>
        </form>
        <div class="card">
            <h4>오늘의 운동</h4>
            ${(today.workout || []).map((w, idx) => `
                <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
                    <span>${w.name} (${w.kg}kg x ${w.set}세트)</span>
                    <button onclick="deleteItem('workout', ${idx})" style="color:red; border:none; background:none;">삭제</button>
                </div>
            `).join('') || '기록이 없습니다.'}
        </div>
    `;
};

window.addWorkout = (e) => {
    e.preventDefault();
    if(!fitData[window.currentDate]) fitData[window.currentDate] = { workout: [] };
    if(!fitData[window.currentDate].workout) fitData[window.currentDate].workout = [];
    fitData[window.currentDate].workout.push({
        name: document.getElementById('w-name').value,
        kg: document.getElementById('w-kg').value,
        set: document.getElementById('w-set').value
    });
    saveData();
};

// 식단 기록
window.renderNutrition = function() {
    const today = fitData[window.currentDate] || { food: [] };
    const totalP = (today.food || []).reduce((s, f) => s + Number(f.prot), 0);
    document.getElementById('app-content').innerHTML = `
        <div class="card" style="background:var(--success); color:white; text-align:center;">
            <p>오늘의 단백질</p><h2>${totalP}g / 90g</h2>
        </div>
        <form class="card" onsubmit="addFood(event)">
            <input type="text" id="f-name" placeholder="식품명" required>
            <input type="number" id="f-prot" placeholder="단백질(g)" required>
            <button type="submit" class="primary" style="background:var(--success)">식단 저장</button>
        </form>
        <div class="card">
            ${(today.food || []).map((f, idx) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${f.name} (${f.prot}g)</span>
                    <button onclick="deleteItem('food', ${idx})" style="color:red; border:none; background:none;">삭제</button>
                </div>
            `).join('') || '기록 없음'}
        </div>
    `;
};

window.addFood = (e) => {
    e.preventDefault();
    if(!fitData[window.currentDate]) fitData[window.currentDate] = { food: [] };
    if(!fitData[window.currentDate].food) fitData[window.currentDate].food = [];
    fitData[window.currentDate].food.push({
        name: document.getElementById('f-name').value,
        prot: document.getElementById('f-prot').value
    });
    saveData();
};

window.deleteItem = (type, idx) => {
    fitData[window.currentDate][type].splice(idx, 1);
    saveData();
};

// 설정 및 데이터 관리
window.renderManagement = function() {
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h3>💾 데이터 관리</h3>
            <button class="primary" onclick="exportData()">데이터 백업 (파일로 저장)</button>
            <button class="primary" style="background:var(--danger); margin-top:20px;" onclick="clearAll()">전체 초기화</button>
        </div>
    `;
};

window.exportData = () => {
    const blob = new Blob([JSON.stringify(fitData)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fittrack_backup_${window.currentDate}.json`;
    a.click();
};

window.clearAll = () => { if(confirm("모든 기록이 삭제됩니다. 진행할까요?")) { localStorage.clear(); location.reload(); } };