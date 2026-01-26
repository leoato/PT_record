window.renderNutrition = function() {
    const content = document.getElementById('app-content');
    const dateStr = window.currentDate;
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    const day = data[dateStr] || {};
    const meals = day.food || [];
    
    const foodPresets = JSON.parse(localStorage.getItem("food_presets") || "{}");
    const foodLib = Object.keys(foodPresets);

    content.innerHTML = `
        <div class="card" style="background:var(--success); color:white; text-align:center;">
            <p style="margin:0;">오늘의 단백질 현황</p>
            <h1 style="margin:5px 0;">${meals.reduce((s,m)=>s+Number(m.prot),0)}g / 90g</h1>
        </div>

        <form id="food-form" class="card">
            <h4 id="food-title">🥗 식단 추가</h4>
            <input type="hidden" id="edit-food-id">
            <label>식품명</label>
            <input type="text" id="food-name" list="food-lib" oninput="window.autoFillFood(this.value)" placeholder="예: 닭가슴살 스틱">
            <datalist id="food-lib">${foodLib.map(f => `<option value="${f}">`).join('')}</datalist>
            
            <label>단백질 (g)</label>
            <input type="number" id="food-prot" placeholder="0">
            <button type="submit" id="food-submit-btn" class="primary" style="background:var(--success)">식단 저장</button>
        </form>

        <div class="card">
            <h4>오늘의 식단 리스트</h4>
            <div class="item-list">
                ${meals.map(m => `
                    <div class="record-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                        <div><strong>${m.name}</strong> - ${m.prot}g</div>
                        <div>
                            <button class="btn-sm btn-edit" onclick="window.editFood('${m.id}')">수정</button>
                            <button class="btn-sm btn-del" onclick="window.deleteFood('${m.id}')">삭제</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('food-form').onsubmit = window.saveFood;
};

// [추가] 식단 수정 기능
window.editFood = function(id) {
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    const meal = data[window.currentDate].food.find(f => f.id === id);
    
    document.getElementById('edit-food-id').value = meal.id;
    document.getElementById('food-name').value = meal.name;
    document.getElementById('food-prot').value = meal.prot;
    document.getElementById('food-title').innerText = "🥗 식단 수정";
    document.getElementById('food-submit-btn').innerText = "수정 완료";
};

// [추가] 식단 삭제 기능
window.deleteFood = function(id) {
    if(!confirm("정말 삭제할까요?")) return;
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    data[window.currentDate].food = data[window.currentDate].food.filter(f => f.id !== id);
    localStorage.setItem("fit_data", JSON.stringify(data));
    window.renderActiveTab();
};

// 기존 autoFillFood 및 saveFood 로직 유지
window.autoFillFood = function(name) {
    const presets = JSON.parse(localStorage.getItem("food_presets") || "{}");
    if(presets[name]) document.getElementById('food-prot').value = presets[name].prot;
};

window.saveFood = function(e) {
    e.preventDefault();
    const dateStr = window.currentDate;
    const data = JSON.parse(localStorage.getItem("fit_data") || "{}");
    if(!data[dateStr]) data[dateStr] = {};
    if(!data[dateStr].food) data[dateStr].food = [];

    const editId = document.getElementById('edit-food-id').value;
    const name = document.getElementById('food-name').value;
    const prot = document.getElementById('food-prot').value;

    const entry = { id: editId || "F" + Date.now(), name, prot };

    const presets = JSON.parse(localStorage.getItem("food_presets") || "{}");
    presets[name] = { prot };
    localStorage.setItem("food_presets", JSON.stringify(presets));

    if(editId) {
        const idx = data[dateStr].food.findIndex(f => f.id === editId);
        data[dateStr].food[idx] = entry;
    } else {
        data[dateStr].food.push(entry);
    }
    localStorage.setItem("fit_data", JSON.stringify(data));
    window.renderActiveTab();
};
