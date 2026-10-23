// ==========================================
// CẤU HÌNH & KHỞI TẠO CLOUD FIRESTORE SYNC
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDYCKzobz_fr-1BcHt3TxmOuX1nHCOQFMs",
    authDomain: "minigame-bb991.firebaseapp.com",
    projectId: "minigame-bb991",
    storageBucket: "minigame-bb991.firebasestorage.app",
    messagingSenderId: "115186520233",
    appId: "1:115186520233:web:5cfcd1337f1a6ddb9599b8",
    measurementId: "G-E9VTC723SF"
};

// Khởi tạo Firebase nếu chưa có
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// Hàm tự động đẩy dữ liệu lên Cloud
window.syncToFirebase = function() {
    if (!db) return;
    const payload = {
        players: window.players,
        minigameTeamData: window.minigameTeamData,
        matchesData: window.matchesData,
        dates: window.dates,
        dateKeoMode: window.dateKeoMode,
        paymentStatus: window.paymentStatus,
        dayAbsentData: window.dayAbsentData,
        fundIncomes: window.fundIncomes,
        fundExpenses: window.fundExpenses,
        fundFeeStatus: window.fundFeeStatus,
        activeQuarterColumns: window.activeQuarterColumns,
        initialFund: window.initialFund,
        updatedAt: new Date().toISOString()
    };

    db.collection("club_data").doc("main_config").set(payload, { merge: true })
        .then(() => {
            console.log("☁️ Đồng bộ Cloud Firestore thành công!");
        })
        .catch((error) => {
            console.error("❌ Lỗi đồng bộ Firebase: ", error);
        });
};

// Hàm tải dữ liệu từ Cloud khi khởi động ứng dụng trên thiết bị mới (điện thoại)
function loadDataFromFirebase(callback) {
    if (!db) {
        if (typeof callback === 'function') callback();
        return;
    }
    db.collection("club_data").doc("main_config").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.players) { window.players = data.players; localStorage.setItem('pb_players_list', JSON.stringify(data.players)); }
            if (data.matchesData) window.matchesData = data.matchesData;
            if (data.dates) window.dates = data.dates;
            if (data.dateKeoMode) window.dateKeoMode = data.dateKeoMode;
            if (data.paymentStatus) window.paymentStatus = data.paymentStatus;
            if (data.dayAbsentData) { window.dayAbsentData = data.dayAbsentData; localStorage.setItem('pb_day_absent_data', JSON.stringify(data.dayAbsentData)); }
            if (data.fundIncomes) { window.fundIncomes = data.fundIncomes; localStorage.setItem('pb_incomes', JSON.stringify(data.fundIncomes)); }
            if (data.fundExpenses) { window.fundExpenses = data.fundExpenses; localStorage.setItem('pb_expenses', JSON.stringify(data.fundExpenses)); }
            if (data.fundFeeStatus) { window.fundFeeStatus = data.fundFeeStatus; localStorage.setItem('pb_fee_status', JSON.stringify(data.fundFeeStatus)); }
            if (data.activeQuarterColumns) { window.activeQuarterColumns = data.activeQuarterColumns; localStorage.setItem('pb_active_quarter_cols', JSON.stringify(data.activeQuarterColumns)); }
            if (data.initialFund !== undefined) { window.initialFund = data.initialFund; localStorage.setItem('pb_initial_fund', data.initialFund); }
            
            console.log("📥 Đã tải và đồng bộ dữ liệu mới nhất từ Cloud Firestore xuống thiết bị.");
        }
        if (typeof callback === 'function') callback();
    }).catch((error) => {
        console.warn("⚠️ Không thể kết nối Cloud, sử dụng dữ liệu LocalStorage:", error);
        if (typeof callback === 'function') callback();
    });
}

