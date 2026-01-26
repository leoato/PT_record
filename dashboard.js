window.renderDashboard = function() {
    const content = document.getElementById('app-content');
    const selDate = new Date(window.currentDate);
    const y = selDate.getFullYear();
    const m = selDate.getMonth();

    content.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button onclick="window.changeMonth(-1)" style="border:none; background:#f1f5f9; padding:8px 15px; border-radius:10px; font-size:18px;">◀</button>
                <strong style="font-size:18px;">${y}년 ${m + 1}월</strong>
                <button onclick="window.changeMonth(1)" style="border:none; background:#f1f5f9; padding:8px 15px; border-radius:10px; font-size:18px;">▶</button>
            </div>
            <div class="calendar" id="main-calendar" style="display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-top:15px;"></div>
        </div>
        <div id="day-summary-section"></div>
        <div id="detail-modal" class="detail-view" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:200; padding:20px; box-sizing:border-box; overflow-y:auto;"></div>
    `;
    renderCalendar(y, m);
    renderDaySummary(window.currentDate);
};

function renderCalendar(y, m) {
    const cal = document.getElementById('main-calendar');
    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");

    cal.innerHTML = "";
    for(let i=0; i<firstDay; i++) cal.innerHTML += `<div></div>`;

    for(let d=1; d<=lastDate; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayData = data[dateStr] || {};
        const isSelected = window.currentDate === dateStr;
        const prot = dayData.food ? dayData.food.reduce((s, f) => s + Number(f.prot), 0) : 0;

        cal.innerHTML += `
            <div class="calendar-day" style="${isSelected?'border:2px solid var(--primary); background:#eff6ff;':''}" 
                 onclick="window.updateGlobalDate('${dateStr}'); document.getElementById('global-date').value='${dateStr}';">
                <strong>${d}</strong>
                <div class="day-info" style="margin-top:auto;">
                    ${dayData.weight ? `<div style="color:var(--primary); font-size:8px;">${dayData.weight}k</div>` : ''}
                    ${dayData.workout?.length > 0 ? `<div style="color:#6366f1; font-size:8px;">💪${dayData.workout.length}</div>` : ''}
                    ${prot > 0 ? `<div style="color:var(--success); font-size:8px;">🍗${prot}g</div>` : ''}
                </div>
            </div>`;
    }
}

function renderDaySummary(dateStr) {
    const container = document.getElementById('day-summary-section');
    const day = JSON.parse(localStorage.getItem("fit_data") || "{}")[dateStr] || {};
    const workouts = day.workout || [];
    const protTotal = day.food ? day.food.reduce((s,f) => s + Number(f.prot), 0) : 0;

    container.innerHTML = `
        <div class="card">
            <h4 style="margin:0 0 15px 0;">📍 ${dateStr} 기록 상세</h4>
            <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:20px;">
                <div style="flex:1">
                    <label style="font-size:12px;">공복 몸무게 (kg)</label>
                    <input type="number" id="quick-weight" value="${day.weight||''}" step="0.01">
                </div>
                <button onclick="window.saveQuickWeight('${dateStr}')" class="btn-sm" style="background:var(--primary); color:white; height:45px;">저장</button>
            </div>

            <h5 style="margin-bottom:10px;">🏋️ 운동 목록 (클릭 시 상세)</h5>
            ${workouts.length > 0 ? workouts.map(w => `
                <div class="summary-item" onclick="window.openDetail('${dateStr}', '${w.id}')" style="padding:15px; background:#f8fafc; border-radius:12px; margin-bottom:10px; border:1px solid #e2e8f0;">
                    <div style="font-weight:bold; color:var(--primary);">[${w.part}] ${w.name}</div>
                    <div style="font-size:12px; color:#64748b; margin-top:4px;">
                        ${w.type === 'weight' ? `${w.weight}kg | ${w.sets}세트 | ${w.reps}회` : `${w.time}분 | ${w.dist}km`}
                    </div>
                </div>
            `).join('') : '<p style="color:#94a3b8; font-size:13px;">오늘 기록된 운동이 없습니다.</p>'}

            <h5 style="margin-top:20px; margin-bottom:10px;">🍱 식단 (단백질: ${protTotal}g)</h5>
            <div style="background:#f0fdf4; padding:12px; border-radius:12px; font-size:14px;">
                ${day.food && day.food.length > 0 ? day.food.map(f => `<div style="color:#065f46;">• ${f.name} (${f.prot}g)</div>`).join('') : '<p style="color:#94a3b8; font-size:13px;">식단 기록 없음</p>'}
            </div>
        </div>`;
}

window.openDetail = function(dateStr, id) {
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    const workout = data[dateStr].workout.find(w => w.id === id);
    const modal = document.getElementById('detail-modal');
    modal.innerHTML = `
        <button onclick="document.getElementById('detail-modal').style.display='none'" class="btn-sm" style="background:#f1f5f9; margin-bottom:20px; border:none; padding:10px; border-radius:8px;">← 닫기</button>
        <div class="card">
            <h2>${workout.name}</h2>
            <p style="color:var(--primary); font-weight:bold;">${workout.part} | ${dateStr}</p>
            <hr style="border:0; border-top:1px solid #f1f5f9; margin:15px 0;">
            <div style="background:#f8fafc; padding:15px; border-radius:10px; margin-bottom:20px;">
                <strong>상세 기록:</strong><br>
                ${workout.type === 'weight' ? `${workout.weight}kg / ${workout.sets}세트 / ${workout.reps}회` : `${workout.time}분 / ${workout.dist}km`}
            </div>
            <h4>📝 메모</h4>
            <div style="background:#f1f5f9; padding:15px; border-radius:10px; min-height:100px; white-space:pre-wrap;">${workout.memo || '기록 없음'}</div>
            ${workout.img ? `<h4>📸 사진</h4><img src="${workout.img}" style="width:100%; border-radius:12px; margin-top:10px;">` : ''}
        </div>`;
    modal.style.display = 'block';
};

window.saveQuickWeight = function(dateStr) {
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    if(!data[dateStr]) data[dateStr] = {};
    data[dateStr].weight = document.getElementById('quick-weight').value;
    localStorage.setItem("fit_data", JSON.stringify(data));
    alert("몸무게 저장 완료!");
    window.renderDashboard();
};

window.changeMonth = function(diff) {
    const current = new Date(window.currentDate);
    current.setDate(1); 
    current.setMonth(current.getMonth() + diff);
    const newDateStr = current.toISOString().split('T')[0];
    window.currentDate = newDateStr;
    document.getElementById('global-date').value = newDateStr;
    window.renderDashboard();
};