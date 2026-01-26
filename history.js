window.renderHistory = function() {
    const content = document.getElementById('app-content');
    
    content.innerHTML = `
        <div class="filter-group">
            <button class="filter-btn active" onclick="window.filterHistory('전체', this)">전체</button>
            <button class="filter-btn" onclick="window.filterHistory('가슴', this)">가슴</button>
            <button class="filter-btn" onclick="window.filterHistory('등', this)">등</button>
            <button class="filter-btn" onclick="window.filterHistory('어깨', this)">어깨</button>
            <button class="filter-btn" onclick="window.filterHistory('하체', this)">하체</button>
            <button class="filter-btn" onclick="window.filterHistory('팔', this)">팔</button>
            <button class="filter-btn" onclick="window.filterHistory('유산소', this)">유산소</button>
        </div>
        <div id="history-list"></div>
    `;

    window.filterHistory('전체');
};

window.filterHistory = function(part, btn) {
    if(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const listDiv = document.getElementById('history-list');
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    let allWorkouts = [];

    // 모든 날짜의 운동 데이터를 하나로 모음
    Object.keys(data).forEach(date => {
        if(data[date].workout) {
            data[date].workout.forEach(w => {
                allWorkouts.push({ ...w, date });
            });
        }
    });

    // 최신 날짜순으로 정렬
    allWorkouts.sort((a, b) => b.date.localeCompare(a.date));

    // 부위별 필터링
    const filtered = part === '전체' ? allWorkouts : allWorkouts.filter(w => w.part === part);

    if(filtered.length === 0) {
        listDiv.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:40px 0;">해당하는 운동 기록이 없습니다.</p>`;
        return;
    }

    listDiv.innerHTML = filtered.map(w => `
        <div class="card" style="position:relative; padding:15px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:5px;">${w.date}</div>
            <strong style="font-size:16px;">[${w.part}] ${w.name}</strong>
            <div style="font-size:13px; color:#475569; margin-top:5px;">
                ${w.type === 'weight' ? `${w.weight}kg | ${w.sets}세트 | ${w.reps}회` : `${w.time}분 | ${w.dist}km`}
            </div>
            ${w.memo ? `<div style="font-size:12px; color:#94a3b8; margin-top:8px; font-style:italic;">"${w.memo}"</div>` : ''}
            <div style="margin-top:12px; display:flex; gap:10px;">
                <button class="btn-sm btn-edit" onclick="window.goToEdit('${w.date}', '${w.id}')">수정/삭제하러 가기</button>
            </div>
        </div>
    `).join('');
};

window.goToEdit = function(date, id) {
    window.currentDate = date;
    document.getElementById('global-date').value = date;
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="workout"]').classList.add('active');
    window.renderActiveTab();
    alert("해당 날짜로 이동했습니다. 아래 운동 목록에서 수정 또는 삭제를 진행하세요.");
};