/**
 * js/main.js - CLB PICKLEBALL CMTD
 * Quản lý giải đấu, lịch thi đấu, bảng xếp hạng, quỹ và sao lưu dữ liệu.
 */
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
    { id: 1, name: "Tiến Thọ", gender: "Nam" }, { id: 2, name: "Châu Sĩ", gender: "Nam" },
    { id: 3, name: "Vân Đình", gender: "Nữ" }, { id: 4, name: "Ly", gender: "Nữ" },
    { id: 5, name: "Phú Mỗ", gender: "Nam" }, { id: 6, name: "Hà Giấy", gender: "Nam" },
    { id: 7, name: "Long Diễm", gender: "Nam" }, { id: 8, name: "Tuấn La", gender: "Nam" },
    { id: 9, name: "Trí Đô", gender: "Nam" }, { id: 10, name: "Thành Sóc", gender: "Nam" },
    { id: 11, name: "Quỳnh Cool", gender: "Nữ" }, { id: 12, name: "Hải Hà", gender: "Nữ" },
    { id: 13, name: "Dũng Ngạc", gender: "Nam" }, { id: 14, name: "Lợi Trì", gender: "Nam" },
    { id: 15, name: "Thành Đàm", gender: "Nam" }, { id: 16, name: "Điền Chèm", gender: "Nam" },
    { id: 17, name: "Hạnh", gender: "Nữ" }, { id: 18, name: "Minh Vương", gender: "Nam" }
];

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

// Quản lý trạng thái nghỉ (absent) cho từng ngày
window.dayAbsentData = JSON.parse(localStorage.getItem('pb_day_absent_data')) || {};

window.activeQuarterColumns = JSON.parse(localStorage.getItem('pb_active_quarter_cols')) || [
    { id: "q1", title: "Tiền Sân Quý 1", statusTitle: "Trạng Thái Q1", defaultAmt: 800000, bgColor: "teal" }
];
window.initialFund = Number(localStorage.getItem('pb_initial_fund')) || 500000;
const defaultFundIncomes = [{ id: 1, date: "2026-01-05", desc: "Thu tiền ủng hộ giao lưu", amount: 500000, source: "Khách vãng lai / Khác", note: "Chuyển khoản tài trợ" }];
const defaultFundExpenses = [{ id: 1, date: "2026-01-02", desc: "Thanh toán tiền thuê sân Tháng 1", amount: 1200000, source: "Khách vãng lai / Khác", note: "Hóa đơn thanh toán tiền sân định kỳ" }];
window.fundFeeStatus = JSON.parse(localStorage.getItem('pb_fee_status')) || {};
window.fundIncomes = JSON.parse(localStorage.getItem('pb_incomes')) || defaultFundIncomes;
window.fundExpenses = JSON.parse(localStorage.getItem('pb_expenses')) || defaultFundExpenses;
window.autoIncomeNotes = JSON.parse(localStorage.getItem('pb_auto_income_notes')) || {};

// ==========================================
// CÁC HÀM XỬ LÝ PICK THỦ NGHỈ & CỘT XIN NGHỈ
// ==========================================
function renderAbsentPlayersDropdown(currentDateData) {
    const selectEl = document.getElementById('absent-players-select');
    if (!selectEl) return;

    const players = window.players || [];
    const absentList = currentDateData?.absentPlayers || [];

    selectEl.innerHTML = players.map(player => {
        const playerName = typeof player === 'object' ? player.name : player;
        const isSelected = absentList.includes(playerName) ? 'selected' : '';
        return `<option value="${playerName}" ${isSelected}>${playerName}</option>`;
    }).join('');
}

function handleAbsentPlayersChange(selectElement) {
    // Lấy toàn bộ các pick thủ được chọn từ thẻ select multiple
    const selectedOptions = Array.from(selectElement.selectedOptions).map(opt => opt.value);
    const dateStr = window.currentSelectedDate;
    
    if (!window.dayAbsentData[dateStr]) window.dayAbsentData[dateStr] = { absentPlayers: [], absentStatusMap: {} };
    window.dayAbsentData[dateStr].absentPlayers = selectedOptions;
    
    if (!window.dayAbsentData[dateStr].absentStatusMap) {
        window.dayAbsentData[dateStr].absentStatusMap = {};
    }
    
    // Gán trạng thái mặc định (Không phép -30k) cho những ai vừa được chọn nghỉ nếu chưa có trạng thái
    selectedOptions.forEach(name => {
        if (!window.dayAbsentData[dateStr].absentStatusMap[name]) {
            window.dayAbsentData[dateStr].absentStatusMap[name] = 'unexcused'; 
        }
    });

    localStorage.setItem('pb_day_absent_data', JSON.stringify(window.dayAbsentData));
    if (typeof window.syncToFirebase === 'function') window.syncToFirebase();
    renderDayDetailView();
}

