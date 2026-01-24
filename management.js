window.renderManagement = function() {
    document.getElementById('app-content').innerHTML = `
        <div class="card">
            <h3>☁️ 데이터 이사</h3>
            <button class="primary" onclick="migrate()">폰 기록 -> 서버 전송</button>
        </div>
        <div class="card"><button class="primary" style="background:var(--danger);" onclick="localStorage.clear(); location.reload();">캐시 초기화</button></div>`;
};

async function migrate() {
    const local = JSON.parse(localStorage.getItem("fit_data") || "{}");
    const queue = [];
    Object.keys(local).forEach(date => {
        const day = local[date];
        if(day.workout) day.workout.forEach(w => queue.push({ id: w.id, user_id: USER_ID, date_str: date, category: 'workout', content: w }));
        if(day.food) day.food.forEach(f => queue.push({ id: f.id, user_id: USER_ID, date_str: date, category: 'food', content: f }));
        if(day.weight) queue.push({ id: "WT"+date, user_id: USER_ID, date_str: date, category: 'weight', content: { value: day.weight } });
    });
    if(queue.length > 0) { await supabase.from('fit_data').upsert(queue); alert("이사 완료!"); }
}