window.renderWorkout = function() {
    const content = document.getElementById('app-content');
    const lib = JSON.parse(localStorage.getItem("workout_lib") || "[]");
    const dateStr = window.currentDate;
    const dayData = JSON.parse(localStorage.getItem("fit_data") || "{}")[dateStr] || {};
    const workouts = dayData.workout || [];

    content.innerHTML = `
        <form id="work-form" class="card">
            <h3 style="margin:0 0 15px 0;">🏋️ 운동 기록 추가</h3>
            <label>종류</label>
            <select id="work-type" onchange="window.toggleWorkoutType(this.value)">
                <option value="weight">웨이트 (근력)</option>
                <option value="cardio">유산소</option>
            </select>

            <div id="weight-fields">
                <label>부위</label>
                <select id="work-part"><option>가슴</option><option>등</option><option>어깨</option><option>하체</option><option>팔</option><option>기타</option></select>
                <label>운동명</label>
                <input type="text" id="work-name" list="lib-list" placeholder="예: 렛 풀 다운" oninput="window.fillLastWorkout(this.value)">
                <datalist id="lib-list">${lib.map(l => `<option value="${l}">`).join('')}</datalist>
                <label>중량 (kg)</label>
                <input type="number" id="work-weight" placeholder="0">
                <div style="display:flex; gap:10px;">
                    <div style="flex:1"><label>세트</label><input type="number" id="work-sets"></div>
                    <div style="flex:1"><label>세트당 횟수</label><input type="number" id="work-reps"></div>
                </div>
            </div>

            <div id="cardio-fields" style="display:none;">
                <label>유산소 명칭</label><input type="text" id="cardio-name" placeholder="천국계단 등">
                <div style="display:flex; gap:10px;">
                    <div style="flex:1"><label>분</label><input type="number" id="cardio-time"></div>
                    <div style="flex:1"><label>km</label><input type="number" id="cardio-dist" step="0.1"></div>
                </div>
            </div>

            <label>자세 메모</label><textarea id="work-memo" rows="2"></textarea>
            <button type="submit" class="primary">기록 저장하기</button>
        </form>

        <div class="card">
            <h4>오늘의 운동 목록 (수정/삭제)</h4>
            ${workouts.map(w => `
                <div style="padding:10px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>[${w.part}] ${w.name}</strong><br>
                        <small>${w.type==='weight' ? `${w.weight}kg|${w.sets}세트` : `${w.time}분`}</small>
                    </div>
                    <button class="btn-sm btn-del" onclick="window.deleteWorkoutItem('${w.id}')">삭제</button>
                </div>
            `).join('') || '<p style="font-size:12px; color:#94a3b8;">기록이 없습니다.</p>'}
        </div>
    `;
    document.getElementById('work-form').onsubmit = window.saveWork;
};

window.fillLastWorkout = function(name) {
    const history = JSON.parse(localStorage.getItem("workout_history") || "{}");
    if(history[name]) {
        const last = history[name];
        document.getElementById('work-part').value = last.part;
        document.getElementById('work-weight').value = last.weight;
        document.getElementById('work-sets').value = last.sets;
        document.getElementById('work-reps').value = last.reps;
    }
};

window.saveWork = function(e) {
    e.preventDefault();
    const dateStr = window.currentDate;
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    if(!data[dateStr]) data[dateStr] = {};
    if(!data[dateStr].workout) data[dateStr].workout = [];

    const type = document.getElementById('work-type').value;
    const name = type === 'weight' ? document.getElementById('work-name').value : document.getElementById('cardio-name').value;
    
    const entry = { id: "W"+Date.now(), type, name, memo: document.getElementById('work-memo').value };

    if(type === 'weight') {
        entry.part = document.getElementById('work-part').value;
        entry.weight = document.getElementById('work-weight').value;
        entry.sets = document.getElementById('work-sets').value;
        entry.reps = document.getElementById('work-reps').value;
        
        // 자동 입력을 위한 마지막 값 저장
        const history = JSON.parse(localStorage.getItem("workout_history") || "{}");
        history[name] = { part: entry.part, weight: entry.weight, sets: entry.sets, reps: entry.reps };
        localStorage.setItem("workout_history", JSON.stringify(history));
    } else {
        entry.part = "유산소";
        entry.time = document.getElementById('cardio-time').value;
        entry.dist = document.getElementById('cardio-dist').value;
    }

    data[dateStr].workout.push(entry);
    localStorage.setItem("fit_data", JSON.stringify(data));
    
    const lib = JSON.parse(localStorage.getItem("workout_lib") || "[]");
    if(!lib.includes(name)) { lib.push(name); localStorage.setItem("workout_lib", JSON.stringify(lib)); }

    alert("저장되었습니다!");
    window.renderActiveTab();
};

window.deleteWorkoutItem = function(id) {
    if(!confirm("이 운동 기록을 삭제할까요?")) return;
    const data = JSON.parse(localStorage.getItem("fit_data"));
    data[window.currentDate].workout = data[window.currentDate].workout.filter(w => w.id !== id);
    localStorage.setItem("fit_data", JSON.stringify(data));
    window.renderActiveTab();
};

window.toggleWorkoutType = (t) => {
    document.getElementById('weight-fields').style.display = t === 'weight' ? 'block' : 'none';
    document.getElementById('cardio-fields').style.display = t === 'cardio' ? 'block' : 'none';
};