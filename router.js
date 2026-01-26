// [수정] 한국 시간(KST)을 YYYY-MM-DD 형식으로 정확히 가져오는 함수
function getKSTDate() {
    const now = new Date();
    // 한국 시간(UTC+9)을 위해 시차(분)를 밀리초로 변환하여 더해줍니다.
    const offset = now.getTimezoneOffset() * 60000; 
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().split('T')[0];
}

// 앱 초기화 시 오늘 날짜 설정 (이제 25일로 정확히 뜹니다!)
window.currentDate = getKSTDate();

document.addEventListener('DOMContentLoaded', () => {
    // 날짜 입력창 초기값 설정
    const globalDateInput = document.getElementById('global-date');
    if (globalDateInput) {
        globalDateInput.value = window.currentDate;
    }
    
    const navBtns = document.querySelectorAll('.nav-btn');

    // 전역 날짜 업데이트 함수
    window.updateGlobalDate = (val) => {
        window.currentDate = val;
        window.renderActiveTab();
    };

    // [수정] 오늘 버튼 클릭 시 한국 시간 기준으로 갱신
    window.setToday = () => {
        const today = getKSTDate();
        const input = document.getElementById('global-date');
        if (input) {
            input.value = today;
        }
        window.updateGlobalDate(today);
    };

    // 탭 렌더링 함수
    window.renderActiveTab = () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        const activeTab = activeBtn ? activeBtn.dataset.tab : 'dash';
        const content = document.getElementById('app-content');
        const title = document.getElementById('view-title');
        
        content.innerHTML = ""; 

        if(activeTab === 'dash') { title.innerText = "성장 캘린더"; window.renderDashboard(); }
        else if(activeTab === 'workout') { title.innerText = "운동 기록"; window.renderWorkout(); }
        else if(activeTab === 'food') { title.innerText = "식단 트래커"; window.renderNutrition(); }
        else if(activeTab === 'history') { title.innerText = "전체 기록 모아보기"; window.renderHistory(); }
        else if(activeTab === 'graph') { title.innerText = "변화 그래프"; window.renderGraphs(); }
        else if(activeTab === 'mgmt') { title.innerText = "설정 및 관리"; window.renderManagement(); }
    };

    // 네비게이션 버튼 이벤트 바인딩
    navBtns.forEach(btn => btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.renderActiveTab();
    }));

    // 첫 실행 시 화면 렌더링
    window.renderActiveTab();
});
