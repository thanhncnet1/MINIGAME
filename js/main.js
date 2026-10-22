window.isAdminUnlocked = false;
window.ADMIN_PASSWORD = "123456";

window.createdMinigames = JSON.parse(localStorage.getItem('pb_created_minigames')) || [
    { id: 'mg_bracket_default', name: 'Phú Thọ Open (Bảng & Vòng Tròn)', type: 'bracket' }
];

window.currentBracketMinigameId = localStorage.getItem('pb_current_bracket_mg_id') || 'mg_bracket_default';

function checkAdminPassword() {
    const inputPass = document.getElementById('admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        const badge = document.getElementById('admin-status-badge');
        if(badge) {
            badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
            badge.className = "text-xs font-bold text-emerald-700 flex items-center gap-1";
        }
        alert("🔑 Xác thực Admin thành công!");
        renderDayDetailView();
        renderHomeClosestDateView();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
}

function checkFundAdminPassword() {
    const inputPass = document.getElementById('fund-admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        const badge = document.getElementById('fund-admin-status-badge');
        const badgeDay = document.getElementById('admin-status-badge');
        if(badge) {
            badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-300"></i> Admin Quỹ: Mở Khóa`;
            badge.className = "text-xs font-extrabold text-emerald-300 flex items-center gap-1";
        }
        if(badgeDay) {
            badgeDay.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
            badgeDay.className = "text-xs font-bold text-emerald-700 flex items-center gap-1";
        }
        alert("🔑 Xác thực Admin thành công!");
        updateFundDashboard();
        renderDayDetailView();
        renderHomeClosestDateView();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
}

function requireAdminAuth(actionCallback) {
    if (window.isAdminUnlocked) {
        actionCallback();
    } else {
        const pass = prompt("🔒 Vui lòng nhập mật khẩu Admin để thực hiện:");
        if (pass === window.ADMIN_PASSWORD) {
            window.isAdminUnlocked = true;
            alert("🔑 Xác thực Admin thành công!");
            actionCallback();
        } else if (pass !== null) {
            alert("❌ Mật khẩu Admin không đúng!");
        }
    }
}

function openCreateTournamentPage(defaultType = 'bracket') {
    closeAllDropdowns();
    showTab('create_tournament');
    const radio = document.querySelector(`input[name="tourney-type"][value="${defaultType}"]`);
    if (radio) radio.checked = true;
    document.getElementById('new-tourney-name').value = '';
}

function submitNewTournament() {
    const nameInput = document.getElementById('new-tourney-name').value.trim();
    const typeInput = document.querySelector('input[name="tourney-type"]:checked').value;

    if (!nameInput) {
        alert("⚠️ Vui lòng nhập tên giải đấu!");
        return;
    }

    const newTourney = {
        id: 'mg_' + Date.now(),
        name: nameInput,
        type: typeInput,
        createdAt: new Date().toISOString()
    };

    window.createdMinigames.push(newTourney);
    localStorage.setItem('pb_created_minigames', JSON.stringify(window.createdMinigames));

    window.currentBracketMinigameId = newTourney.id;
    localStorage.setItem('pb_current_bracket_mg_id', newTourney.id);
    showTab('minigame2');
    renderM2();

    renderDynamicMinigameDropdowns();
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
    alert(`🎉 Đã khởi tạo thành công Giải đấu: ${newTourney.name}!`);
}

function renderDynamicMinigameDropdowns() {
    const containerBracket = document.getElementById('nav-m2-dropdown-list');
    const bracketList = window.createdMinigames.filter(m => m.type === 'bracket');
    const currentBracketMg = bracketList.find(m => m.id === window.currentBracketMinigameId) || bracketList[0];

    if (currentBracketMg) {
        window.currentBracketMinigameId = currentBracketMg.id;
        const el = document.getElementById('current-m2-tourney-name');
        if(el) el.innerText = currentBracketMg.name;
    }

    if (containerBracket) {
        containerBracket.innerHTML = bracketList.map(mg => `
            <div class="dropdown-item ${mg.id === window.currentBracketMinigameId ? 'bg-emerald-100 font-bold text-emerald-900' : ''}" onclick="selectMinigameActive('${mg.id}', 'bracket')">
                <span class="truncate flex items-center gap-1.5"><i class="fa-solid fa-diagram-project text-emerald-600"></i> ${mg.name}</span>
                <div class="flex items-center gap-1">
                    <button onclick="renameMinigameById('${mg.id}', event)" class="text-blue-600 hover:text-blue-800 p-1" title="Sửa tên"><i class="fa-solid fa-pen"></i></button>
                    ${bracketList.length > 1 ? `<button onclick="deleteMinigameById('${mg.id}', event)" class="text-red-500 hover:text-red-700 p-1" title="Xóa giải"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        `).join('');
    }
}

function selectMinigameActive(id, type) {
    closeAllDropdowns();
    window.currentBracketMinigameId = id;
    localStorage.setItem('pb_current_bracket_mg_id', id);
    showTab('minigame2');
    renderM2();
    renderDynamicMinigameDropdowns();
}

function renameCurrentMinigame(type) {
    renameMinigameById(window.currentBracketMinigameId);
}

function renameMinigameById(id, e) {
    if(e) e.stopPropagation();
    closeAllDropdowns();
    const mg = window.createdMinigames.find(item => item.id === id);
    if (mg) {
        const newName = prompt(`Nhập tên mới cho giải "${mg.name}":`, mg.name);
        if (newName && newName.trim() !== '' && newName !== mg.name) {
            mg.name = newName.trim();
            localStorage.setItem('pb_created_minigames', JSON.stringify(window.createdMinigames));
            renderDynamicMinigameDropdowns();
            autoBackupData();
            if (window.syncToFirebase) window.syncToFirebase();
        }
    }
}

function deleteMinigameById(id, e) {
    if(e) e.stopPropagation();
    closeAllDropdowns();
    const mg = window.createdMinigames.find(item => item.id === id);
    if (mg && confirm(`Bạn có chắc chắn muốn XÓA giải đấu "${mg.name}"?`)) {
        window.createdMinigames = window.createdMinigames.filter(item => item.id !== id);
        localStorage.setItem('pb_created_minigames', JSON.stringify(window.createdMinigames));

        const remainingBracket = window.createdMinigames.filter(m => m.type === 'bracket');
        if (remainingBracket.length > 0) window.currentBracketMinigameId = remainingBracket[0].id;

        renderDynamicMinigameDropdowns();
        refreshAllViews();
        autoBackupData();
        if (window.syncToFirebase) window.syncToFirebase();
    }
}

window.players = JSON.parse(localStorage.getItem('pb_players_list')) || [
    { id: 1, name: "Tiến Thọ", gender: "Nam" },
    { id: 2, name: "Châu Sĩ", gender: "Nam" },
    { id: 3, name: "Vân Đình", gender: "Nữ" },
    { id: 4, name: "Ly", gender: "Nữ" },
    { id: 5, name: "Phú Mỗ", gender: "Nam" },
    { id: 6, name: "Hà Giấy", gender: "Nam" },
    { id: 7, name: "Long Diễm", gender: "Nam" },
    { id: 8, name: "Tuấn La", gender: "Nam" },
    { id: 9, name: "Trí Đô", gender: "Nam" },
    { id: 10, name: "Thành Sóc", gender: "Nam" },
    { id: 11, name: "Quỳnh Cool", gender: "Nữ" },
    { id: 12, name: "Hải Hà", gender: "Nữ" },
    { id: 13, name: "Dũng Ngạc", gender: "Nam" },
    { id: 14, name: "Lợi Trì", gender: "Nam" },
    { id: 15, name: "Thành Đàm", gender: "Nam" },
    { id: 16, name: "Điền Chèm", gender: "Nam" },
    { id: 17, name: "Hạnh", gender: "Nữ" },
    { id: 18, name: "Minh Vương", gender: "Nam" }
];

window.minigameTeamData = JSON.parse(localStorage.getItem('pb_minigame_team_standalone_data')) || {
    tourneyName: "MINIGAME TEAM A & B",
    teamA: ["Tiến Thọ", "Châu Sĩ", "Phú Mỗ", "Hà Giấy", "Long Diễm", "Tuấn La", "Vân Đình", "Ly", "Quỳnh Cool"],
    teamB: ["Trí Đô", "Thành Sóc", "Dũng Ngạc", "Lợi Trì", "Thành Đàm", "Điền Chèm", "Hải Hà", "Hạnh", "Minh Vương"],
    matches: [
        { id: 1, luot: 1, san: 1, noidung: "Đôi Nam", a1: "Tiến Thọ", a2: "Châu Sĩ", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Thành Sóc", note: "" },
        { id: 2, luot: 1, san: 2, noidung: "Đôi Nam", a1: "Phú Mỗ", a2: "Hà Giấy", scoreA: "", scoreB: "", b1: "Dũng Ngạc", b2: "Lợi Trì", note: "" },
        { id: 3, luot: 1, san: 3, noidung: "Đôi Nam", a1: "Long Diễm", a2: "Tuấn La", scoreA: "", scoreB: "", b1: "Thành Đàm", b2: "Điền Chèm", note: "" },
        { id: 4, luot: 2, san: 1, noidung: "Đôi Nam", a1: "Tiến Thọ", a2: "Phú Mỗ", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Dũng Ngạc", note: "" },
        { id: 5, luot: 2, san: 2, noidung: "Đôi Nam", a1: "Châu Sĩ", a2: "Hà Giấy", scoreA: "", scoreB: "", b1: "Thành Sóc", b2: "Lợi Trì", note: "" },
        { id: 6, luot: 2, san: 3, noidung: "Đôi Nam", a1: "Long Diễm", a2: "Hà Giấy", scoreA: "", scoreB: "", b1: "Thành Đàm", b2: "Dũng Ngạc", note: "" },
        { id: 7, luot: 3, san: 1, noidung: "Đôi Nam", a1: "Tiến Thọ", a2: "Hà Giấy", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Lợi Trì", note: "" },
        { id: 8, luot: 3, san: 2, noidung: "Đôi Nam", a1: "Châu Sĩ", a2: "Phú Mỗ", scoreA: "", scoreB: "", b1: "Thành Sóc", b2: "Dũng Ngạc", note: "" },
        { id: 9, luot: 3, san: 3, noidung: "Đôi Nam", a1: "Tuấn La", a2: "Long Diễm", scoreA: "", scoreB: "", b1: "Minh Vương", b2: "Điền Chèm", note: "" },
        { id: 10, luot: 4, san: 1, noidung: "Đôi Nữ", a1: "Vân Đình", a2: "Ly", scoreA: "", scoreB: "", b1: "Hải Hà", b2: "Hạnh", note: "" },
        { id: 11, luot: 4, san: 2, noidung: "Đôi Nữ", a1: "Ly", a2: "Quỳnh Cool", scoreA: "", scoreB: "", b1: "Hạnh", b2: "Minh Vương", note: "" },
        { id: 12, luot: 4, san: 3, noidung: "Đôi Nữ", a1: "Vân Đình", a2: "Quỳnh Cool", scoreA: "", scoreB: "", b1: "Hải Hà", b2: "Minh Vương", note: "" },
        { id: 13, luot: 5, san: 1, noidung: "Đôi Nam Nam", a1: "Tiến Thọ", a2: "Tuấn La", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Minh Vương", note: "" },
        { id: 14, luot: 5, san: 2, noidung: "Đôi Nam Nam", a1: "Châu Sĩ", a2: "Long Diễm", scoreA: "", scoreB: "", b1: "Thành Sóc", b2: "Điền Chèm", note: "" },
        { id: 15, luot: 5, san: 3, noidung: "Đôi Nam Nam", a1: "Phú Mỗ", a2: "Hà Giấy", scoreA: "", scoreB: "", b1: "Dũng Ngạc", b2: "Thành Đàm", note: "" },
        { id: 16, luot: 6, san: 1, noidung: "Đôi Nam Nữ", a1: "Tiến Thọ", a2: "Vân Đình", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Hải Hà", note: "" },
        { id: 17, luot: 6, san: 2, noidung: "Đôi Nam Nữ", a1: "Châu Sĩ", a2: "Ly", scoreA: "", scoreB: "", b1: "Thành Sóc", b2: "Hạnh", note: "" },
        { id: 18, luot: 6, san: 3, noidung: "Đôi Nam Nữ", a1: "Phú Mỗ", a2: "Quỳnh Cool", scoreA: "", scoreB: "", b1: "Dũng Ngạc", b2: "Minh Vương", note: "" },
        { id: 19, luot: 7, san: 1, noidung: "Đôi Nam Nữ", a1: "Hà Giấy", a2: "Vân Đình", scoreA: "", scoreB: "", b1: "Lợi Trì", b2: "Hải Hà", note: "" },
        { id: 20, luot: 7, san: 2, noidung: "Đôi Nam Nữ", a1: "Long Diễm", a2: "Ly", scoreA: "", scoreB: "", b1: "Thành Đàm", b2: "Hạnh", note: "" },
        { id: 21, luot: 7, san: 3, noidung: "Đôi Nam Nữ", a1: "Tuấn La", a2: "Quỳnh Cool", scoreA: "", scoreB: "", b1: "Điền Chèm", b2: "Minh Vương", note: "" },
        { id: 22, luot: 8, san: 1, noidung: "Đôi Nam Nữ", a1: "Tiến Thọ", a2: "Ly", scoreA: "", scoreB: "", b1: "Trí Đô", b2: "Hạnh", note: "" },
        { id: 23, luot: 8, san: 2, noidung: "Đôi Nam Nữ", a1: "Châu Sĩ", a2: "Vân Đình", scoreA: "", scoreB: "", b1: "Thành Sóc", b2: "Hải Hà", note: "" },
        { id: 24, luot: 8, san: 3, noidung: "Đôi Nam Nữ", a1: "Phú Mỗ", a2: "Quỳnh Cool", scoreA: "", scoreB: "", b1: "Dũng Ngạc", b2: "Minh Vương", note: "" }
    ]
};

window.m2PairsA = [
    { p1: "Tiến Thọ", p2: "Châu Sĩ" },
    { p1: "Phú Mỗ", p2: "Hà Giấy" },
    { p1: "Long Diễm", p2: "Tuấn La" },
    { p1: "Vân Đình", p2: "Ly" }
];

window.m2PairsB = [
    { p1: "Trí Đô", p2: "Thành Sóc" },
    { p1: "Dũng Ngạc", p2: "Lợi Trì" },
    { p1: "Thành Đàm", p2: "Điền Chèm" },
    { p1: "Quỳnh Cool", p2: "Hải Hà" }
];

window.m2ScoresA = {};
window.m2ScoresB = {};
window.m2KeoState = { keoMode: 'default', customWin: 5, customLose: -15, payStatus: {}, btcOption: 'YES' };

window.dates = ["1/10/26"];
window.currentSelectedDate = "1/10/26";

window.matchesData = {
    "1/10/26": [
        { id: 1, c1_p1: "Trí Đô", c1_p2: "Tiến Thọ", c2_p1: "Phú Mỗ", c2_p2: "Thành Đàm", score1: "8", score2: "11", keoMode: "default", customWin: 5, customLose: -15 },
        { id: 2, c1_p1: "Phú Mỗ", c1_p2: "Thành Đàm", c2_p1: "Tiến Thọ", c2_p2: "Trí Đô", score1: "9", score2: "11", keoMode: "default", customWin: 5, customLose: -15 },
        { id: 3, c1_p1: "Tiến Thọ", c1_p2: "Trí Đô", c2_p1: "Thành Đàm", c2_p2: "Long Diễm", score1: "11", score2: "5", keoMode: "default", customWin: 5, customLose: -15 }
    ]
};

window.dateKeoMode = { "1/10/26": "default" };
window.paymentStatus = {
    "1/10/26_Vân Đình": true,
    "1/10/26_Tiến Thọ": true,
    "1/10/26": { btcNoteAdminOption: "YES" }
};

window.activeQuarterColumns = JSON.parse(localStorage.getItem('pb_active_quarter_cols')) || [
    { id: "q1", title: "Tiền Sân Quý 1", statusTitle: "Trạng Thái Q1", defaultAmt: 800000, bgColor: "teal" }
];

window.initialFund = Number(localStorage.getItem('pb_initial_fund')) || 500000;

const defaultFundIncomes = [
    { id: 1, date: "2026-01-05", desc: "Thu tiền ủng hộ giao lưu", amount: 500000, source: "Khách vãng lai / Khác", note: "Chuyển khoản tài trợ" }
];

const defaultFundExpenses = [
    { id: 1, date: "2026-01-02", desc: "Thanh toán tiền thuê sân Tháng 1", amount: 1200000, source: "Khách vãng lai / Khác", note: "Hóa đơn thanh toán tiền sân định kỳ" }
];

window.fundFeeStatus = JSON.parse(localStorage.getItem('pb_fee_status')) || {};
window.fundIncomes = JSON.parse(localStorage.getItem('pb_incomes')) || defaultFundIncomes;
window.fundExpenses = JSON.parse(localStorage.getItem('pb_expenses')) || defaultFundExpenses;
window.autoIncomeNotes = JSON.parse(localStorage.getItem('pb_auto_income_notes')) || {};

function getClosestDateToToday() {
    if (!window.dates || window.dates.length === 0) return null;
    if (window.dates.length === 1) return window.dates[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let closestDateStr = window.dates[0];
    let minDiff = Infinity;

    const parseDateString = (dStr) => {
        if (!dStr) return new Date(0);
        const parts = dStr.split('/');
        if (parts.length === 3) {
            let day = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            return new Date(year, month, day);
        }
        return new Date(dStr);
    };

    window.dates.forEach(dStr => {
        const dObj = parseDateString(dStr);
        const diff = Math.abs(dObj.getTime() - today.getTime());
        if (diff < minDiff) {
            minDiff = diff;
            closestDateStr = dStr;
        }
    });

    return closestDateStr;
}

function renderHomeClosestDateView() {
    const container = document.getElementById('home-closest-date-container');
    const titleEl = document.getElementById('home-closest-date-title');
    if (!container) return;

    const closestDate = getClosestDateToToday();
    if (!closestDate) {
        if(titleEl) titleEl.innerText = "Chưa có dữ liệu";
        container.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-55 rounded-xl">Chưa có ngày nào được tạo trong hệ thống.</div>`;
        return;
    }

    if(titleEl) titleEl.innerText = closestDate;

    const matches = window.matchesData[closestDate] || [];

    let matchesTableRows = '';
    let stats = {};
    window.players.forEach(p => { stats[p.name] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

    matches.forEach((m, idx) => {
        const val1 = (m.score1 || "").toString().trim();
        const val2 = (m.score2 || "").toString().trim();
        const s1 = parseInt(val1);
        const s2 = parseInt(val2);

        let keo1 = "", keo2 = "";
        const mMode = m.keoMode || window.dateKeoMode[closestDate] || 'default';
        let winAmt = 5, loseAmt = -15;

        if (mMode === 'k0') { winAmt = 0; loseAmt = 0; }
        else if (mMode === 'k25') { winAmt = 0; loseAmt = -25; }
        else if (mMode === 'free') {
            winAmt = parseFloat(m.customWin) || 0;
            loseAmt = parseFloat(m.customLose) || 0;
            if (loseAmt > 0) loseAmt = -loseAmt;
        }

        if(!isNaN(s1) && !isNaN(s2)) {
            let isHam = (s1 === 0 || s2 === 0);
            let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
            let effLose = isHam ? loseAmt * 2 : loseAmt;

            if(s1 > s2) { keo1 = effWin; keo2 = effLose; }
            else if(s2 > s1) { keo1 = effLose; keo2 = effWin; }
            else { keo1 = 0; keo2 = 0; }

            const pair1 = [m.c1_p1, m.c1_p2].filter(Boolean);
            const pair2 = [m.c2_p1, m.c2_p2].filter(Boolean);

            if(s1 > s2) {
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].loseK += effLose; stats[v].total += effLose; } });
            } else if(s2 > s1) {
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].loseK += effLose; stats[v].total += effLose; } });
            }
        }

        const buildPlayerSelectHome = (val, field) => {
            let opts = `<option value="">-- Chọn Pick --</option>`;
            window.players.forEach(p => {
                opts += `<option value="${p.name}" ${p.name === val ? 'selected' : ''}>${p.name}</option>`;
            });
            return `<select onchange="updateMatchDataForDate('${closestDate}', ${idx}, '${field}', this.value)" class="player-select-btn text-[11px] border rounded p-1 outline-none w-full bg-white shadow-sm">${opts}</select>`;
        };

        const isHam1 = (val1 === "0" || s1 === 0);
        const isHam2 = (val2 === "0" || s2 === 0);

        const score1Inner = isHam1 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMatchDataForDate('${closestDate}',${idx}, 'score1', this.value)">`;
        const score2Inner = isHam2 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMatchDataForDate('${closestDate}',${idx}, 'score2', this.value)">`;

        let keoCellUI = `
            <select onchange="updateMatchKeoModeForDate('${closestDate}',${idx}, this.value)" class="text-[10px] sm:text-[11px] font-bold p-0.5 border rounded bg-amber-50 outline-none w-full text-amber-900 border-amber-300">
                <option value="default" ${mMode==='default'?'selected':''}>Kèo (+5k/-15k)</option>
                <option value="k25" ${mMode==='k25'?'selected':''}>Kèo 25k (0k/-25k)</option>
                <option value="k0" ${mMode==='k0'?'selected':''}>Kèo 0K (0k/0k)</option>
                <option value="free" ${mMode==='free'?'selected':''}>Kèo Tự Do</option>
            </select>
        `;

        if (mMode === 'free') {
            keoCellUI += `
                <div class="flex items-center justify-center gap-1 mt-1">
                    <span class="text-[10px] text-emerald-700 font-bold">+</span>
                    <input type="number" class="keo-custom-input text-emerald-700" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMatchDataForDate('${closestDate}',${idx}, 'customWin', this.value)" title="Tiền thắng">
                    <span class="text-[10px] text-red-600 font-bold">/</span>
                    <input type="number" class="keo-custom-input text-red-600" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMatchDataForDate('${closestDate}',${idx}, 'customLose', this.value)" title="Tiền thua">
                </div>
            `;
        }

        matchesTableRows += `
            <tr class="hover:bg-slate-50 text-center">
                <td class="font-bold text-slate-700 whitespace-nowrap px-1">Trận ${idx + 1}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c1_p1, 'c1_p1')}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c1_p2, 'c1_p2')}</td>
                <td class="p-1 bg-purple-50/40 border-x border-purple-200">
                    <div class="flex items-center justify-center gap-0.5">
                        <div onclick="if(${isHam1}) updateMatchDataForDate('${closestDate}', ${idx}, 'score1', '')">${score1Inner}</div>
                        <span class="font-black text-slate-400 px-0.5">-</span>
                        <div onclick="if(${isHam2}) updateMatchDataForDate('${closestDate}', ${idx}, 'score2', '')">${score2Inner}</div>
                    </div>
                </td>
                <td class="p-1">${buildPlayerSelectHome(m.c2_p1, 'c2_p1')}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c2_p2, 'c2_p2')}</td>
                <td class="p-1 bg-amber-50/50">${keoCellUI}</td>
                <td class="p-1 font-extrabold ${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1 !== '' ? keo1 + 'K' : '---'}</td>
                <td class="p-1 font-extrabold ${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2 !== '' ? keo2 + 'K' : '---'}</td>
                <td class="p-1 text-center whitespace-nowrap">
                    <button onclick="deleteMatchFromDate('${closestDate}',${idx})" class="text-slate-400 hover:text-red-600 font-bold p-1 transition-colors" title="Xóa trận đấu">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    if(!matchesTableRows) {
        matchesTableRows = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Chưa có trận đấu nào được tạo trong ngày này.</td></tr>`;
    }

    let summaryRows = '';
    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0;

    window.players.forEach(p => {
        const st = stats[p.name];
        if(st.played > 0) {
            const payKey = `${closestDate}_${p.name}`;
            const isPaid = window.paymentStatus[payKey] || false;

            let bringBack = 0;
            if(st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack += bringBack; }
            if(st.total < 0) { sumAmThucTe += st.total; if(isPaid) sumThucThu += Math.abs(st.total); }

            let noteText = "";
            if(st.total < 0) {
                noteText = isPaid ? `<span class="note-paid"><i class="fa-solid fa-check"></i> Đã nộp</span>` : `<span class="note-unpaid"><i class="fa-solid fa-xmark"></i> Chưa nộp</span>`;
            } else if(st.total > 0) {
                noteText = isPaid ? `<span class="note-paid"><i class="fa-solid fa-check"></i> Đã nhận</span>` : `<span class="note-unpaid"><i class="fa-solid fa-clock"></i> Chưa nhận</span>`;
            }

            const disabledAttr = window.isAdminUnlocked ? '' : 'disabled title="Cần mật khẩu Admin để sửa"';

            summaryRows += `
                <tr class="hover:bg-slate-50 text-center">
                    <td class="p-2 border text-left pl-3"><span class="player-tag">${p.name}</span></td>
                    <td class="p-2 border">${st.played}</td>
                    <td class="p-2 border txt-win">${st.winK > 0 ? '+' + st.winK + 'K' : ''}</td>
                    <td class="p-2 border txt-lose">${st.loseK < 0 ? st.loseK + 'K' : ''}</td>
                    <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? '+' + bringBack + 'K' : ''}</td>
                    <td class="p-2 border font-extrabold ${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}">${st.total !== 0 ? (st.total > 0 ? '+' + st.total + 'K' : st.total + 'K') : '0K'}</td>
                    <td class="p-2 border bg-amber-50/30">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="togglePaymentStatus('${payKey}')" class="w-4 h-4 cursor-pointer accent-emerald-600">
                    </td>
                    <td class="p-2 border">${noteText}</td>
                </tr>
            `;
        }
    });

    let btcThuVe = sumAmThucTe + sumBringBack;
    let quyCon = sumThucThu - Math.abs(btcThuVe);

    const pStatus = window.paymentStatus[closestDate];
    const currentOption = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption) ? pStatus.btcNoteAdminOption : "YES";

    container.innerHTML = `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-5">
            <div>
                <div class="flex flex-wrap justify-between items-center mb-3 pb-2 border-b gap-2">
                    <h4 class="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                        <i class="fa-solid fa-table-list text-blue-600"></i> BẢNG ĐI HÀNH TRẬN PICK NGÀY ${closestDate}
                    </h4>
                    <div class="flex items-center gap-2">
                        <select onchange="applyKeoToAllMatchesForDate('${closestDate}', this.value)" class="text-xs p-1 border rounded bg-white font-bold outline-none border-amber-400 text-slate-800 cursor-pointer">
                            <option value="default" ${(window.dateKeoMode[closestDate]||'default')==='default'?'selected':''}>Kèo (+5k/-15k)</option>
                            <option value="k25" ${(window.dateKeoMode[closestDate]||'default')==='k25'?'selected':''}>Kèo 25k (0k/-25k)</option>
                            <option value="k0" ${(window.dateKeoMode[closestDate]||'default')==='k0'?'selected':''}>Kèo 0K (0k/0k)</option>
                            <option value="free" ${(window.dateKeoMode[closestDate]||'default')==='free'?'selected':''}>Kèo Tự Do</option>
                        </select>
                        <button onclick="addMatchToDate('${closestDate}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded shadow font-bold flex items-center gap-1">
                            <i class="fa-solid fa-plus"></i> Thêm Trận
                        </button>
                    </div>
                </div>

                <div class="smooth-scroll border border-slate-200 rounded-lg bg-white shadow-sm">
                    <table class="w-full text-xs min-w-[780px] border-collapse text-center">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 font-bold">
                                <th class="p-2 border w-10">STT</th>
                                <th class="p-2 border bg-emerald-50 text-emerald-900" colspan="2">CẶP PICK 1</th>
                                <th class="p-2 border bg-purple-100 text-purple-900 w-20">TỶ SỐ</th>
                                <th class="p-2 border bg-red-50 text-red-900" colspan="2">CẶP PICK 2</th>
                                <th class="p-2 border bg-amber-50 text-amber-900 w-28">CHỌN KÈO TRẬN</th>
                                <th class="p-2 border bg-amber-50 text-amber-900" colspan="2">KÈO BAN ĐẦU</th>
                                <th class="p-2 border w-12 bg-slate-200 text-slate-800"><i class="fa-solid fa-gear"></i></th>
                            </tr>
                        </thead>
                        <tbody>${matchesTableRows}</tbody>
                    </table>
                </div>
            </div>

            <div>
                <h4 class="font-bold text-sm text-slate-700 mb-2 flex items-center gap-1.5">
                    <i class="fa-solid fa-calculator text-indigo-600"></i> BẢNG TỔNG HỢP KÈO THƯỞNG PHẠT NGÀY ${closestDate}
                </h4>
                <div class="smooth-scroll border border-slate-200 rounded-lg bg-white shadow-sm">
                    <table class="w-full text-xs min-w-[650px] border-collapse">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 font-bold text-center">
                                <th class="p-2 border w-28 text-left pl-3">PICK THỦ</th>
                                <th class="p-2 border w-16">TRẬN</th>
                                <th class="p-2 border w-20">THẮNG</th>
                                <th class="p-2 border w-20">THUA</th>
                                <th class="p-2 border w-24">MANG VỀ</th>
                                <th class="p-2 border w-20">TỔNG</th>
                                <th class="p-2 border w-20 bg-amber-50 text-amber-900">THỰC TẾ</th>
                                <th class="p-2 border w-28">TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryRows || `<tr><td colspan="8" class="p-4 text-center text-slate-400">Chưa có kết quả tổng hợp.</td></tr>`}
                            <tr class="bg-slate-100 font-extrabold text-center">
                                <td class="p-2 border text-left text-red-600 pl-3">TỔNG BTC THU VỀ</td>
                                <td class="p-2 border" colspan="3"></td>
                                <td class="p-2 border text-blue-700">+${sumBringBack}K</td>
                                <td class="p-2 border text-red-600">${btcThuVe}K</td>
                                <td class="p-2 border text-blue-700">+${sumThucThu}K</td>
                                <td class="p-2 border text-slate-600 whitespace-nowrap">
                                    <select onchange="handleBtcNoteChangeForDate('${closestDate}', this)" class="text-xs font-bold p-1 border rounded bg-white text-emerald-700 outline-none">
                                        <option value="YES" ${currentOption==='YES'?'selected':''}>YES (Chuyển tổng ngày)</option>
                                        <option value="NO" ${currentOption==='NO'?'selected':''}>NO (Không chuyển)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr class="bg-slate-100 font-extrabold text-center">
                                <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn</td>
                                <td class="p-2 border text-red-600 text-sm" colspan="2">${quyCon}K</td>
                                <td class="p-2 border" colspan="2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function addMatchToDate(dateStr) {
    if(!window.matchesData[dateStr]) window.matchesData[dateStr] = [];
    const nextId = window.matchesData[dateStr].length + 1;
    const globalMode = window.dateKeoMode[dateStr] || 'default';
    window.matchesData[dateStr].push({ 
        id: nextId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "",
        keoMode: globalMode, customWin: (globalMode === 'k25' || globalMode === 'k0') ? 0 : 5, customLose: globalMode === 'k25' ? -25 : (globalMode === 'k0' ? 0 : -15)
    });
    refreshAllViews();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function deleteMatchFromDate(dateStr, index) {
    if(confirm(`Bạn có chắc chắn muốn XÓA Trận ${index + 1}?`)) {
        if(window.matchesData[dateStr]) {
            window.matchesData[dateStr].splice(index, 1);
            refreshAllViews();
            autoBackupData();
            if(window.syncToFirebase) window.syncToFirebase();
        }
    }
}

function updateMatchDataForDate(dateStr, index, field, value) {
    if(window.matchesData[dateStr] && window.matchesData[dateStr][index]) {
        window.matchesData[dateStr][index][field] = value;
        refreshAllViews();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function updateMatchKeoModeForDate(dateStr, index, modeVal) {
    if(window.matchesData[dateStr] && window.matchesData[dateStr][index]) {
        const m = window.matchesData[dateStr][index];
        m.keoMode = modeVal;
        if (modeVal === 'default') { m.customWin = 5; m.customLose = -15; }
        else if (modeVal === 'k0') { m.customWin = 0; m.customLose = 0; }
        else if (modeVal === 'k25') { m.customWin = 0; m.customLose = -25; }
        refreshAllViews();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function applyKeoToAllMatchesForDate(dateStr, modeVal) {
    window.dateKeoMode[dateStr] = modeVal;
    const matches = window.matchesData[dateStr] || [];
    matches.forEach(m => {
        m.keoMode = modeVal;
        if (modeVal === 'default') { m.customWin = 5; m.customLose = -15; }
        else if (modeVal === 'k0') { m.customWin = 0; m.customLose = 0; }
        else if (modeVal === 'k25') { m.customWin = 0; m.customLose = -25; }
    });
    refreshAllViews();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function handleBtcNoteChangeForDate(dateStr, selectEl) {
    if (!window.paymentStatus) window.paymentStatus = {};
    if (!window.paymentStatus[dateStr] || typeof window.paymentStatus[dateStr] !== 'object') {
        window.paymentStatus[dateStr] = {};
    }
    window.paymentStatus[dateStr].btcNoteAdminOption = selectEl.value;
    refreshAllViews();
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function goToClosestDateTab() {
    const closestDate = getClosestDateToToday();
    if (closestDate) {
        selectDateView(closestDate);
    }
}

function updateAutoIncomeNote(dateStr, noteVal) {
    requireAdminAuth(() => {
        window.autoIncomeNotes[dateStr] = noteVal;
        localStorage.setItem('pb_auto_income_notes', JSON.stringify(window.autoIncomeNotes));
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    });
}

function getBtcThuVeForDate(dateStr) {
    const matches = window.matchesData[dateStr] || [];
    if (!matches || matches.length === 0) return 0;

    let statsDay = {};
    (window.players || []).forEach(p => { 
        if (p && p.name) statsDay[p.name.trim()] = { played: 0, total: 0 }; 
    });

    matches.forEach(m => {
        const s1 = parseInt(m.score1);
        const s2 = parseInt(m.score2);
        const mMode = m.keoMode || (window.dateKeoMode ? window.dateKeoMode[dateStr] : 'default') || 'default';
        
        let winAmt = 5, loseAmt = -15;
        if (mMode === "k0") { winAmt = 0; loseAmt = 0; }
        else if (mMode === "k25") { winAmt = 0; loseAmt = -25; }
        else if (mMode === "free") {
            winAmt = parseFloat(m.customWin) || 0;
            loseAmt = parseFloat(m.customLose) || 0;
            if (loseAmt > 0) loseAmt = -loseAmt;
        }

        if (!isNaN(s1) && !isNaN(s2)) {
            const pair1 = [m.c1_p1, m.c1_p2].filter(Boolean).map(x => x.trim());
            const pair2 = [m.c2_p1, m.c2_p2].filter(Boolean).map(x => x.trim());
            let isHam = (s1 === 0 || s2 === 0);
            let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
            let effLose = isHam ? loseAmt * 2 : loseAmt;

            if (s1 > s2) {
                pair1.forEach(v => { if (!statsDay[v]) statsDay[v] = { played: 0, total: 0 }; statsDay[v].played++; statsDay[v].total += effWin; });
                pair2.forEach(v => { if (!statsDay[v]) statsDay[v] = { played: 0, total: 0 }; statsDay[v].played++; statsDay[v].total += effLose; });
            } else if (s2 > s1) {
                pair2.forEach(v => { if (!statsDay[v]) statsDay[v] = { played: 0, total: 0 }; statsDay[v].played++; statsDay[v].total += effWin; });
                pair1.forEach(v => { if (!statsDay[v]) statsDay[v] = { played: 0, total: 0 }; statsDay[v].played++; statsDay[v].total += effLose; });
            }
        }
    });

    let sumAmDay = 0, sumBringBackDay = 0;
    Object.keys(statsDay).forEach(pName => {
        let st = statsDay[pName];
        if (st.played > 0) {
            if (st.total < 0) sumAmDay += st.total;
            else if (st.played >= 4 && st.total > 0) sumBringBackDay += st.total;
        }
    });

    return (sumAmDay + sumBringBackDay);
}

function updateInitialFund(val) {
    requireAdminAuth(() => {
        window.initialFund = Number(val) || 0;
        localStorage.setItem('pb_initial_fund', window.initialFund);
        calculateFundSummary();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    });
}

function addNewQuarterColumn() {
    requireAdminAuth(() => {
        const num = window.activeQuarterColumns.length + 1;
        const qId = `q_${Date.now()}`;
        const colors = ["amber", "purple", "blue", "teal", "emerald", "indigo", "rose"];
        const chosenColor = colors[(num - 1) % colors.length];

        const qTitle = prompt(`Nhập tên hiển thị cho Cột Quý Mới (VD: Tiền Sân Quý ${num}):`, `Tiền Sân Quý ${num}`);
        if (!qTitle) return;

        window.activeQuarterColumns.push({
            id: qId,
            title: qTitle.trim(),
            statusTitle: `Trạng Thái Q${num}`,
            defaultAmt: 800000,
            bgColor: chosenColor
        });

        saveQuarterColsConfig();
        renderFundMembers();
    });
}

function deleteQuarterColumn(qId, title) {
    requireAdminAuth(() => {
        if (confirm(`Bạn có chắc chắn muốn XÓA cột "${title}" này khỏi Bảng Quỹ?`)) {
            window.activeQuarterColumns = window.activeQuarterColumns.filter(col => col.id !== qId);
            saveQuarterColsConfig();
            renderFundMembers();
        }
    });
}

function updateDynamicQuarterTitle(qId, field, value) {
    requireAdminAuth(() => {
        const col = window.activeQuarterColumns.find(c => c.id === qId);
        if (col) {
            col[field] = value.trim();
            saveQuarterColsConfig();
        }
    });
}

function saveQuarterColsConfig() {
    localStorage.setItem('pb_active_quarter_cols', JSON.stringify(window.activeQuarterColumns));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function updateQuarterAmountDirect(playerId, qKey, val) {
    requireAdminAuth(() => {
        const numVal = Number(val) || 0;
        window.fundFeeStatus[`${playerId}_${qKey}_amt`] = numVal;
        saveFundData();
    });
}

function updateQuarterStatusDirect(playerId, qKey, val) {
    requireAdminAuth(() => {
        window.fundFeeStatus[`${playerId}_${qKey}_status`] = val;
        saveFundData();
    });
}

function addNewFundPlayerPrompt() {
    requireAdminAuth(() => {
        const name = prompt("Nhập tên Pick thủ mới muốn thêm vào danh sách Quỹ:");
        if (name && name.trim() !== "") {
            const trimmed = name.trim();
            const existing = window.players.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
            if (existing) {
                alert("Pick thủ này đã có trong danh sách!");
            } else {
                const newPlayer = { id: Date.now(), name: trimmed, gender: "Nam" };
                window.players.push(newPlayer);
                savePlayersData();
                refreshAllViews();
            }
        }
    });
}

function deleteFundPlayerRow(playerId) {
    requireAdminAuth(() => {
        const p = window.players.find(item => item.id === playerId);
        if (p && confirm(`Bạn có chắc chắn muốn XÓA Pick thủ "${p.name}" khỏi danh sách?`)) {
            window.players = window.players.filter(item => item.id !== playerId);
            savePlayersData();
            refreshAllViews();
        }
    });
}

function savePlayersData() {
    localStorage.setItem('pb_players_list', JSON.stringify(window.players));
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function saveFundData() {
    localStorage.setItem('pb_fee_status', JSON.stringify(window.fundFeeStatus));
    localStorage.setItem('pb_incomes', JSON.stringify(window.fundIncomes));
    localStorage.setItem('pb_expenses', JSON.stringify(window.fundExpenses));
    localStorage.setItem('pb_auto_income_notes', JSON.stringify(window.autoIncomeNotes));
    updateFundDashboard();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
    if(!dateStr) return '';
    if(dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function getQuarterCollectedTotals() {
    let totals = {};
    (window.activeQuarterColumns || []).forEach(col => {
        let colSum = 0;
        (window.players || []).forEach(p => {
            const qKey = col.id;
            const currentStatus = window.fundFeeStatus[`${p.id}_${qKey}_status`] || (window.fundFeeStatus[`${p.id}_${qKey}`] ? "paid" : "unpaid");
            const currentAmt = window.fundFeeStatus[`${p.id}_${qKey}_amt`] !== undefined ? Number(window.fundFeeStatus[`${p.id}_${qKey}_amt`]) : Number(col.defaultAmt || 0);
            if (currentStatus === "paid") {
                colSum += currentAmt;
            }
        });
        totals[col.id] = colSum;
    });
    return totals;
}

function updateFundDashboard() {
    const inputInit = document.getElementById('input-initial-fund');
    if(inputInit && document.activeElement !== inputInit) {
        inputInit.value = window.initialFund;
    }
    renderFundMembers();
    renderFundIncomes();
    renderFundExpenses();
    calculateFundSummary();
}

function calculateFundSummary() {
    let totalManualIncome = window.fundIncomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const quarterTotals = getQuarterCollectedTotals();
    let totalQuartersIncome = Object.values(quarterTotals).reduce((a, b) => a + Number(b), 0);

    let autoDailyIncomeTotal = 0;
    (window.dates || []).forEach(d => {
        const pStatus = window.paymentStatus ? window.paymentStatus[d] : null;
        let isTransferYes = true;
        if (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "NO") {
            isTransferYes = false;
        }
        
        if (isTransferYes) {
            let dayNetK = getBtcThuVeForDate(d);
            if (dayNetK !== 0) {
                autoDailyIncomeTotal += Math.abs(dayNetK * 1000);
            }
        }
    });

    const grandTotalIncome = totalManualIncome + totalQuartersIncome + autoDailyIncomeTotal;
    const totalExpense = window.fundExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const currentBalance = window.initialFund + grandTotalIncome - totalExpense;

    const elInc = document.getElementById('stat-income');
    const elExp = document.getElementById('stat-expense');
    const elBal = document.getElementById('stat-balance');

    if(elInc) elInc.innerText = formatVND(grandTotalIncome);
    if(elExp) elExp.innerText = formatVND(totalExpense);
    if(elBal) elBal.innerText = formatVND(currentBalance);

    const elIncTot = document.getElementById('income-total');
    const elExpTot = document.getElementById('expense-total');
    if(elIncTot) elIncTot.innerText = formatVND(grandTotalIncome);
    if(elExpTot) elExpTot.innerText = formatVND(totalExpense);
}

function renderFundMembers() {
    const searchEl = document.getElementById('member-search');
    const tbody = document.getElementById('member-list');
    const theadTr = document.getElementById('member-list-thead-tr');
    const tfoot = document.getElementById('member-list-foot');
    if(!tbody || !theadTr) return;

    let headerHtml = `
        <th class="py-3 px-3 w-10 text-center">STT</th>
        <th class="py-3 px-3 min-w-[140px]">Tên Pick Thủ</th>
    `;

    window.activeQuarterColumns.forEach(col => {
        const c = col.bgColor || "teal";
        headerHtml += `
            <th class="py-2 px-2 text-center bg-${c}-50/80 border-x border-${c}-100 min-w-[130px]">
                <div class="flex items-center justify-between gap-1">
                    <input type="text" value="${col.title}" onchange="updateDynamicQuarterTitle('${col.id}', 'title', this.value)" class="w-full text-center bg-transparent border-b border-${c}-300 font-bold text-${c}-900 text-xs focus:bg-white focus:outline-none p-0.5 rounded" title="Sửa tên cột">
                    ${window.activeQuarterColumns.length > 1 ? `<button onclick="deleteQuarterColumn('${col.id}', '${col.title}')" class="text-rose-500 hover:text-rose-700 text-[10px] p-0.5" title="Xóa cột này"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </th>
            <th class="py-2 px-2 text-center bg-${c}-50/50 min-w-[110px]">
                <input type="text" value="${col.statusTitle}" onchange="updateDynamicQuarterTitle('${col.id}', 'statusTitle', this.value)" class="w-full text-center bg-transparent border-b border-${c}-300 font-bold text-${c}-800 text-xs focus:bg-white focus:outline-none p-0.5 rounded" title="Sửa tên Trạng Thái">
            </th>
        `;
    });

    headerHtml += `<th class="py-3 px-3 text-center min-w-[90px]">Thao Tác</th>`;
    theadTr.innerHTML = headerHtml;

    const search = searchEl ? searchEl.value.toLowerCase() : '';
    tbody.innerHTML = '';

    const filtered = window.players.filter(p => p.name.toLowerCase().includes(search));

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${3 + window.activeQuarterColumns.length * 2}" class="text-center py-6 text-slate-400">Không tìm thấy Pick thủ nào.</td></tr>`;
        if(tfoot) tfoot.innerHTML = '';
        return;
    }

    let collectedTotalsAll = getQuarterCollectedTotals();

    filtered.forEach((p, idx) => {
        let rowHtml = `
            <td class="py-3 px-3 text-center font-medium text-slate-500">${idx + 1}</td>
            <td class="py-3 px-3"><span class="player-tag">${p.name}</span></td>
        `;

        window.activeQuarterColumns.forEach(col => {
            const qKey = col.id;
            const c = col.bgColor || "teal";
            const currentStatus = window.fundFeeStatus[`${p.id}_${qKey}_status`] || (window.fundFeeStatus[`${p.id}_${qKey}`] ? "paid" : "unpaid");
            const currentAmt = window.fundFeeStatus[`${p.id}_${qKey}_amt`] !== undefined ? window.fundFeeStatus[`${p.id}_${qKey}_amt`] : col.defaultAmt;

            rowHtml += `
                <td class="py-2 px-2 text-center bg-${c}-50/20">
                    <input type="number" step="10000" value="${currentAmt}" onchange="updateQuarterAmountDirect(${p.id}, '${qKey}', this.value)" class="w-24 text-center font-bold text-${c}-900 border rounded px-1 py-0.5 bg-white focus:ring-1 focus:ring-${c}-500 outline-none text-xs">
                </td>
                <td class="py-2 px-2 text-center bg-${c}-50/20">
                    <select onchange="updateQuarterStatusDirect(${p.id}, '${qKey}', this.value)" class="text-xs font-bold p-1 rounded-full border outline-none cursor-pointer ${
                        currentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        currentStatus === 'unpaid' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        currentStatus === 'pause' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-slate-200 text-slate-700 border-slate-300'
                    }">
                        <option value="no" ${currentStatus === 'no' ? 'selected' : ''}>NO (Chưa đến)</option>
                        <option value="unpaid" ${currentStatus === 'unpaid' ? 'selected' : ''}>Chưa đóng</option>
                        <option value="paid" ${currentStatus === 'paid' ? 'selected' : ''}>Đã đóng</option>
                        <option value="pause" ${currentStatus === 'pause' ? 'selected' : ''}>Tạm nghỉ</option>
                    </select>
                </td>
            `;
        });

        rowHtml += `
            <td class="py-3 px-3 text-center">
                <button onclick="deleteFundPlayerRow(${p.id})" class="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 border border-red-200 px-2 py-1 rounded-lg shadow-sm hover:bg-red-100 transition-colors flex items-center gap-1 mx-auto" title="Xóa Pick thủ này khỏi Quỹ">
                    <i class="fa-solid fa-trash-can"></i>
                    <span>Xóa</span>
                </button>
            </td>
        `;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    let grandTotalCollected = Object.values(collectedTotalsAll).reduce((a, b) => a + Number(b), 0);
    const totalExpense = window.fundExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const netCourt = grandTotalCollected - totalExpense;

    if(tfoot) {
        let footQuarterCells = window.activeQuarterColumns.map(col => {
            const c = col.bgColor || "teal";
            return `<td class="py-2.5 px-3 text-center text-${c}-800 font-extrabold" colspan="2">${col.title}:${formatVND(collectedTotalsAll[col.id] || 0)}</td>`;
        }).join('');

        const colSpanCount = 1 + window.activeQuarterColumns.length * 2;

        tfoot.innerHTML = `
            <tr class="bg-emerald-50/80 text-emerald-900">
                <td class="py-2.5 px-3 text-center font-bold" colspan="2">TỔNG THU CÁC QUÝ:</td>
                ${footQuarterCells}
                <td class="py-2.5 px-3 text-center text-emerald-700 font-black">${formatVND(grandTotalCollected)}</td>
            </tr>
            <tr class="bg-rose-50/80 text-rose-900">
                <td class="py-2.5 px-3 text-center font-bold" colspan="2">DÒNG CHI QUỸ:</td>
                <td class="py-2.5 px-3 text-right font-extrabold" colspan="${colSpanCount - 1}">Tổng Các Khoản Chi Tiền Sân & Sinh Hoạt:</td>
                <td class="py-2.5 px-3 text-center text-rose-600 font-black">-${formatVND(totalExpense)}</td>
            </tr>
            <tr class="bg-slate-200/80 text-slate-900">
                <td class="py-3 px-3 text-center font-black" colspan="2">THU - CHI CÒN LẠI:</td>
                <td class="py-3 px-3 text-center font-black text-base ${netCourt >= 0 ? 'text-emerald-700' : 'text-rose-700'}" colspan="${colSpanCount}">
                    ${formatVND(netCourt)}
                </td>
            </tr>
        `;
    }
}

function renderFundIncomes() {
    const tbody = document.getElementById('income-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    const quarterTotals = getQuarterCollectedTotals();
    (window.activeQuarterColumns || []).forEach(col => {
        const totalAmt = quarterTotals[col.id] || 0;
        const trQ = document.createElement('tr');
        trQ.className = "bg-teal-50/80 font-semibold text-xs border-b border-teal-200/80 hover:bg-teal-100/80 transition-colors";
        trQ.innerHTML = `
            <td class="py-2.5 px-3 text-slate-500 whitespace-nowrap">Theo Quý</td>
            <td class="py-2.5 px-3 text-teal-950 font-bold wrap-content-cell min-w-[220px]">
                <div class="flex items-center gap-1.5">
                    <i class="fa-solid fa-vault text-teal-600 flex-shrink-0"></i>
                    <span>${col.title} (Tự động tính từ Bảng Các Quý)</span>
                </div>
            </td>
            <td class="py-2.5 px-3 text-right font-black text-teal-700 whitespace-nowrap">+${formatVND(totalAmt)}</td>
            <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap"><span class="player-tag">Pick Thủ CLB</span></td>
            <td class="py-2.5 px-3 text-slate-500 italic min-w-[200px]">Tự động tổng hợp số tiền các Pick thủ đã đóng</td>
            <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <button onclick="alert('Dòng này tự động tổng hợp từ Bảng Tiền Sân Các Quý ở bên dưới.')" class="text-blue-600 hover:text-blue-800 p-1 transition-colors">
                    <i class="fa-solid fa-circle-info"></i>
                </button>
            </td>
        `;
        tbody.appendChild(trQ);
    });

    (window.dates || []).forEach(d => {
        const pStatus = window.paymentStatus ? window.paymentStatus[d] : null;
        let isTransferYes = true;
        
        if (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "NO") {
            isTransferYes = false;
        }

        if (isTransferYes) {
            let dayNetK = getBtcThuVeForDate(d);
            if (dayNetK !== 0) {
                const positiveAmount = Math.abs(dayNetK) * 1000;
                const currentCustomNote = window.autoIncomeNotes[d] !== undefined ? window.autoIncomeNotes[d] : "Đồng bộ tự động từ trận đấu";

                const trAuto = document.createElement('tr');
                trAuto.className = "bg-emerald-50/80 font-semibold text-xs border-b border-emerald-200/80 hover:bg-emerald-100/80 transition-colors";
                trAuto.innerHTML = `
                    <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">${d}</td>
                    <td class="py-2.5 px-3 text-emerald-950 font-bold wrap-content-cell min-w-[220px]">
                        <div class="flex items-center gap-1.5">
                            <i class="fa-solid fa-coins text-amber-500 flex-shrink-0"></i>
                            <span>Thu tiền kèo Ngày ${d}</span>
                        </div>
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-emerald-700 whitespace-nowrap">+${formatVND(positiveAmount)}</td>
                    <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap"><span class="player-tag">BTC CLB</span></td>
                    <td class="py-2.5 px-3 min-w-[200px]">
                        <textarea onchange="updateAutoIncomeNote('${d}', this.value)" rows="1" class="w-full bg-white border border-emerald-300 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm" placeholder="Nhập ghi chú chi tiết...">${currentCustomNote}</textarea>
                    </td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                        <button onclick="alert('Dòng này tự động cập nhật số tiền từ Bảng Chi Tiết Ngày ${d}.')" class="text-blue-600 hover:text-blue-800 mr-2 p-1 transition-colors">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button onclick="requireAdminAuth(() => { if(confirm('Để ẩn khoản thu tự động Ngày ${d}, bạn có muốn đổi trạng thái NOTE của ngày này thành NO?')) { if(!window.paymentStatus['${d}']) window.paymentStatus['${d}'] = {}; window.paymentStatus['${d}'].btc
