window.renderHistory = async function() {
    const content = document.getElementById('app-content');
    content.innerHTML = `<div class="card" id="history-list">불러오는 중...</div>`;

    // 서버에서 모든 기록을 날짜 내림차순(최신순)으로 가져옵니다.
    const { data, error } = await supabase
        .from('fit_data')
        .select('*')
        .eq('user_id', USER_ID)
        .order('date_str', { ascending: false });

    if (error) {
        content.innerHTML = `<div class="card">오류 발생: ${error.message}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        content.innerHTML = `<div class="card">기록이 하나도 없습니다. 🧐</div>`;
        return;
    }

    // 데이터를 날짜별로 예쁘게 리스트화합니다.
    content.innerHTML = `<h3>📜 전체 기록 모아보기</h3>` + data.map(d => {
        let detail = "";
        if (d.category === 'workout') detail = `🏋️ ${d.content.name} (${d.content.w}kg x ${d.content.s}set)`;
        else if (d.category === 'food') detail = `🍱 ${d.content.name} (${d.content.prot}g)`;
        else if (d.category === 'weight') detail = `⚖️ 공복 몸무게: ${d.content.value}kg`;

        return `
            <div class="card" style="padding:12px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:12px; color:#64748b;">${d.date_str}</div>
                    <button onclick="delData('${d.id}')" style="color:var(--danger); border:none; background:none; font-size:12px;">삭제</button>
                </div>
                <div style="font-weight:bold; margin-top:5px;">${detail}</div>
            </div>
        `;
    }).join('');
};