function handleIndividualAbsentStatusChange(playerName, statusValue) {
    const dateStr = window.currentSelectedDate;
    if (!window.dayAbsentData[dateStr]) window.dayAbsentData[dateStr] = { absentPlayers: [], absentStatusMap: {} };
    window.dayAbsentData[dateStr].absentStatusMap[playerName] = statusValue;

    localStorage.setItem('pb_day_absent_data', JSON.stringify(window.dayAbsentData));
    if (typeof window.syncToFirebase === 'function') window.syncToFirebase();
    renderDayDetailView();
}

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

function renderHomeClosestDateView() {}

function selectDateView(dateStr) {
    window.currentSelectedDate = dateStr;
    showTab('day_detail');
    renderDayDetailView();
}

function addDateTab() {
    closeAllDropdowns();
    const dateStr = prompt("Nhập ngày đấu mới (VD: 2/10/26):");
    if (dateStr && !window.dates.includes(dateStr)) {
        window.dates.push(dateStr);
        window.matchesData[dateStr] = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", keoMode: "default", customWin: 5, customLose: -15
        }));
        window.dateKeoMode[dateStr] = "default";
        selectDateView(dateStr);
        updateFundDashboard();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function refreshAllViews() {
    if(typeof renderDayDetailView === 'function') renderDayDetailView();
    if(typeof renderTongHopTab === 'function') renderTongHopTab();
}

function autoBackupData() {}

