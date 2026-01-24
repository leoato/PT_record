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
        const tab = document.querySelector('.nav-btn.active').dataset.tab;
        const title = document.getElementById('view-title');
        if(tab === 'dash') { title.innerText="캘린더"; renderDashboard(); }
        else if(tab === 'workout') { title.innerText="운동"; renderWorkout(); }
        else if(tab === 'food') { title.innerText="식단"; renderNutrition(); }
        else if(tab === 'history') { title.innerText="기록"; renderHistory(); }
        else if(tab === 'graph') { title.innerText="분석"; renderGraphs(); }
        else if(tab === 'mgmt') { title.innerText="설정"; renderManagement(); }
    };
    document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderActiveTab();
    });
    renderActiveTab();
});