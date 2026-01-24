function getKSTDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
}
window.currentDate = getKSTDate();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('global-date').value = window.currentDate;
    window.updateGlobalDate = (val) => { window.currentDate = val; renderActiveTab(); };
    window.setToday = () => { window.currentDate = getKSTDate(); document.getElementById('global-date').value = window.currentDate; renderActiveTab(); };
    
    window.renderActiveTab = () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        const tab = activeBtn ? activeBtn.dataset.tab : 'dash';
        const title = document.getElementById('view-title');
        if(tab === 'dash') { title.innerText="캘린더"; renderDashboard(); }
        else if(tab === 'workout') { title.innerText="운동 기록"; renderWorkout(); }
        else if(tab === 'food') { title.innerText="식단 트래커"; renderNutrition(); }
        else if(tab === 'graph') { title.innerText="변화 그래프"; renderGraphs(); }
        else if(tab === 'mgmt') { title.innerText="데이터 관리"; renderManagement(); }
    };

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderActiveTab();
        });
    });
    renderActiveTab();
});