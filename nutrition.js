window.renderNutrition = async function() {
    const content = document.getElementById('app-content');
    const { data: meals } = await supabase.from('fit_data').select('*').eq('date_str', window.currentDate).eq('category', 'food');
    const totalP = meals?.reduce((s, m) => s + Number(m.content.prot), 0) || 0;
    content.innerHTML = `
        <div class="card" style="background:var(--success); color:white; text-align:center;"><h2>${totalP}g / 90g</h2></div>
        <form id="f-form" class="card">
            <input type="text" id="f-name" placeholder="식품명">
            <input type="number" id="f-prot" placeholder="단백질(g)">
            <button type="submit" class="primary" style="background:var(--success)">식단 저장</button>
        </form>
        <div class="card"><h4>오늘의 식단</h4>${meals?.map(m => `<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>${m.content.name} (${m.content.prot}g)</span><button onclick="delData('${m.id}')" style="color:red; border:none; background:none;">삭제</button></div>`).join('') || '없음'}</div>`;
    document.getElementById('f-form').onsubmit = async (e) => {
        e.preventDefault();
        await supabase.from('fit_data').insert([{ id: "F"+Date.now(), user_id: USER_ID, date_str: window.currentDate, category: 'food', content: { name: document.getElementById('f-name').value, prot: document.getElementById('f-prot').value } }]);
        renderActiveTab();
    };
};