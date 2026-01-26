window.renderGraphs = function() {
    const content = document.getElementById('app-content');
    
    // 상단에 기간 선택 버튼 추가
    content.innerHTML = `
        <div class="card" style="display:flex; gap:10px; padding:10px; background:#eff6ff; border:none;">
            <button onclick="window.loadChartData(7)" class="btn-sm" id="btn-7d" style="flex:1; background:var(--primary); color:white;">최근 7일</button>
            <button onclick="window.loadChartData(30)" class="btn-sm" id="btn-30d" style="flex:1; background:white; color:var(--primary); border:1px solid var(--primary);">최근 30일</button>
        </div>
        <div class="card" style="height:320px;">
            <h4 id="weight-title" style="margin:0 0 10px 0;">📉 몸무게 변화 (7일)</h4>
            <canvas id="wChart" style="width:100%; height:250px;"></canvas>
        </div>
        <div class="card" style="height:320px;">
            <h4 id="prot-title" style="margin:0 0 10px 0;">📈 단백질 현황 (7일)</h4>
            <canvas id="pChart" style="width:100%; height:250px;"></canvas>
        </div>
    `;

    // 초기 실행 (7일 기준)
    window.loadChartData(7);
};

// [기능 확장] 기간별 데이터 로드 및 그래프 생성 함수
window.loadChartData = function(days) {
    // 버튼 스타일 업데이트
    const b7 = document.getElementById('btn-7d');
    const b30 = document.getElementById('btn-30d');
    if(days === 7) {
        b7.style.background = 'var(--primary)'; b7.style.color = 'white';
        b30.style.background = 'white'; b30.style.color = 'var(--primary)';
        document.getElementById('weight-title').innerText = "📉 몸무게 변화 (최근 7일)";
        document.getElementById('prot-title').innerText = "📈 단백질 현황 (최근 7일)";
    } else {
        b30.style.background = 'var(--primary)'; b30.style.color = 'white';
        b7.style.background = 'white'; b7.style.color = 'var(--primary)';
        document.getElementById('weight-title').innerText = "📉 몸무게 변화 (최근 30일)";
        document.getElementById('prot-title').innerText = "📈 단백질 현황 (최근 30일)";
    }

    setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
        const labels = [], weights = [], prots = [];

        // 선택한 기간(days)만큼 루프
        for(let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const s = d.toISOString().split('T')[0];
            
            // 30일일 때는 가독성을 위해 날짜를 5일 간격으로만 표시하거나 간략하게 표시
            labels.push(days === 30 && i % 5 !== 0 ? "" : s.slice(5)); 
            
            const dayEntry = data[s] || {};
            weights.push(dayEntry.weight ? parseFloat(dayEntry.weight) : null);
            prots.push(dayEntry.food ? dayEntry.food.reduce((sum, f) => sum + Number(f.prot), 0) : 0);
        }

        // 기존 차트가 있다면 파괴하고 새로 생성 (Chart.js 필수 작업)
        if(window.wChartObj) window.wChartObj.destroy();
        if(window.pChartObj) window.pChartObj.destroy();

        const ctxW = document.getElementById('wChart').getContext('2d');
        window.wChartObj = new Chart(ctxW, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'kg',
                    data: weights,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    spanGaps: true,
                    pointRadius: days === 30 ? 0 : 3 // 30일일 땐 점을 숨겨서 깔끔하게
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctxP = document.getElementById('pChart').getContext('2d');
        window.pChartObj = new Chart(ctxP, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '단백질(g)',
                    data: prots,
                    backgroundColor: '#059669',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 100);
};