// ==========================================
// HÀM CHÍNH: RENDER CHI TIẾT NGÀY & TỔNG HỢP THU CHI (CÓ CỘT XIN NGHỈ)
// ==========================================
function renderDayDetailView() {
    const dateStr = window.currentSelectedDate;
    const titleEl = document.getElementById('current-date-title');
    if(titleEl) titleEl.innerText = dateStr; 

    // Khởi tạo và render dropdown danh sách chọn nhiều pick thủ nghỉ
    if (!window.dayAbsentData[dateStr]) window.dayAbsentData[dateStr] = { absentPlayers: [], absentStatusMap: {} };
    renderAbsentPlayersDropdown(window.dayAbsentData[dateStr]);

    const modeSelect = document.getElementById('keo-mode-select');
    if(modeSelect) modeSelect.value = window.dateKeoMode[dateStr] || 'default'; 

    const matches = window.matchesData[dateStr] || []; 
    const tbody = document.getElementById('day-matches-body'); 
    if(!tbody) return; 
    tbody.innerHTML = ''; 

    let stats = {}; 
    window.players.forEach(p => { 
        stats[p.name] = { played: 0, winK: 0, loseK: 0, total: 0 }; 
    }); 

    matches.forEach((m, idx) => {
        const val1 = (m.score1 || "").toString().trim(); 
        const val2 = (m.score2 || "").toString().trim(); 
        const s1 = parseInt(val1); 
        const s2 = parseInt(val2); 
        let keo1 = "", keo2 = ""; 
        const mMode = m.keoMode || window.dateKeoMode[dateStr] || 'default'; 
        let winAmt = 5, loseAmt = -15; 
        
        if (mMode === 'k0') { 
            winAmt = 0; loseAmt = 0; 
        } else if (mMode === 'k25') { 
            winAmt = 0; loseAmt = -25; 
        } else if (mMode === 'free') {
            winAmt = parseFloat(m.customWin) || 0; 
            loseAmt = parseFloat(m.customLose) || 0; 
            if (loseAmt > 0) loseAmt = -loseAmt; 
        } 

        if(!isNaN(s1) && !isNaN(s2)) {
            let isHam = (s1 === 0 || s2 === 0); 
            let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt; 
            let effLose = isHam ? loseAmt * 2 : loseAmt; 
            
            if(s1 > s2) { 
                keo1 = effWin; keo2 = effLose; 
            } else if(s2 > s1) { 
                keo1 = effLose; keo2 = effWin; 
            } else { 
                keo1 = 0; keo2 = 0; 
            } 

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

        const buildPlayerSelect = (val, field) => {
            let opts = `<option value="">-- Chọn Pick --</option>`; 
            window.players.forEach(p => {
                opts += `<option value="${p.name}" ${p.name === val ? 'selected' : ''}>${p.name}</option>`; 
            }); 
            return `<select onchange="updateMatchDataForDate('${dateStr}', ${idx}, '${field}', this.value)" class="player-select-btn text-[11px] border rounded p-1 outline-none w-full bg-white shadow-sm">${opts}</select>`; 
        }; 

        const isHam1 = (val1 === "0" || s1 === 0); 
        const isHam2 = (val2 === "0" || s2 === 0); 
        const score1Inner = isHam1 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMatchDataForDate('${dateStr}', ${idx}, 'score1', this.value)">`; 
        const score2Inner = isHam2 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMatchDataForDate('${dateStr}', ${idx}, 'score2', this.value)">`; 
        
        let keoCellUI = ` 
            <select onchange="updateMatchKeoModeForDate('${dateStr}', ${idx}, this.value)" class="text-[10px] sm:text-[11px] font-bold p-0.5 border rounded bg-amber-50 outline-none w-full text-amber-900 border-amber-300"> 
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
                    <input type="number" class="keo-custom-input text-emerald-700" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMatchDataForDate('${dateStr}', ${idx}, 'customWin', this.value)" title="Tiền thắng"> 
                    <span class="text-[10px] text-red-600 font-bold">/</span> 
                    <input type="number" class="keo-custom-input text-red-600" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMatchDataForDate('${dateStr}', ${idx}, 'customLose', this.value)" title="Tiền thua"> 
                </div> 
            `; 
        } 

        tbody.innerHTML += ` 
            <tr class="hover:bg-slate-50"> 
                <td class="font-bold text-slate-700 whitespace-nowrap px-1">Trận ${idx+1}</td> 
                <td class="p-1">${buildPlayerSelect(m.c1_p1, 'c1_p1')}</td> 
                <td class="p-1">${buildPlayerSelect(m.c1_p2, 'c1_p2')}</td> 
                <td class="p-1 bg-purple-50/40 border-x border-purple-200"> 
                    <div class="flex items-center justify-center gap-0.5"> 
                        <div onclick="if(${isHam1}) updateMatchDataForDate('${dateStr}', ${idx}, 'score1', '')">${score1Inner}</div> 
                        <span class="font-black text-slate-400 px-0.5">-</span> 
                        <div onclick="if(${isHam2}) updateMatchDataForDate('${dateStr}', ${idx}, 'score2', '')">${score2Inner}</div> 
                    </div> 
                </td> 
                <td class="p-1">${buildPlayerSelect(m.c2_p1, 'c2_p1')}</td> 
                <td class="p-1">${buildPlayerSelect(m.c2_p2, 'c2_p2')}</td> 
                <td class="p-1 bg-amber-50/50">${keoCellUI}</td> 
                <td class="p-1 font-extrabold ${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td> 
                <td class="p-1 font-extrabold ${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td> 
                <td class="p-1 text-center whitespace-nowrap"> 
                    <button onclick="deleteMatchFromDate('${dateStr}', ${idx})" class="text-slate-400 hover:text-red-600 font-bold p-1 transition-colors" title="Xóa trận đấu"> 
                        <i class="fa-solid fa-trash-can text-sm"></i> 
                    </button> 
                </td> 
            </tr> 
        `; 
    }); 

    const sumBody = document.getElementById('day-summary-body'); 
    if(!sumBody) return; 
    sumBody.innerHTML = ''; 

    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0; 
    const absentList = window.dayAbsentData[dateStr]?.absentPlayers || [];
    const absentMap = window.dayAbsentData[dateStr]?.absentStatusMap || {};

    window.players.forEach(p => { 
        const st = stats[p.name]; 
        const isAbsent = absentList.includes(p.name);
        const currentAbsentStatus = absentMap[p.name] || 'unexcused';

        let absentFine = 0;
        if (isAbsent) {
            absentFine = currentAbsentStatus === 'excused' ? 0 : -30; // Có phép: 0k, Không phép: -30k
        }

        const totalWithAbsent = st.total + absentFine;

        // Hiển thị pick thủ trên bảng tổng hợp nếu họ có đánh trận nào HOẶC được chọn là đang nghỉ trong ngày
        if(st.played > 0 || isAbsent) { 
            const payKey = `${dateStr}_${p.name}`; 
            const isPaid = window.paymentStatus[payKey] || false; 
            let bringBack = 0; 
            
            if(st.played >= 4 && st.total > 0) { 
                bringBack = st.total; 
                sumBringBack += bringBack; 
            } 
            if(totalWithAbsent < 0) { 
                sumAmThucTe += totalWithAbsent; 
                if(isPaid) sumThucThu += Math.abs(totalWithAbsent); 
            } 

            let noteText = ""; 
            if(totalWithAbsent < 0) {
                noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`; 
            } else if(totalWithAbsent > 0) {
                noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`; 
            } 

            const disabledAttr = window.isAdminUnlocked ? '' : 'disabled title="Cần mật khẩu Admin để sửa"'; 
            
            sumBody.innerHTML += ` 
                <tr class="hover:bg-slate-50"> 
                    <td class="p-2 border text-left whitespace-nowrap pl-3"><span class="player-tag">${p.name}</span></td> 
                    <td class="p-2 border">${st.played}</td> 
                    <td class="p-2 border txt-win">${st.winK > 0 ? st.winK : ''}</td> 
                    <td class="p-2 border txt-lose">${st.loseK < 0 ? st.loseK : ''}</td> 
                    <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? bringBack : ''}</td> 
                    <td class="p-2 border font-extrabold ${totalWithAbsent < 0 ? 'txt-lose' : (totalWithAbsent > 0 ? 'txt-win' : '')}">${totalWithAbsent}</td> 
                    
                    <!-- Cột XIN NGHỈ nằm giữa TỔNG và THỰC TẾ -->
                    <td class="p-2 border bg-rose-50/50">
                        ${isAbsent ? `
                            <select onchange="handleIndividualAbsentStatusChange('${p.name}', this.value)" class="text-[11px] p-1 border rounded bg-white font-bold outline-none border-rose-300 text-rose-800 cursor-pointer w-full">
                                <option value="excused" ${currentAbsentStatus === 'excused' ? 'selected' : ''}>Có phép (0k)</option>
                                <option value="unexcused" ${currentAbsentStatus === 'unexcused' ? 'selected' : ''}>Không phép (-30k)</option>
                            </select>
                        ` : `<span class="text-slate-400 italic text-[11px]">Đang đánh</span>`}
                    </td>

                    <td class="p-2 border bg-amber-50/30"> 
                        <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="togglePaymentStatus('${payKey}')" class="w-4 h-4 cursor-pointer accent-emerald-600"> 
                    </td> 
                    <td class="p-2 border whitespace-nowrap">${noteText}</td> 
                </tr> 
            `; 
        } 
    }); 

    let btcThuVe = sumAmThucTe + sumBringBack; 
    let quyCon = sumThucThu - Math.abs(btcThuVe); 
    const pStatus = window.paymentStatus[dateStr]; 
    const currentOption = (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption) ? pStatus.btcNoteAdminOption : "YES"; 

    sumBody.innerHTML += ` 
        <tr class="bg-slate-100 font-extrabold"> 
            <td class="p-2 border text-left text-red-600 whitespace-nowrap pl-3" colspan="5">TỔNG BTC THU VỀ</td> 
            <td class="p-2 border text-red-600">${btcThuVe}</td> 
            <td class="p-2 border" colspan="3">
                <select onchange="handleBtcNoteChangeForDate('${dateStr}', this)" class="text-xs font-bold p-1 border rounded bg-white text-emerald-700 outline-none w-full"> 
                    <option value="YES" ${currentOption==='YES'?'selected':''}>YES (Chuyển tổng ngày)</option> 
                    <option value="NO" ${currentOption==='NO'?'selected':''}>NO (Không chuyển)</option> 
                </select>
            </td> 
        </tr> 
        <tr class="bg-slate-100 font-extrabold"> 
            <td class="p-2 border text-left text-red-600 pl-3" colspan="5">Quỹ Còn</td> 
            <td class="p-2 border text-red-600 text-sm" colspan="4">${quyCon}</td> 
        </tr> 
    `; 
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

function applyKeoToAllMatchesInDate(modeVal) {
    const dateStr = window.currentSelectedDate;
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

function addMatchToCurrentDate() {
    const dateStr = window.currentSelectedDate;
    if(!window.matchesData[dateStr]) window.matchesData[dateStr] = [];
    const nextId = window.matchesData[dateStr].length + 1;
    const globalMode = window.dateKeoMode[dateStr] || 'default';
    window.matchesData[dateStr].push({
        id: nextId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "", keoMode: globalMode,
        customWin: (globalMode === 'k25' || globalMode === 'k0') ? 0 : 5,
        customLose: globalMode === 'k25' ? -25 : (globalMode === 'k0' ? 0 : -15)
    });
    refreshAllViews();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function togglePaymentStatus(payKey) {
    if (!window.isAdminUnlocked) {
        alert("🔒 Bạn cần nhập Pass Admin ở phía trên!");
        return;
    }
    window.paymentStatus[payKey] = !window.paymentStatus[payKey];
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

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromFirebase(() => {
        refreshAllViews();
        renderDynamicMinigameDropdowns();
    });
});
