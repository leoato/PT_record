window.renderManagement = function() {
    const content = document.getElementById('app-content');
    
    // 1. 저장된 마지막 백업 시간 가져오기
    const lastBackup = localStorage.getItem("last_backup_time") || "없음";

    content.innerHTML = `
        <div class="card">
            <h3>💾 데이터 백업 및 관리 <span id="last-backup-display" style="font-size:11px; color:var(--primary); font-weight:normal; margin-left:10px;">(최근: ${lastBackup})</span></h3>
            <p style="font-size:12px; color:#64748b; margin-bottom:15px;">아이폰 Koder 앱 환경에서는 아래 <strong>'클립보드 복사'</strong>를 추천합니다.</p>
            
            <div style="display:grid; gap:10px;">
                <button class="primary" onclick="window.exportDataFinal()">1. 파일로 내보내기 (작동 안할 시 아래 클릭)</button>
                <button class="primary" style="background:#1e293b;" onclick="window.copyToClipboardData()">2. 전체 데이터 클립보드 복사</button>
            </div>

            <div style="margin-top:30px;">
                <label>데이터 불러오기 (가져오기)</label>
                <p style="font-size:11px; color:#94a3b8;">* 복사해둔 텍스트를 담은 .json 파일을 선택하세요.</p>
                <input type="file" id="import-file" onchange="window.importDataFinal(this)">
            </div>
            
            <button class="primary" style="background:var(--danger); margin-top:50px;" onclick="window.clearAllData()">전체 초기화 (데이터 삭제)</button>
        </div>
        
        <div id="copy-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; border-radius:15px; box-shadow:0 0 20px rgba(0,0,0,0.2); width:80%; z-index:300;">
            <p style="font-size:13px; font-weight:bold;">데이터가 복사되었습니다!</p>
            <p style="font-size:11px;">Koder에서 새 파일을 만들어 붙여넣고 .json으로 저장하세요.</p>
            <button class="primary" onclick="document.getElementById('copy-modal').style.display='none'">확인</button>
        </div>
    `;
};

// [기능] 마지막 백업 시간 기록 및 화면 갱신 함수
window.updateBackupTime = () => {
    const now = new Date();
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    localStorage.setItem("last_backup_time", timeStr);
    
    // 화면상의 텍스트만 즉시 변경 (깜빡임 방지)
    const display = document.getElementById('last-backup-display');
    if(display) display.innerText = `(최근: ${timeStr})`;
};

// [기능] 데이터 수집 (공통)
window.getBackupData = () => {
    const keys = ["fit_data", "workout_lib", "workout_history", "food_presets"];
    const backup = {};
    keys.forEach(k => backup[k] = JSON.parse(localStorage.getItem(k) || "{}"));
    return JSON.stringify(backup, null, 2);
};

// 1. 파일 내보내기
window.exportDataFinal = () => {
    const jsonStr = window.getBackupData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FitTrack_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.updateBackupTime(); // 시간 기록
};

// 2. 클립보드 복사
window.copyToClipboardData = () => {
    const jsonStr = window.getBackupData();
    
    const el = document.createElement('textarea');
    el.value = jsonStr;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    window.updateBackupTime(); // 시간 기록
    document.getElementById('copy-modal').style.display = 'block';
};

// 3. 데이터 불러오기
window.importDataFinal = (input) => {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if(confirm("기존 데이터를 모두 지우고 불러오시겠습니까?")) {
                Object.keys(data).forEach(k => {
                    localStorage.setItem(k, JSON.stringify(data[k]));
                });
                alert("성공적으로 복구되었습니다!");
                location.reload();
            }
        } catch(err) { alert("잘못된 파일 형식입니다."); }
    };
    reader.readAsText(file);
};

// 4. 전체 초기화
window.clearAllData = () => {
    if(confirm("정말로 모든 기록을 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
        localStorage.clear();
        location.reload();
    }
};
