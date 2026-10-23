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

window.ABSENT_FINE_K = 30; // Mức phạt VĐV xin nghỉ KHÔNG PHÉP (đơn vị K)

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
        container.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">Chưa có ngày nào được tạo trong hệ thống.</div>`;
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

        const score1Inner = isHam1 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score1 || ''}" onchange="updateMatchDataForDate('${closestDate}', ${idx}, 'score1', this.value)">`;
        const score2Inner = isHam2 ? `<span class="ham-text">HẦM</span>` : `<input type="text" class="score-input" value="${m.score2 || ''}" onchange="updateMatchDataForDate('${closestDate}', ${idx}, 'score2', this.value)">`;

        let keoCellUI = `
            <select onchange="updateMatchKeoModeForDate('${closestDate}', ${idx}, this.value)" class="text-[10px] sm:text-[11px] font-bold p-0.5 border rounded bg-amber-50 outline-none w-full text-amber-900 border-amber-300">
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
                    <input type="number" class="keo-custom-input text-emerald-700" value="${m.customWin !== undefined ? m.customWin : 5}" onchange="updateMatchDataForDate('${closestDate}', ${idx}, 'customWin', this.value)" title="Tiền thắng">
                    <span class="text-[10px] text-red-600 font-bold">/</span>
                    <input type="number" class="keo-custom-input text-red-600" value="${m.customLose !== undefined ? m.customLose : -15}" onchange="updateMatchDataForDate('${closestDate}', ${idx}, 'customLose', this.value)" title="Tiền thua">
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
                    <button onclick="deleteMatchFromDate('${closestDate}', ${idx})" class="text-slate-400 hover:text-red-600 font-bold p-1 transition-colors" title="Xóa trận đấu">
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
    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0, sumFine = 0;
    const fineMap = getAbsentFineMap(closestDate);

    window.players.forEach(p => {
        const st = stats[p.name];
        const isAbsent = Object.prototype.hasOwnProperty.call(fineMap, p.name);
        if(st.played > 0 || isAbsent) {
            const payKey = `${closestDate}_${p.name}`;
            const isPaid = window.paymentStatus[payKey] || false;

            const fine = isAbsent ? fineMap[p.name] : 0;
            const netTotal = st.total + fine;
            sumFine += fine;

            let bringBack = 0;
            if(st.played >= 4 && netTotal > 0) { bringBack = netTotal; sumBringBack += bringBack; }
            if(netTotal < 0) { sumAmThucTe += netTotal; if(isPaid) sumThucThu += Math.abs(netTotal); }

            let noteText = "";
            if(netTotal < 0) {
                noteText = isPaid ? `<span class="note-paid"><i class="fa-solid fa-check"></i> Đã nộp</span>` : `<span class="note-unpaid"><i class="fa-solid fa-xmark"></i> Chưa nộp</span>`;
            } else if(netTotal > 0) {
                noteText = isPaid ? `<span class="note-paid"><i class="fa-solid fa-check"></i> Đã nhận</span>` : `<span class="note-unpaid"><i class="fa-solid fa-clock"></i> Chưa nhận</span>`;
            } else if(isAbsent) {
                noteText = `<span class="text-slate-500 font-bold"><i class="fa-solid fa-user-clock"></i> Nghỉ - không phạt</span>`;
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
                    ${buildAbsentFineCell(closestDate, p.name, isAbsent, fine, true)}
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
                        <i class="fa-solid fa-table-list text-blue-600"></i> KÈO ÁP DỤNG CHO NGÀY ${closestDate}
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
                    <i class="fa-solid fa-calculator text-indigo-600"></i> BẢNG TỔNG HỢP KÈO NGÀY ${closestDate}
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
                                <th class="p-2 border w-28 bg-rose-50 text-rose-800" data-col="absent">XIN NGHỈ</th>
                                <th class="p-2 border w-20 bg-amber-50 text-amber-900">THỰC TẾ</th>
                                <th class="p-2 border w-28">TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryRows || `<tr><td colspan="9" class="p-4 text-center text-slate-400">Chưa có kết quả tổng hợp.</td></tr>`}
                            ${buildAbsentSelectorRow(closestDate, 9)}
                            <tr class="bg-slate-100 font-extrabold text-center">
                                <td class="p-2 border text-left text-red-600 pl-3">TỔNG BTC THU VỀ</td>
                                <td class="p-2 border" colspan="3"></td>
                                <td class="p-2 border text-blue-700">+${sumBringBack}K</td>
                                <td class="p-2 border text-red-600" title="Đã gồm tiền phạt nghỉ">${btcThuVe}K</td>
                                <td class="p-2 border ${sumFine < 0 ? 'txt-lose' : 'text-slate-500'}">${sumFine < 0 ? sumFine + 'K' : '0K'}</td>
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
                                <td class="p-2 border" colspan="3"></td>
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
    const fineMapBtc = getAbsentFineMap(dateStr);
    if ((!matches || matches.length === 0) && Object.keys(fineMapBtc).length === 0) return 0;

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

    // Cộng tiền phạt VĐV xin nghỉ (không phép) vào tổng của VĐV đó
    Object.keys(fineMapBtc).forEach(pName => {
        const key = pName.trim();
        if (!statsDay[key]) statsDay[key] = { played: 0, total: 0 };
        statsDay[key].total += fineMapBtc[pName];
        statsDay[key].absent = true;
    });

    let sumAmDay = 0, sumBringBackDay = 0;
    Object.keys(statsDay).forEach(pName => {
        let st = statsDay[pName];
        if (st.played > 0 || st.absent) {
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
            return `<td class="py-2.5 px-3 text-center text-${c}-800 font-extrabold" colspan="2">${col.title}: ${formatVND(collectedTotalsAll[col.id] || 0)}</td>`;
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
                        <button onclick="requireAdminAuth(() => { if(confirm('Để ẩn khoản thu tự động Ngày ${d}, bạn có muốn đổi trạng thái NOTE của ngày này thành NO?')) { if(!window.paymentStatus['${d}']) window.paymentStatus['${d}'] = {}; window.paymentStatus['${d}'].btcNoteAdminOption = 'NO'; refreshAllViews(); autoBackupData(); if(window.syncToFirebase) window.syncToFirebase(); } })" class="text-slate-400 hover:text-rose-500 p-1 transition-colors">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(trAuto);
            }
        }
    });

    (window.fundIncomes || []).forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">${formatDate(item.date)}</td>
            <td class="py-2.5 px-3 font-medium text-slate-800 wrap-content-cell min-w-[220px]">${item.desc}</td>
            <td class="py-2.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">+${formatVND(item.amount)}</td>
            <td class="py-2.5 px-3 text-xs whitespace-nowrap"><span class="player-tag">${item.source}</span></td>
            <td class="py-2.5 px-3 text-xs text-slate-600 wrap-content-cell min-w-[200px]">${item.note || '---'}</td>
            <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <button onclick="openEditFundModal(${item.id}, 'income')" class="text-blue-600 hover:text-blue-800 mr-2 p-1 transition-colors">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button onclick="deleteFundTx(${item.id}, 'income')" class="text-slate-400 hover:text-rose-500 p-1 transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">Chưa có khoản thu nào.</td></tr>`;
    }
}

function renderFundExpenses() {
    const tbody = document.getElementById('expense-list');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(window.fundExpenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">Chưa có khoản chi nào.</td></tr>`;
        return;
    }

    window.fundExpenses.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">${formatDate(item.date)}</td>
            <td class="py-2.5 px-3 font-medium text-slate-800 wrap-content-cell min-w-[220px]">${item.desc}</td>
            <td class="py-2.5 px-3 text-right font-semibold text-rose-600 whitespace-nowrap">-${formatVND(item.amount)}</td>
            <td class="py-2.5 px-3 text-xs whitespace-nowrap"><span class="player-tag">${item.source}</span></td>
            <td class="py-2.5 px-3 text-xs text-slate-600 wrap-content-cell min-w-[200px]">${item.note || '---'}</td>
            <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <button onclick="openEditFundModal(${item.id}, 'expense')" class="text-blue-600 hover:text-blue-800 mr-2 p-1 transition-colors">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button onclick="deleteFundTx(${item.id}, 'expense')" class="text-slate-400 hover:text-rose-500 p-1 transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openFundModal(type) {
    requireAdminAuth(() => {
        const backdrop = document.getElementById('fund-modal-backdrop');
        const header = document.getElementById('fund-modal-header');
        const title = document.getElementById('fund-modal-title');
        const btnSubmit = document.getElementById('fund-btn-submit');
        const lblSource = document.getElementById('lbl-source');
        const sourceSelect = document.getElementById('tx-source-select');

        if(sourceSelect) {
            let optionsHtml = `<option value="Khách vãng lai / Khác">-- Khách vãng lai / Khác --</option>`;
            window.players.forEach(p => {
                optionsHtml += `<option value="${p.name}">${p.name}</option>`;
            });
            sourceSelect.innerHTML = optionsHtml;
        }
        
        const form = document.getElementById('fund-transaction-form');
        if(form) {
            form.querySelector('#tx-id').value = '';
            form.querySelector('#tx-type').value = type;
            form.querySelector('#tx-date').value = new Date().toISOString().split('T')[0];
            form.querySelector('#tx-desc').value = '';
            form.querySelector('#tx-amount').value = '';
            form.querySelector('#tx-note').value = '';
        }

        if(type === 'income') {
            header.className = "p-4 bg-emerald-600 text-white flex justify-between items-center";
            title.innerHTML = '<i class="fa-solid fa-circle-arrow-down"></i> Thêm Khoản Thu Mới';
            btnSubmit.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm";
            btnSubmit.innerText = "Lưu Khoản Thu";
            if(lblSource) lblSource.innerText = "Nguồn Thu / Pick Thủ";
        } else {
            header.className = "p-4 bg-rose-600 text-white flex justify-between items-center";
            title.innerHTML = '<i class="fa-solid fa-circle-arrow-up"></i> Thêm Khoản Chi Mới';
            btnSubmit.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm";
            btnSubmit.innerText = "Lưu Khoản Chi";
            if(lblSource) lblSource.innerText = "Hạng Mục Chi / Pick Thủ Nhận";
        }

        backdrop.classList.remove('hidden');
    });
}

function openEditFundModal(id, type) {
    requireAdminAuth(() => {
        const list = type === 'income' ? window.fundIncomes : window.fundExpenses;
        const item = list.find(x => x.id === id);
        if(!item) return;

        openFundModal(type);

        const form = document.getElementById('fund-transaction-form');
        form.querySelector('#tx-id').value = item.id;
        form.querySelector('#tx-date').value = item.date;
        form.querySelector('#tx-desc').value = item.desc;
        form.querySelector('#tx-amount').value = item.amount;
        form.querySelector('#tx-source-select').value = item.source || "Khách vãng lai / Khác";
        form.querySelector('#tx-note').value = item.note || "";

        const title = document.getElementById('fund-modal-title');
        title.innerHTML = type === 'income' ? '<i class="fa-solid fa-pen-to-square"></i> Sửa Khoản Thu' : '<i class="fa-solid fa-pen-to-square"></i> Sửa Khoản Chi';
    });
}

function closeFundModal() {
    document.getElementById('fund-modal-backdrop').classList.add('hidden');
}

function handleFundFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('fund-transaction-form');
    const txId = form.querySelector('#tx-id').value;
    const type = form.querySelector('#tx-type').value;

    const newItem = {
        id: txId ? Number(txId) : Date.now(),
        date: form.querySelector('#tx-date').value,
        desc: form.querySelector('#tx-desc').value,
        amount: Number(form.querySelector('#tx-amount').value),
        source: form.querySelector('#tx-source-select').value,
        note: form.querySelector('#tx-note').value
    };

    const list = type === 'income' ? window.fundIncomes : window.fundExpenses;

    if(txId) {
        const idx = list.findIndex(x => x.id === Number(txId));
        if(idx !== -1) list[idx] = newItem;
    } else {
        list.unshift(newItem);
    }

    saveFundData();
    closeFundModal();
}

function deleteFundTx(id, type) {
    requireAdminAuth(() => {
        if(confirm("Bạn có muốn xóa giao dịch này?")) {
            if(type === 'income') {
                window.fundIncomes = window.fundIncomes.filter(i => i.id !== id);
            } else {
                window.fundExpenses = window.fundExpenses.filter(i => i.id !== id);
            }
            saveFundData();
        }
    });
}

function exportFundToExcel() {
    let totalManualIncome = window.fundIncomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const quarterTotals = getQuarterCollectedTotals();
    let totalQuartersIncome = Object.values(quarterTotals).reduce((a, b) => a + Number(b), 0);

    let autoDailyIncomeTotal = 0;
    let autoIncomeRows = [];

    (window.activeQuarterColumns || []).forEach(col => {
        const qAmt = quarterTotals[col.id] || 0;
        autoIncomeRows.push([autoIncomeRows.length + 1, "Định kỳ Quý", col.title, qAmt, "Pick Thủ CLB", "Tự động tính từ Bảng Các Quý"]);
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
                const amt = Math.abs(dayNetK) * 1000;
                autoDailyIncomeTotal += amt;
                const noteVal = window.autoIncomeNotes[d] !== undefined ? window.autoIncomeNotes[d] : "Đồng bộ tự động từ trận đấu";
                autoIncomeRows.push([autoIncomeRows.length + 1, d, `Thu tiền kèo Ngày ${d}`, amt, "BTC CLB", noteVal]);
            }
        }
    });

    const grandTotalIncome = totalManualIncome + totalQuartersIncome + autoDailyIncomeTotal;
    const totalExpense = window.fundExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const currentBalance = window.initialFund + grandTotalIncome - totalExpense;

    const summaryData = [
        ["BÁO CÁO TỔNG QUAN QUỸ PICKLEBALL"],
        [],
        ["Hạng mục", "Số tiền (VNĐ)", "Ghi chú"],
        ["Quỹ đầu kỳ", window.initialFund, "Tồn quỹ kỳ trước chuyển sang"],
        ["Tổng thu trong kỳ", grandTotalIncome, "Bao gồm Thu Tiền Sân Các Quý, Tiền Kèo & Thu Khác"],
        ["Tổng chi trong kỳ", totalExpense, "Tự động tính từ Nhật ký Chi"],
        ["SỐ DƯ QUỸ HIỆN TẠI (THỪA/THIẾU)", currentBalance, "Công thức: Đầu kỳ + Tổng Thu - Tổng Chi"]
    ];

    const statusMap = { paid: "Đã đóng", unpaid: "Chưa đóng", pause: "Tạm nghỉ", no: "NO (Chưa đến)" };

    let dynamicHeaderExcel = ["STT", "Tên Pick Thủ"];
    window.activeQuarterColumns.forEach(col => {
        dynamicHeaderExcel.push(`${col.title} (VNĐ)`);
        dynamicHeaderExcel.push(col.statusTitle);
    });

    const memberData = [
        dynamicHeaderExcel,
        ...window.players.map((p, i) => {
            let row = [i + 1, p.name];
            window.activeQuarterColumns.forEach(col => {
                const qKey = col.id;
                const amt = window.fundFeeStatus[`${p.id}_${qKey}_amt`] !== undefined ? window.fundFeeStatus[`${p.id}_${qKey}_amt`] : col.defaultAmt;
                const st = statusMap[window.fundFeeStatus[`${p.id}_${qKey}_status`] || (window.fundFeeStatus[`${p.id}_${qKey}`] ? "paid" : "unpaid")];
                row.push(amt, st);
            });
            return row;
        })
    ];

    const incomeData = [
        ["STT", "Ngày tháng", "Nội dung thu", "Số tiền (VNĐ)", "Nguồn/Pick thủ", "Ghi chú"],
        ...autoIncomeRows,
        ...window.fundIncomes.map((item, i) => [autoIncomeRows.length + i + 1, formatDate(item.date), item.desc, item.amount, item.source, item.note]),
        ["", "", "TỔNG CỘNG THU QUỸ", grandTotalIncome, "", ""]
    ];

    const expenseData = [
        ["STT", "Ngày tháng", "Nội dung chi", "Số tiền (VNĐ)", "Hạng mục/Pick thủ", "Ghi chú"],
        ...window.fundExpenses.map((item, i) => [i + 1, formatDate(item.date), item.desc, item.amount, item.source, item.note]),
        ["", "", "TỔNG CỘNG CHI", totalExpense, "", ""]
    ];

    const wb = XLSX.utils.book_new();
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsMembers = XLSX.utils.aoa_to_sheet(memberData);
    const wsIncomes = XLSX.utils.aoa_to_sheet(incomeData);
    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng Quan Quỹ");
    XLSX.utils.book_append_sheet(wb, wsMembers, "Thành Viên Quỹ");
    XLSX.utils.book_append_sheet(wb, wsIncomes, "Nhật Ký Thu Quỹ");
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Nhật Ký Chi Quỹ");

    XLSX.writeFile(wb, "Quan_Ly_Thu_Chi_Quy_Pickleball.xlsx");
}

function toggleMenu(menuId, e) {
    e.stopPropagation();
    const targetMenu = document.getElementById(menuId);
    const isAlreadyShow = targetMenu.classList.contains("show");
    closeAllDropdowns();
    if (!isAlreadyShow) targetMenu.classList.add("show");
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}

function renderDatesMenuList() {
    const container = document.getElementById('datesMenuList');
    if (!container) return;
    container.innerHTML = window.dates.map(d => `
        <div class="dropdown-item ${window.currentSelectedDate === d ? 'text-blue-600 font-bold' : ''}" onclick="selectDateView('${d}')">
            <i class="fa-solid fa-calendar-day text-blue-500"></i> Ngày ${d}
        </div>
    `).join('');
}

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

function renameCurrentDate() {
    closeAllDropdowns();
    const oldDate = window.currentSelectedDate;
    const newDate = prompt(`Nhập tên mới cho ngày "${oldDate}":`, oldDate);
    if (newDate && newDate.trim() !== "" && newDate !== oldDate) {
        const trimmed = newDate.trim();
        if (window.dates.includes(trimmed)) return alert("⚠️ Tên ngày này đã tồn tại!");
        const idx = window.dates.indexOf(oldDate);
        if (idx !== -1) window.dates[idx] = trimmed;
        window.matchesData[trimmed] = window.matchesData[oldDate];
        window.dateKeoMode[trimmed] = window.dateKeoMode[oldDate];
        delete window.matchesData[oldDate];
        delete window.dateKeoMode[oldDate];
        selectDateView(trimmed);
        updateFundDashboard();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function deleteCurrentDate() {
    closeAllDropdowns();
    const dateToDelete = window.currentSelectedDate;
    if (confirm(`❌ Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu ngày "${dateToDelete}"?`)) {
        window.dates = window.dates.filter(d => d !== dateToDelete);
        delete window.matchesData[dateToDelete];
        delete window.dateKeoMode[dateToDelete];
        if (window.dates.length > 0) selectDateView(window.dates[0]);
        else showTab('home');
        updateFundDashboard();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function exportToExcel() {
    closeAllDropdowns();
    if(window.dates.length === 0) return alert("Chưa có ngày nào để xuất Excel!");
    let wb = XLSX.utils.book_new();
    window.dates.forEach(d => {
        let matches = window.matchesData[d] || [];
        let rows = matches.map((m, idx) => ({
            "Trận": idx + 1,
            "Cặp 1 - VĐV 1": m.c1_p1 || "",
            "Cặp 1 - VĐV 2": m.c1_p2 || "",
            "Điểm 1": m.score1 || "",
            "Điểm 2": m.score2 || "",
            "Cặp 2 - VĐV 1": m.c2_p1 || "",
            "Cặp 2 - VĐV 2": m.c2_p2 || ""
        }));
        let ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, d.replace(/\//g, "-"));
    });
    XLSX.writeFile(wb, `CLB_Pickleball_CMTD_ThongKe.xlsx`);
}

function backupDataJSON() { exportBackupJSON(); }
function triggerRestoreJSON() { triggerRestoreInput(); }

function addMatchToCurrentDate() {
    addMatchToDate(window.currentSelectedDate);
}

function deleteMatchFromCurrentDate(index) {
    deleteMatchFromDate(window.currentSelectedDate, index);
}

function updateMatchData(index, field, value) {
    updateMatchDataForDate(window.currentSelectedDate, index, field, value);
}

function applyKeoToAllMatchesInDate(modeVal) {
    applyKeoToAllMatchesForDate(window.currentSelectedDate, modeVal);
}

function updateMatchKeoMode(index, modeVal) {
    updateMatchKeoModeForDate(window.currentSelectedDate, index, modeVal);
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

function handleBtcNoteChange(selectEl) {
    handleBtcNoteChangeForDate(window.currentSelectedDate, selectEl);
}

function renderDayDetailView() {
    removeLegacyAbsentBox();
    const dateStr = window.currentSelectedDate;
    const titleEl = document.getElementById('current-date-title');
    if(titleEl) titleEl.innerText = dateStr;

    const modeSelect = document.getElementById('keo-mode-select');
    if(modeSelect) modeSelect.value = window.dateKeoMode[dateStr] || 'default';

    const matches = window.matchesData[dateStr] || [];
    const tbody = document.getElementById('day-matches-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let stats = {};
    window.players.forEach(p => { stats[p.name] = { played: 0, winK: 0, loseK: 0, total: 0 }; });

    matches.forEach((m, idx) => {
        const val1 = (m.score1 || "").toString().trim();
        const val2 = (m.score2 || "").toString().trim();
        const s1 = parseInt(val1);
        const s2 = parseInt(val2);

        let keo1 = "", keo2 = "";
        const mMode = m.keoMode || window.dateKeoMode[dateStr] || 'default';
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
    ensureDaySummaryAbsentHeader(sumBody);
    sumBody.innerHTML = '';

    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0, sumFine = 0;
    const fineMap = getAbsentFineMap(dateStr);

    window.players.forEach(p => {
        const st = stats[p.name];
        const isAbsent = Object.prototype.hasOwnProperty.call(fineMap, p.name);
        if(st.played > 0 || isAbsent) {
            const payKey = `${dateStr}_${p.name}`;
            const isPaid = window.paymentStatus[payKey] || false;

            const fine = isAbsent ? fineMap[p.name] : 0;
            const netTotal = st.total + fine;
            sumFine += fine;

            let bringBack = 0;
            if(st.played >= 4 && netTotal > 0) { bringBack = netTotal; sumBringBack += bringBack; }
            if(netTotal < 0) { sumAmThucTe += netTotal; if(isPaid) sumThucThu += Math.abs(netTotal); }

            let noteText = "";
            if(netTotal < 0) {
                noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
            } else if(netTotal > 0) {
                noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
            } else if(isAbsent) {
                noteText = `<span class="text-slate-500 font-bold">Nghỉ - không phạt</span>`;
            }

            const disabledAttr = window.isAdminUnlocked ? '' : 'disabled title="Cần mật khẩu Admin để sửa"';

            sumBody.innerHTML += `
                <tr class="hover:bg-slate-50">
                    <td class="p-2 border text-left whitespace-nowrap pl-3"><span class="player-tag">${p.name}</span></td>
                    <td class="p-2 border">${st.played}</td>
                    <td class="p-2 border txt-win">${st.winK > 0 ? st.winK : ''}</td>
                    <td class="p-2 border txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
                    <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? bringBack : ''}</td>
                    <td class="p-2 border font-extrabold ${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}">${st.total}</td>
                    ${buildAbsentFineCell(dateStr, p.name, isAbsent, fine, false)}
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
        ${buildAbsentSelectorRow(dateStr, 9)}
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 whitespace-nowrap pl-3">TỔNG BTC THU VỀ</td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border text-blue-700">${sumBringBack}</td>
            <td class="p-2 border text-red-600" title="Đã gồm tiền phạt nghỉ">${btcThuVe}</td>
            <td class="p-2 border ${sumFine < 0 ? 'txt-lose' : 'text-slate-500'}">${sumFine < 0 ? sumFine : 0}</td>
            <td class="p-2 border text-blue-700">${sumThucThu}</td>
            <td class="p-2 border whitespace-nowrap">
                <select onchange="handleBtcNoteChangeForDate('${dateStr}', this)" class="text-xs font-bold p-1 border rounded bg-white text-emerald-700 outline-none">
                    <option value="YES" ${currentOption==='YES'?'selected':''}>YES (Chuyển tổng ngày)</option>
                    <option value="NO" ${currentOption==='NO'?'selected':''}>NO (Không chuyển)</option>
                </select>
            </td>
        </tr>
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn</td>
            <td class="p-2 border text-red-600 text-sm" colspan="2">${quyCon}</td>
            <td class="p-2 border" colspan="3"></td>
        </tr>
    `;
}

function renderTongHopTab() {
    const container = document.getElementById('tonghop-content-container');
    if(!container) return;

    let activeDates = window.dates.filter(d => {
        const matches = window.matchesData[d] || [];
        return matches.some(m => (!isNaN(parseInt(m.score1)) && !isNaN(parseInt(m.score2))) || m.c1_p1 || m.c1_p2 || m.c2_p1 || m.c2_p2);
    });

    if (activeDates.length === 0) {
        container.innerHTML = `<div class="p-8 text-center font-bold text-slate-500">Hiện chưa có ngày nào phát sinh dữ liệu trận đấu.</div>`;
        return;
    }

    let vdvList = window.players.map(p => p.name);
    let vdvDayTotals = {};
    let vdvRowKeoSum = {};
    
    vdvList.forEach(v => {
        vdvDayTotals[v] = {};
        vdvRowKeoSum[v] = 0;
        activeDates.forEach(d => { vdvDayTotals[v][d] = 0; });
    });

    let dayTotalsSum = {};
    activeDates.forEach(d => { dayTotalsSum[d] = 0; });

    activeDates.forEach(d => {
        const matches = window.matchesData[d] || [];
        const pStatus = window.paymentStatus[d];
        let isTransferYes = true;
        if (pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "NO") {
            isTransferYes = false;
        }

        let statsDay = {};
        vdvList.forEach(v => { statsDay[v] = { played: 0, total: 0 }; });

        matches.forEach(m => {
            const s1 = parseInt(m.score1);
            const s2 = parseInt(m.score2);
            
            const mMode = m.keoMode || window.dateKeoMode[d] || 'default';
            let winAmt = 5, loseAmt = -15;

            if (mMode === "k0") { winAmt = 0; loseAmt = 0; }
            else if (mMode === "k25") { winAmt = 0; loseAmt = -25; } 
            else if (mMode === "free") {
                winAmt = parseFloat(m.customWin) || 0;
                loseAmt = parseFloat(m.customLose) || 0;
                if (loseAmt > 0) loseAmt = -loseAmt;
            }

            if (!isNaN(s1) && !isNaN(s2)) {
                const pair1 = [m.c1_p1, m.c1_p2].filter(Boolean);
                const pair2 = [m.c2_p1, m.c2_p2].filter(Boolean);
                let isHam = (s1 === 0 || s2 === 0);
                let effWin = isHam ? (winAmt > 0 ? winAmt * 2 : 0) : winAmt;
                let effLose = isHam ? loseAmt * 2 : loseAmt;

                if (s1 > s2) {
                    pair1.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effWin; } });
                    pair2.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effLose; } });
                } else if (s2 > s1) {
                    pair2.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effWin; } });
                    pair1.forEach(v => { if (statsDay[v]) { statsDay[v].played++; statsDay[v].total += effLose; } });
                }
            }
        });

        // Cộng tiền phạt VĐV xin nghỉ (không phép) trong ngày
        const fineMapDay = getAbsentFineMap(d);
        vdvList.forEach(v => {
            if (Object.prototype.hasOwnProperty.call(fineMapDay, v)) {
                statsDay[v].total += fineMapDay[v];
                statsDay[v].absent = true;
            }
        });

        let sumAmDay = 0, sumBringBackDay = 0;
        vdvList.forEach(v => {
            let st = statsDay[v];
            if (st.played > 0 || st.absent) {
                if (isTransferYes) {
                    vdvDayTotals[v][d] = st.total;
                    vdvRowKeoSum[v] += st.total;
                } else {
                    vdvDayTotals[v][d] = 0;
                }

                if (st.total < 0) sumAmDay += st.total;
                else if (st.played >= 4 && st.total > 0) sumBringBackDay += st.total;
            }
        });

        dayTotalsSum[d] = isTransferYes ? (sumAmDay + sumBringBackDay) : 0;
    });

    let grandTotalAllDays = 0;
    let html = `
        <table class="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
                <tr class="bg-slate-100 text-slate-800">
                    <th class="p-2 border font-bold min-w-[130px] sm:min-w-[150px] text-left pl-3 sticky left-0 bg-slate-100 z-10 shadow-sm">VĐV (PICK THỦ)</th>
                    ${activeDates.map(d => `<th class="p-2 border font-bold min-w-[90px] whitespace-nowrap">NGÀY ${d}</th>`).join('')}
                    <th class="p-2 border font-bold bg-yellow-200 text-amber-900 min-w-[100px] whitespace-nowrap">TỔNG KÈO</th>
                </tr>
            </thead>
            <tbody>
    `;

    vdvList.forEach((v) => {
        let dayCells = activeDates.map(d => {
            let val = vdvDayTotals[v][d];
            let cls = val > 0 ? 'txt-win' : (val < 0 ? 'txt-lose' : '');
            return `<td class="p-2 border ${cls}">${val !== 0 ? (val > 0 ? '+' + val + 'K' : val + 'K') : '-'}</td>`;
        }).join('');

        let rowSum = vdvRowKeoSum[v];
        let totalCls = rowSum > 0 ? 'txt-win' : (rowSum < 0 ? 'txt-lose' : '');

        html += `
            <tr class="hover:bg-slate-50">
                <td class="p-2 border text-left pl-3 sticky left-0 bg-white z-10 shadow-sm"><span class="player-tag">${v}</span></td>
                ${dayCells}
                <td class="p-2 border font-bold bg-yellow-100 ${totalCls}">${rowSum !== 0 ? (rowSum > 0 ? '+' + rowSum + 'K' : rowSum + 'K') : '0K'}</td>
            </tr>
        `;
    });

    let daySumCells = activeDates.map(d => {
        let val = dayTotalsSum[d];
        grandTotalAllDays += val;
        let cls = val < 0 ? 'txt-lose' : (val > 0 ? 'txt-win' : '');
        return `<td class="p-2 border font-bold ${cls}">${val !== 0 ? val + 'K' : '0K'}</td>`;
    }).join('');

    let grandTotalCls = grandTotalAllDays < 0 ? 'txt-lose' : (grandTotalAllDays > 0 ? 'txt-win' : '');

    html += `
                <tr class="bg-slate-100 font-extrabold">
                    <td class="p-2 border text-left pl-3 text-red-600 sticky left-0 bg-slate-100 z-10 shadow-sm">TỔNG BTC THU VỀ</td>
                    ${daySumCells}
                    <td class="p-2 border font-extrabold bg-yellow-200 ${grandTotalCls}">${grandTotalAllDays !== 0 ? grandTotalAllDays + 'K' : '0K'}</td>
                </tr>
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function renderM2Pairs() {
    const boxA = document.getElementById('m2-pairs-A');
    const boxB = document.getElementById('m2-pairs-B');
    if(!boxA || !boxB) return;
    boxA.innerHTML = ''; boxB.innerHTML = '';

    document.getElementById('count-m2-A').innerText = window.m2PairsA.length;
    document.getElementById('count-m2-B').innerText = window.m2PairsB.length;

    window.m2PairsA.forEach((pair, idx) => {
        boxA.innerHTML += `<div class="flex items-center justify-between bg-white p-2 rounded border text-xs shadow-sm"><span class="font-semibold">Cặp ${idx+1}: <span class="player-tag">${pair.p1}</span> & <span class="player-tag">${pair.p2}</span></span><div><button onclick="openM2EditModal('A', ${idx})" class="text-blue-600 p-1"><i class="fa-solid fa-pencil"></i></button><button onclick="deletePairM2('A', ${idx})" class="text-red-500 p-1"><i class="fa-solid fa-trash"></i></button></div></div>`;
    });
    window.m2PairsB.forEach((pair, idx) => {
        boxB.innerHTML += `<div class="flex items-center justify-between bg-white p-2 rounded border text-xs shadow-sm"><span class="font-semibold">Cặp ${idx+1}: <span class="player-tag">${pair.p1}</span> & <span class="player-tag">${pair.p2}</span></span><div><button onclick="openM2EditModal('B', ${idx})" class="text-blue-600 p-1"><i class="fa-solid fa-pencil"></i></button><button onclick="deletePairM2('B', ${idx})" class="text-red-500 p-1"><i class="fa-solid fa-trash"></i></button></div></div>`;
    });
}

function openM2EditModal(group, index) {
    const pair = group === 'A' ? window.m2PairsA[index] : window.m2PairsB[index];
    if(pair) {
        document.getElementById('m2-edit-group').value = group;
        document.getElementById('m2-edit-index').value = index;
        document.getElementById('m2-p1-input').value = pair.p1;
        document.getElementById('m2-p2-input').value = pair.p2;
        document.getElementById('m2-edit-modal').classList.remove('hidden');
    }
}
function closeM2EditModal() { document.getElementById('m2-edit-modal').classList.add('hidden'); }

function saveM2PairEdit() {
    const group = document.getElementById('m2-edit-group').value;
    const index = parseInt(document.getElementById('m2-edit-index').value);
    const p1 = document.getElementById('m2-p1-input').value.trim();
    const p2 = document.getElementById('m2-p2-input').value.trim();
    if(!p1 || !p2) return alert('Vui lòng nhập đầy đủ tên 2 VĐV!');

    if(group === 'A') window.m2PairsA[index] = { p1, p2 };
    else window.m2PairsB[index] = { p1, p2 };

    closeM2EditModal(); renderM2(); autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function addPairM2(group) {
    const pList = window.players.map(p => p.name);
    const default1 = pList[0] || "VĐV 1";
    const default2 = pList[1] || "VĐV 2";

    if(group === 'A') window.m2PairsA.push({ p1: default1, p2: default2 });
    else window.m2PairsB.push({ p1: default1, p2: default2 });
    renderM2(); autoBackupData(); if(window.syncToFirebase) window.syncToFirebase();
}

function deletePairM2(group, index) {
    if(confirm('Bạn có chắc muốn xóa cặp VĐV này?')) {
        if(group === 'A') window.m2PairsA.splice(index, 1);
        else window.m2PairsB.splice(index, 1);
        renderM2(); autoBackupData(); if(window.syncToFirebase) window.syncToFirebase();
    }
}

function generateM2GroupSchedule(pairs, groupName) {
    let schedule = [];
    let count = pairs.length;
    let matchIdx = 1;

    for(let i = 0; i < count; i++) {
        for(let j = i + 1; j < count; j++) {
            const matchKey = `${groupName}_${i}_${j}`;
            schedule.push({
                key: matchKey,
                matchNum: matchIdx++,
                t1Index: i,
                t2Index: j,
                t1Name: `${pairs[i].p1} - ${pairs[i].p2}`,
                t2Name: `${pairs[j].p1} - ${pairs[j].p2}`
            });
        }
    }
    return schedule;
}

function renderM2() {
    renderM2Pairs();

    const schedA = generateM2GroupSchedule(window.m2PairsA, 'A');
    const schedB = generateM2GroupSchedule(window.m2PairsB, 'B');

    let statsA = window.m2PairsA.map((p, idx) => ({
        idx, name: `${p.p1} - ${p.p2}`, pts: 0, diff: 0, headToHead: {}
    }));

    const tbodySchedA = document.getElementById('m2-schedule-A');
    if(tbodySchedA) {
        tbodySchedA.innerHTML = '';
        schedA.forEach(m => {
            const s1 = window.m2ScoresA[m.key + '_1'] !== undefined ? window.m2ScoresA[m.key + '_1'] : '';
            const s2 = window.m2ScoresA[m.key + '_2'] !== undefined ? window.m2ScoresA[m.key + '_2'] : '';

            if(s1 !== '' && s2 !== '') {
                const v1 = parseInt(s1);
                const v2 = parseInt(s2);
                const diff = v1 - v2;

                statsA[m.t1Index].diff += diff;
                statsA[m.t2Index].diff -= diff;

                if(v1 > v2) {
                    statsA[m.t1Index].pts += 1;
                    statsA[m.t1Index].headToHead[m.t2Index] = 1;
                    statsA[m.t2Index].headToHead[m.t1Index] = -1;
                } else if(v2 > v1) {
                    statsA[m.t2Index].pts += 1;
                    statsA[m.t2Index].headToHead[m.t1Index] = 1;
                    statsA[m.t1Index].headToHead[m.t2Index] = -1;
                }
            }

            tbodySchedA.innerHTML += `
                <tr>
                    <td class="border p-1 font-bold">T${m.matchNum}</td>
                    <td class="border p-1 text-left font-bold text-blue-800">${m.t1Name}</td>
                    <td class="border p-1"><input type="number" value="${s1}" onchange="updateM2Score('A', '${m.key}_1', this.value)" class="w-10 text-center font-bold"></td>
                    <td class="border p-1"><input type="number" value="${s2}" onchange="updateM2Score('A', '${m.key}_2', this.value)" class="w-10 text-center font-bold"></td>
                    <td class="border p-1 text-left font-bold text-blue-800">${m.t2Name}</td>
                </tr>
            `;
        });
    }

    statsA.sort((a,b) => {
        if(b.pts !== a.pts) return b.pts - a.pts;
        if(b.diff !== a.diff) return b.diff - a.diff;
        return (a.headToHead[b.idx] || 0) < 0 ? 1 : -1;
    });

    const rankA = document.getElementById('m2-rank-A');
    if(rankA) {
        rankA.innerHTML = '';
        statsA.forEach((st, i) => {
            rankA.innerHTML += `
                <tr>
                    <td class="border p-1 font-bold">${i+1}</td>
                    <td class="border p-1 text-left font-bold text-blue-800">${st.name}</td>
                    <td class="border p-1 font-bold text-blue-800">${st.pts}</td>
                    <td class="border p-1 font-semibold">${st.diff > 0 ? '+'+st.diff : st.diff}</td>
                </tr>
            `;
        });
    }

    let statsB = window.m2PairsB.map((p, idx) => ({
        idx, name: `${p.p1} - ${p.p2}`, pts: 0, diff: 0, headToHead: {}
    }));

    const tbodySchedB = document.getElementById('m2-schedule-B');
    if(tbodySchedB) {
        tbodySchedB.innerHTML = '';
        schedB.forEach(m => {
            const s1 = window.m2ScoresB[m.key + '_1'] !== undefined ? window.m2ScoresB[m.key + '_1'] : '';
            const s2 = window.m2ScoresB[m.key + '_2'] !== undefined ? window.m2ScoresB[m.key + '_2'] : '';

            if(s1 !== '' && s2 !== '') {
                const v1 = parseInt(s1);
                const v2 = parseInt(s2);
                const diff = v1 - v2;

                statsB[m.t1Index].diff += diff;
                statsB[m.t2Index].diff -= diff;

                if(v1 > v2) {
                    statsB[m.t1Index].pts += 1;
                    statsB[m.t1Index].headToHead[m.t2Index] = 1;
                    statsB[m.t2Index].headToHead[m.t1Index] = -1;
                } else if(v2 > v1) {
                    statsB[m.t2Index].pts += 1;
                    statsB[m.t2Index].headToHead[m.t1Index] = 1;
                    statsB[m.t1Index].headToHead[m.t2Index] = -1;
                }
            }

            tbodySchedB.innerHTML += `
                <tr>
                    <td class="border p-1 font-bold">T${m.matchNum}</td>
                    <td class="border p-1 text-left font-bold text-orange-800">${m.t1Name}</td>
                    <td class="border p-1"><input type="number" value="${s1}" onchange="updateM2Score('B', '${m.key}_1', this.value)" class="w-10 text-center font-bold"></td>
                    <td class="border p-1"><input type="number" value="${s2}" onchange="updateM2Score('B', '${m.key}_2', this.value)" class="w-10 text-center font-bold"></td>
                    <td class="border p-1 text-left font-bold text-orange-800">${m.t2Name}</td>
                </tr>
            `;
        });
    }

    statsB.sort((a,b) => {
        if(b.pts !== a.pts) return b.pts - a.pts;
        if(b.diff !== a.diff) return b.diff - a.diff;
        return (a.headToHead[b.idx] || 0) < 0 ? 1 : -1;
    });

    const rankB = document.getElementById('m2-rank-B');
    if(rankB) {
        rankB.innerHTML = '';
        statsB.forEach((st, i) => {
            rankB.innerHTML += `
                <tr>
                    <td class="border p-1 font-bold">${i+1}</td>
                    <td class="border p-1 text-left font-bold text-orange-800">${st.name}</td>
                    <td class="border p-1 font-bold text-orange-800">${st.pts}</td>
                    <td class="border p-1 font-semibold">${st.diff > 0 ? '+'+st.diff : st.diff}</td>
                </tr>
            `;
        });
    }

    const team1A = statsA[0] ? statsA[0].name : "Nhất A";
    const team2A = statsA[1] ? statsA[1].name : "Nhì A";
    const team1B = statsB[0] ? statsB[0].name : "Nhất B";
    const team2B = statsB[1] ? statsB[1].name : "Nhì B";

    if(document.getElementById('bk1-team1-name')) document.getElementById('bk1-team1-name').innerText = team1A;
    if(document.getElementById('bk1-team2-name')) document.getElementById('bk1-team2-name').innerText = team2B;
    if(document.getElementById('bk2-team1-name')) document.getElementById('bk2-team1-name').innerText = team1B;
    if(document.getElementById('bk2-team2-name')) document.getElementById('bk2-team2-name').innerText = team2A;

    const bk1_s1 = parseInt(document.getElementById('bk1-s1')?.value || -1);
    const bk1_s2 = parseInt(document.getElementById('bk1-s2')?.value || -1);
    const bk2_s1 = parseInt(document.getElementById('bk2-s1')?.value || -1);
    const bk2_s2 = parseInt(document.getElementById('bk2-s2')?.value || -1);

    let winBK1 = "Thắng BK1", loseBK1 = "Thua BK1";
    let winBK2 = "Thắng BK2", loseBK2 = "Thua BK2";

    if(bk1_s1 !== -1 && bk1_s2 !== -1) {
        if(bk1_s1 > bk1_s2) { winBK1 = team1A; loseBK1 = team2B; }
        else if(bk1_s2 > bk1_s1) { winBK1 = team2B; loseBK1 = team1A; }
    }

    if(bk2_s1 !== -1 && bk2_s2 !== -1) {
        if(bk2_s1 > bk2_s2) { winBK1 = team1B; loseBK1 = team2A; }
        else if(bk2_s2 > bk2_s1) { winBK1 = team2A; loseBK1 = team1B; }
    }

    if(document.getElementById('t3-team1-name')) document.getElementById('t3-team1-name').innerText = loseBK1;
    if(document.getElementById('t3-team2-name')) document.getElementById('t3-team2-name').innerText = loseBK2;
    if(document.getElementById('ck-team1-name')) document.getElementById('ck-team1-name').innerText = winBK1;
    if(document.getElementById('ck-team2-name')) document.getElementById('ck-team2-name').innerText = winBK2;

    const t3_s1 = parseInt(document.getElementById('t3-s1')?.value || -1);
    const t3_s2 = parseInt(document.getElementById('t3-s2')?.value || -1);
    const ck_s1 = parseInt(document.getElementById('ck-s1')?.value || -1);
    const ck_s2 = parseInt(document.getElementById('ck-s2')?.value || -1);

    let winner1 = "---", winner2 = "---", winner3 = "---";

    if(ck_s1 !== -1 && ck_s2 !== -1) {
        if(ck_s1 > ck_s2) { winner1 = winBK1; winner2 = winBK2; }
        else if(ck_s2 > ck_s1) { winner1 = winBK2; winner2 = winBK1; }
    }

    if(t3_s1 !== -1 && t3_s2 !== -1) {
        if(t3_s1 > t3_s2) { winner3 = loseBK1; }
        else if(t3_s2 > t3_s1) { winner3 = loseBK2; }
    }

    if(document.getElementById('winner-1')) document.getElementById('winner-1').innerText = winner1;
    if(document.getElementById('winner-2')) document.getElementById('winner-2').innerText = winner2;
    if(document.getElementById('winner-3')) document.getElementById('winner-3').innerText = winner3;

    renderM2KeoSummary(schedA, schedB);
}

function ensureM2KeoState() {
    if (!window.m2KeoState || typeof window.m2KeoState !== 'object') window.m2KeoState = {};
    const d = window.m2KeoState;
    if (!d.keoMode) d.keoMode = 'default';
    if (d.customWin === undefined) d.customWin = 5;
    if (d.customLose === undefined) d.customLose = -15;
    if (!d.payStatus || typeof d.payStatus !== 'object') d.payStatus = {};
    if (!d.btcOption) d.btcOption = 'YES';
}

function getM2KeoConfig() {
    ensureM2KeoState();
    const d = window.m2KeoState;
    if (d.keoMode === 'k0') return { win: 0, lose: 0 };
    if (d.keoMode === 'k25') return { win: 0, lose: -25 };
    if (d.keoMode === 'free') {
        let w = parseFloat(d.customWin) || 0;
        let l = parseFloat(d.customLose) || 0;
        if (l > 0) l = -l;
        return { win: w, lose: l };
    }
    return { win: 5, lose: -15 };
}

function persistM2() {
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function setM2KeoMode(mode) {
    ensureM2KeoState();
    window.m2KeoState.keoMode = mode;
    persistM2();
    renderM2();
}

function setM2CustomKeo() {
    ensureM2KeoState();
    window.m2KeoState.customWin = parseFloat(document.getElementById('m2-keo-custom-win').value) || 0;
    window.m2KeoState.customLose = parseFloat(document.getElementById('m2-keo-custom-lose').value) || 0;
    persistM2();
    renderM2();
}

function refreshAdminBadgesM2() {
    const badge = document.getElementById('m2-admin-status-badge');
    if (!badge) return;
    if (window.isAdminUnlocked) {
        badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
        badge.className = "text-[11px] font-bold text-emerald-700 flex items-center gap-1";
    } else {
        badge.innerHTML = `<i class="fa-solid fa-lock text-red-500"></i> Mở Khóa Admin Tích Nộp:`;
        badge.className = "text-[11px] font-bold text-slate-600 flex items-center gap-1";
    }
}

function checkM2AdminPassword() {
    const inputPass = document.getElementById('m2-admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        alert("🔑 Xác thực Admin thành công!");
        refreshAdminBadgesM2();
        if (typeof refreshAdminBadgesM1 === 'function') refreshAdminBadgesM1();
        renderM2();
        if (typeof renderM1ScheduleTeam === 'function') renderM1ScheduleTeam();
        if (typeof renderDayDetailView === 'function') renderDayDetailView();
        if (typeof renderHomeClosestDateView === 'function') renderHomeClosestDateView();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
}

function toggleM2Payment(name) {
    if (!window.isAdminUnlocked) {
        alert("🔒 Bạn cần nhập Pass Admin ở phía trên!");
        return;
    }
    ensureM2KeoState();
    const ps = window.m2KeoState.payStatus;
    ps[name] = !ps[name];
    persistM2();
    renderM2();
}

function setM2BtcOption(val) {
    ensureM2KeoState();
    window.m2KeoState.btcOption = val;
    persistM2();
    renderM2();
}

function renderM2KeoSummary(schedA, schedB) {
    const summaryBody = document.getElementById('m2-keo-summary-body');
    if (!summaryBody) return;
    ensureM2KeoState();

    const modeSel = document.getElementById('m2-keo-mode-select');
    if (modeSel) modeSel.value = window.m2KeoState.keoMode;
    const customBox = document.getElementById('m2-keo-custom-box');
    if (customBox) {
        if (window.m2KeoState.keoMode === 'free') { customBox.classList.remove('hidden'); customBox.classList.add('flex'); }
        else { customBox.classList.add('hidden'); customBox.classList.remove('flex'); }
    }
    const cw = document.getElementById('m2-keo-custom-win');
    const cl = document.getElementById('m2-keo-custom-lose');
    if (cw && document.activeElement !== cw) cw.value = window.m2KeoState.customWin;
    if (cl && document.activeElement !== cl) cl.value = window.m2KeoState.customLose;
    refreshAdminBadgesM2();

    let stats = {};
    const addPlayer = (name, group) => {
        if (!name) return;
        if (!stats[name]) stats[name] = { name, groups: [], played: 0, winK: 0, loseK: 0, total: 0 };
        if (!stats[name].groups.includes(group)) stats[name].groups.push(group);
    };
    window.m2PairsA.forEach(p => { addPlayer(p.p1, 'A'); addPlayer(p.p2, 'A'); });
    window.m2PairsB.forEach(p => { addPlayer(p.p1, 'B'); addPlayer(p.p2, 'B'); });

    let pairPlayers = {};
    [...window.m2PairsA, ...window.m2PairsB].forEach(p => {
        pairPlayers[`${p.p1} - ${p.p2}`] = [p.p1, p.p2].filter(Boolean);
    });

    const cfg = getM2KeoConfig();

    const processMatch = (t1Name, t2Name, s1Str, s2Str) => {
        if (s1Str === undefined || s2Str === undefined || s1Str === '' || s2Str === '' || isNaN(s1Str) || isNaN(s2Str)) return;
        const s1 = parseInt(s1Str), s2 = parseInt(s2Str);
        if (s1 === s2) return;
        const isHam = (s1 === 0 || s2 === 0);
        const effWin = isHam ? (cfg.win > 0 ? cfg.win * 2 : 0) : cfg.win;
        const effLose = isHam ? cfg.lose * 2 : cfg.lose;
        const apply = (pairName, isWin) => {
            (pairPlayers[pairName] || []).forEach(n => {
                const st = stats[n];
                if (!st) return;
                st.played++;
                if (isWin) st.winK += effWin; else st.loseK += effLose;
                st.total += isWin ? effWin : effLose;
            });
        };
        apply(t1Name, s1 > s2);
        apply(t2Name, s2 > s1);
    };

    schedA.forEach(m => processMatch(m.t1Name, m.t2Name, window.m2ScoresA[m.key + '_1'], window.m2ScoresA[m.key + '_2']));
    schedB.forEach(m => processMatch(m.t1Name, m.t2Name, window.m2ScoresB[m.key + '_1'], window.m2ScoresB[m.key + '_2']));

    const payStatus = window.m2KeoState.payStatus;
    const disabledAttr = window.isAdminUnlocked ? '' : 'disabled title="Cần mật khẩu Admin để sửa"';

    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0;
    let rows = '';

    Object.values(stats).forEach(st => {
        if (st.played <= 0) return;
        const isPaid = !!payStatus[st.name];

        let bringBack = 0;
        if (st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack += bringBack; }
        if (st.total < 0) { sumAmThucTe += st.total; if (isPaid) sumThucThu += Math.abs(st.total); }

        let noteText = "";
        if (st.total < 0) {
            noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
        } else if (st.total > 0) {
            noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
        }

        const safeName = String(st.name).replace(/'/g, "\\'");
        const grpLabel = st.groups.join('/');
        const grpCls = st.groups.length > 1 ? 'text-slate-600' : (st.groups[0] === 'A' ? 'text-blue-600' : 'text-orange-600');
        rows += `
            <tr class="hover:bg-slate-50">
                <td class="p-2 border text-left whitespace-nowrap pl-3">
                    <span class="player-tag">${st.name}</span>
                    <span class="ml-1 text-[10px] font-black ${grpCls}">(${grpLabel})</span>
                </td>
                <td class="p-2 border">${st.played}</td>
                <td class="p-2 border txt-win">${st.winK > 0 ? st.winK : ''}</td>
                <td class="p-2 border txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
                <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? bringBack : ''}</td>
                <td class="p-2 border font-extrabold ${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}">${st.total}</td>
                <td class="p-2 border bg-amber-50/30">
                    <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="toggleM2Payment('${safeName}')" class="w-4 h-4 cursor-pointer accent-emerald-600">
                </td>
                <td class="p-2 border whitespace-nowrap">${noteText}</td>
            </tr>
        `;
    });

    if (!rows) {
        rows = `<tr><td colspan="8" class="p-4 text-center text-slate-400 font-normal">Chưa có trận nào nhập tỷ số để thống kê kèo.</td></tr>`;
    }

    const btcThuVe = sumAmThucTe + sumBringBack;
    const quyCon = sumThucThu - Math.abs(btcThuVe);
    const currentOption = window.m2KeoState.btcOption || 'YES';

    summaryBody.innerHTML = rows + `
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 whitespace-nowrap pl-3">TỔNG BTC THU VỀ</td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border text-blue-700">${sumBringBack}</td>
            <td class="p-2 border text-red-600">${btcThuVe}</td>
            <td class="p-2 border text-blue-700">${sumThucThu}</td>
            <td class="p-2 border whitespace-nowrap">
                <select onchange="setM2BtcOption(this.value)" class="text-xs font-bold p-1 border rounded bg-white text-emerald-700 outline-none">
                    <option value="YES" ${currentOption === 'YES' ? 'selected' : ''}>YES (Chuyển tổng)</option>
                    <option value="NO" ${currentOption === 'NO' ? 'selected' : ''}>NO (Không chuyển)</option>
                </select>
            </td>
        </tr>
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn</td>
            <td class="p-2 border text-red-600 text-sm" colspan="2">${quyCon}</td>
            <td class="p-2 border" colspan="2"></td>
        </tr>
    `;
}

function updateM2Score(group, key, val) {
    if(group === 'A') window.m2ScoresA[key] = val;
    else window.m2ScoresB[key] = val;
    renderM2(); autoBackupData(); if(window.syncToFirebase) window.syncToFirebase();
}

function saveTeamData() {
    localStorage.setItem('pb_minigame_team_standalone_data', JSON.stringify(window.minigameTeamData));
}

function renameTournament() {
    const newName = prompt("Nhập tên giải đấu team mới:", window.minigameTeamData.tourneyName);
    if (newName && newName.trim() !== "") {
        window.minigameTeamData.tourneyName = newName.trim();
        saveTeamData();
        renderHeaderNameTeam();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function renderHeaderNameTeam() {
    const el = document.getElementById('current-tourney-name');
    if(el) el.innerText = window.minigameTeamData.tourneyName || "MINIGAME TEAM A & B";
}

function addTeamMember(team) {
    const name = prompt(`Nhập tên VĐV mới cho Team ${team}:`);
    if (name && name.trim() !== '') {
        if (team === 'A') {
            window.minigameTeamData.teamA.push(name.trim());
        } else {
            window.minigameTeamData.teamB.push(name.trim());
        }
        saveTeamData();
        renderTeamListsTeam();
        renderM1ScheduleTeam();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function removeTeamMember(team, index) {
    if (confirm("Bạn muốn xóa VĐV này khỏi team?")) {
        if (team === 'A') {
            window.minigameTeamData.teamA.splice(index, 1);
        } else {
            window.minigameTeamData.teamB.splice(index, 1);
        }
        saveTeamData();
        renderTeamListsTeam();
        renderM1ScheduleTeam();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function moveTeamMember(team, index, dir) {
    const list = team === 'A' ? window.minigameTeamData.teamA : window.minigameTeamData.teamB;
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    saveTeamData();
    renderTeamListsTeam();
    renderM1ScheduleTeam();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function openTeamEditModal(team, index) {
    const list = team === 'A' ? window.minigameTeamData.teamA : window.minigameTeamData.teamB;
    const name = list[index];
    document.getElementById('edit-team-group').value = team;
    document.getElementById('edit-team-index').value = index;
    document.getElementById('edit-team-name-input').value = name;
    document.getElementById('team-edit-modal').classList.remove('hidden');
}

function closeTeamEditModal() {
    document.getElementById('team-edit-modal').classList.add('hidden');
}

function saveTeamMemberEdit() {
    const team = document.getElementById('edit-team-group').value;
    const index = parseInt(document.getElementById('edit-team-index').value);
    const newName = document.getElementById('edit-team-name-input').value.trim();
    if (!newName) return alert('Vui lòng nhập tên VĐV!');

    if (team === 'A') window.minigameTeamData.teamA[index] = newName;
    else window.minigameTeamData.teamB[index] = newName;

    saveTeamData();
    closeTeamEditModal();
    renderTeamListsTeam();
    renderM1ScheduleTeam();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function renderTeamListsTeam() {
    const listA = document.getElementById('team-A-list');
    const listB = document.getElementById('team-B-list');
    const countA = document.getElementById('team-A-count');
    const countB = document.getElementById('team-B-count');
    
    if(!listA || !listB) return;

    countA.innerText = window.minigameTeamData.teamA.length;
    countB.innerText = window.minigameTeamData.teamB.length;

    listA.innerHTML = window.minigameTeamData.teamA.map((name, i) => `
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200 shadow-sm">
            <span class="text-xs font-bold text-blue-700"><span class="w-6 inline-block">${i + 1}.</span> <span class="player-tag">${name}</span></span>
            <div class="flex items-center gap-1">
                <button onclick="moveTeamMember('A', ${i}, -1)" ${i === 0 ? 'disabled' : ''} class="text-slate-600 hover:text-slate-900 text-xs px-1.5 p-1 rounded hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Di chuyển lên"><i class="fa-solid fa-arrow-up"></i></button>
                <button onclick="moveTeamMember('A', ${i}, 1)" ${i === window.minigameTeamData.teamA.length - 1 ? 'disabled' : ''} class="text-slate-600 hover:text-slate-900 text-xs px-1.5 p-1 rounded hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Di chuyển xuống"><i class="fa-solid fa-arrow-down"></i></button>
                <button onclick="openTeamEditModal('A', ${i})" class="text-blue-600 hover:text-blue-800 text-xs px-1.5 p-1 rounded hover:bg-blue-50 transition" title="Sửa tên VĐV"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removeTeamMember('A', ${i})" class="text-red-500 hover:text-red-700 text-xs px-1.5 p-1 rounded hover:bg-red-50 transition" title="Xóa VĐV"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    listB.innerHTML = window.minigameTeamData.teamB.map((name, i) => `
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-200 shadow-sm">
            <span class="text-xs font-bold text-orange-700"><span class="w-6 inline-block">${i + 1}.</span> <span class="player-tag">${name}</span></span>
            <div class="flex items-center gap-1">
                <button onclick="moveTeamMember('B', ${i}, -1)" ${i === 0 ? 'disabled' : ''} class="text-slate-600 hover:text-slate-900 text-xs px-1.5 p-1 rounded hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Di chuyển lên"><i class="fa-solid fa-arrow-up"></i></button>
                <button onclick="moveTeamMember('B', ${i}, 1)" ${i === window.minigameTeamData.teamB.length - 1 ? 'disabled' : ''} class="text-slate-600 hover:text-slate-900 text-xs px-1.5 p-1 rounded hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent" title="Di chuyển xuống"><i class="fa-solid fa-arrow-down"></i></button>
                <button onclick="openTeamEditModal('B', ${i})" class="text-blue-600 hover:text-blue-800 text-xs px-1.5 p-1 rounded hover:bg-blue-50 transition" title="Sửa tên VĐV"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removeTeamMember('B', ${i})" class="text-red-500 hover:text-red-700 text-xs px-1.5 p-1 rounded hover:bg-red-50 transition" title="Xóa VĐV"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addM1Match() {
    const matches = window.minigameTeamData.matches;
    const newId = matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1;
    matches.push({
        id: newId,
        luot: Math.ceil(newId / 3),
        san: ((newId - 1) % 3) + 1,
        noidung: "Đôi Nam",
        a1: window.minigameTeamData.teamA[0] || "",
        a2: window.minigameTeamData.teamA[1] || "",
        scoreA: "",
        scoreB: "",
        b1: window.minigameTeamData.teamB[0] || "",
        b2: window.minigameTeamData.teamB[1] || "",
        note: ""
    });
    saveTeamData();
    renderM1ScheduleTeam();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function deleteM1Match(index) {
    if (confirm("Bạn có chắc chắn muốn xóa trận đấu này?")) {
        window.minigameTeamData.matches.splice(index, 1);
        saveTeamData();
        renderM1ScheduleTeam();
        autoBackupData();
        if(window.syncToFirebase) window.syncToFirebase();
    }
}

function updateMatchFieldTeam(index, field, value) {
    window.minigameTeamData.matches[index][field] = value;
    saveTeamData();
    renderM1ScheduleTeam();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function renderM1ScheduleTeam() {
    const tbody = document.getElementById('m1-schedule-body');
    const countEl = document.getElementById('m1-match-count');
    if(!tbody) return;

    const matches = window.minigameTeamData.matches;
    countEl.innerText = matches.length;

    let totalPlayed = 0;
    let teamAWins = 0;
    let teamBWins = 0;
    let totalDiffA = 0;
    let totalDiffB = 0;
    let totalPtsA = 0;
    let totalPtsB = 0;

    let playerKeoStats = {};
    [...window.minigameTeamData.teamA, ...window.minigameTeamData.teamB].forEach(v => {
        playerKeoStats[v] = { name: v, team: window.minigameTeamData.teamA.includes(v) ? 'A' : 'B', played: 0, winK: 0, loseK: 0, total: 0 };
    });

    tbody.innerHTML = matches.map((m, index) => {
        const sA = (m.scoreA !== "" && m.scoreA !== null) ? parseInt(m.scoreA) : null;
        const sB = (m.scoreB !== "" && m.scoreB !== null) ? parseInt(m.scoreB) : null;

        let winnerText = "-";
        let diffText = "-";
        let ptsA = 0;
        let ptsB = 0;
        let statusText = m.note || "Chờ đấu";

        if (sA !== null && sB !== null && !isNaN(sA) && !isNaN(sB)) {
            totalPlayed++;
            const diff = sA - sB;
            diffText = (diff > 0 ? "+" : "") + diff;

            let pairA = [m.a1, m.a2].filter(Boolean);
            let pairB = [m.b1, m.b2].filter(Boolean);
            const keoCfg = getM1KeoConfig();
            const isHam = (sA === 0 || sB === 0);
            const effWin = isHam ? (keoCfg.win > 0 ? keoCfg.win * 2 : 0) : keoCfg.win;
            const effLose = isHam ? keoCfg.lose * 2 : keoCfg.lose;

            if (sA > sB) {
                winnerText = "<span class='txt-win'>Team A</span>";
                ptsA = 1;
                teamAWins++;

                pairA.forEach(p => addM1Keo(playerKeoStats, p, true, effWin));
                pairB.forEach(p => addM1Keo(playerKeoStats, p, false, effLose));
            } else if (sB > sA) {
                winnerText = "<span class='txt-lose'>Team B</span>";
                ptsB = 1;
                teamBWins++;

                pairB.forEach(p => addM1Keo(playerKeoStats, p, true, effWin));
                pairA.forEach(p => addM1Keo(playerKeoStats, p, false, effLose));
            } else {
                winnerText = "<span class='text-amber-600 font-bold'>Hòa</span>";
            }

            totalDiffA += diff;
            totalDiffB += (-diff);
            totalPtsA += ptsA;
            totalPtsB += ptsB;
            statusText = "<span class='text-emerald-600 font-bold'>Đã Xong</span>";
        }

        return `
            <tr>
                <td class="font-bold text-center">${index + 1}</td>
                <td><input type="number" class="text-center" value="${m.luot}" onchange="updateMatchFieldTeam(${index}, 'luot', this.value)"></td>
                <td><input type="number" class="text-center" value="${m.san}" onchange="updateMatchFieldTeam(${index}, 'san', this.value)"></td>
                <td><input type="text" class="text-center font-semibold" value="${m.noidung || ''}" onchange="updateMatchFieldTeam(${index}, 'noidung', this.value)"></td>

                <td>
                    <select onchange="updateMatchFieldTeam(${index}, 'a1', this.value)" class="font-semibold text-blue-900">
                        <option value="">-- Chọn VĐV --</option>
                        ${window.minigameTeamData.teamA.map(p => `<option value="${p}" ${m.a1 === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select onchange="updateMatchFieldTeam(${index}, 'a2', this.value)" class="font-semibold text-blue-900">
                        <option value="">-- Chọn VĐV --</option>
                        ${window.minigameTeamData.teamA.map(p => `<option value="${p}" ${m.a2 === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </td>

                <td class="text-center">
                    <input type="number" class="score-input" value="${m.scoreA ?? ''}" onchange="updateMatchFieldTeam(${index}, 'scoreA', this.value)">
                </td>
                <td class="font-bold text-slate-400 text-center">VS</td>
                <td class="text-center">
                    <input type="number" class="score-input" value="${m.scoreB ?? ''}" onchange="updateMatchFieldTeam(${index}, 'scoreB', this.value)">
                </td>

                <td>
                    <select onchange="updateMatchFieldTeam(${index}, 'b1', this.value)" class="font-semibold text-orange-900">
                        <option value="">-- Chọn VĐV --</option>
                        ${window.minigameTeamData.teamB.map(p => `<option value="${p}" ${m.b1 === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select onchange="updateMatchFieldTeam(${index}, 'b2', this.value)" class="font-semibold text-orange-900">
                        <option value="">-- Chọn VĐV --</option>
                        ${window.minigameTeamData.teamB.map(p => `<option value="${p}" ${m.b2 === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </td>

                <td class="text-center">${winnerText}</td>
                <td class="text-center font-bold">${diffText}</td>
                <td class="text-center font-bold text-blue-700">${ptsA}</td>
                <td class="text-center font-bold text-orange-700">${ptsB}</td>
                <td class="text-center text-xs">${statusText}</td>
                <td class="text-center">
                    <button onclick="deleteM1Match(${index})" class="text-red-500 hover:text-red-700 p-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');

    renderM1SummaryTeam(playerKeoStats);
}

function ensureM1KeoState() {
    const d = window.minigameTeamData;
    if (!d.keoMode) d.keoMode = 'default';
    if (d.customWin === undefined) d.customWin = 5;
    if (d.customLose === undefined) d.customLose = -15;
    if (!d.payStatus || typeof d.payStatus !== 'object') d.payStatus = {};
    if (!d.btcOption) d.btcOption = 'YES';
}

function getM1KeoConfig() {
    ensureM1KeoState();
    const d = window.minigameTeamData;
    if (d.keoMode === 'k0') return { win: 0, lose: 0 };
    if (d.keoMode === 'k25') return { win: 0, lose: -25 };
    if (d.keoMode === 'free') {
        let w = parseFloat(d.customWin) || 0;
        let l = parseFloat(d.customLose) || 0;
        if (l > 0) l = -l;
        return { win: w, lose: l };
    }
    return { win: 5, lose: -15 };
}

function addM1Keo(stats, name, isWin, amt) {
    const st = stats[name];
    if (!st) return;
    st.played++;
    if (isWin) st.winK += amt; else st.loseK += amt;
    st.total += amt;
}

function persistM1() {
    saveTeamData();
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function setM1KeoMode(mode) {
    ensureM1KeoState();
    window.minigameTeamData.keoMode = mode;
    persistM1();
    renderM1ScheduleTeam();
}

function setM1CustomKeo() {
    ensureM1KeoState();
    window.minigameTeamData.customWin = parseFloat(document.getElementById('m1-keo-custom-win').value) || 0;
    window.minigameTeamData.customLose = parseFloat(document.getElementById('m1-keo-custom-lose').value) || 0;
    persistM1();
    renderM1ScheduleTeam();
}

function checkM1AdminPassword() {
    const inputPass = document.getElementById('m1-admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        alert("🔑 Xác thực Admin thành công!");
        refreshAdminBadgesM1();
        if (typeof refreshAdminBadgesM2 === 'function') refreshAdminBadgesM2();
        if (typeof renderM2 === 'function') renderM2();
        renderM1ScheduleTeam();
        if (typeof renderDayDetailView === 'function') renderDayDetailView();
        if (typeof renderHomeClosestDateView === 'function') renderHomeClosestDateView();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
}

function refreshAdminBadgesM1() {
    const badge = document.getElementById('m1-admin-status-badge');
    if (!badge) return;
    if (window.isAdminUnlocked) {
        badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
        badge.className = "text-xs font-bold text-emerald-700 flex items-center gap-1";
    } else {
        badge.innerHTML = `<i class="fa-solid fa-lock text-red-500"></i> Mở Khóa Admin Tích Nộp:`;
        badge.className = "text-xs font-bold text-slate-600 flex items-center gap-1";
    }
}

function toggleM1Payment(name) {
    if (!window.isAdminUnlocked) {
        alert("🔒 Bạn cần nhập Pass Admin ở phía trên!");
        return;
    }
    ensureM1KeoState();
    const ps = window.minigameTeamData.payStatus;
    ps[name] = !ps[name];
    persistM1();
    renderM1ScheduleTeam();
}

function setM1BtcOption(val) {
    ensureM1KeoState();
    window.minigameTeamData.btcOption = val;
    persistM1();
    renderM1ScheduleTeam();
}

function renderM1SummaryTeam(playerKeoStats) {
    const summaryBody = document.getElementById('m1-keo-summary-body');
    if (!summaryBody) return;
    ensureM1KeoState();

    const modeSel = document.getElementById('m1-keo-mode-select');
    if (modeSel) modeSel.value = window.minigameTeamData.keoMode;
    const customBox = document.getElementById('m1-keo-custom-box');
    if (customBox) {
        if (window.minigameTeamData.keoMode === 'free') { customBox.classList.remove('hidden'); customBox.classList.add('flex'); }
        else { customBox.classList.add('hidden'); customBox.classList.remove('flex'); }
    }
    const cw = document.getElementById('m1-keo-custom-win');
    const cl = document.getElementById('m1-keo-custom-lose');
    if (cw && document.activeElement !== cw) cw.value = window.minigameTeamData.customWin;
    if (cl && document.activeElement !== cl) cl.value = window.minigameTeamData.customLose;
    refreshAdminBadgesM1();

    const payStatus = window.minigameTeamData.payStatus;
    const disabledAttr = window.isAdminUnlocked ? '' : 'disabled title="Cần mật khẩu Admin để sửa"';

    let sumBringBack = 0, sumThucThu = 0, sumAmThucTe = 0;
    let rows = '';

    Object.values(playerKeoStats).forEach(st => {
        if (st.played <= 0) return;
        const isPaid = !!payStatus[st.name];

        let bringBack = 0;
        if (st.played >= 4 && st.total > 0) { bringBack = st.total; sumBringBack += bringBack; }
        if (st.total < 0) { sumAmThucTe += st.total; if (isPaid) sumThucThu += Math.abs(st.total); }

        let noteText = "";
        if (st.total < 0) {
            noteText = isPaid ? `<span class="note-paid">Đã nộp</span>` : `<span class="note-unpaid">Chưa nộp</span>`;
        } else if (st.total > 0) {
            noteText = isPaid ? `<span class="note-paid">Đã nhận</span>` : `<span class="note-unpaid">Chưa nhận</span>`;
        }

        const safeName = String(st.name).replace(/'/g, "\\'");
        rows += `
            <tr class="hover:bg-slate-50">
                <td class="p-2 border text-left whitespace-nowrap pl-3">
                    <span class="player-tag">${st.name}</span>
                    <span class="ml-1 text-[10px] font-black ${st.team === 'A' ? 'text-blue-600' : 'text-orange-600'}">(${st.team})</span>
                </td>
                <td class="p-2 border">${st.played}</td>
                <td class="p-2 border txt-win">${st.winK > 0 ? st.winK : ''}</td>
                <td class="p-2 border txt-lose">${st.loseK < 0 ? st.loseK : ''}</td>
                <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? bringBack : ''}</td>
                <td class="p-2 border font-extrabold ${st.total < 0 ? 'txt-lose' : (st.total > 0 ? 'txt-win' : '')}">${st.total}</td>
                <td class="p-2 border bg-amber-50/30">
                    <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="toggleM1Payment('${safeName}')" class="w-4 h-4 cursor-pointer accent-emerald-600">
                </td>
                <td class="p-2 border whitespace-nowrap">${noteText}</td>
            </tr>
        `;
    });

    if (!rows) {
        rows = `<tr><td colspan="8" class="p-4 text-center text-slate-400 font-normal">Chưa có trận nào nhập tỷ số để thống kê kèo.</td></tr>`;
    }

    const btcThuVe = sumAmThucTe + sumBringBack;
    const quyCon = sumThucThu - Math.abs(btcThuVe);
    const currentOption = window.minigameTeamData.btcOption || 'YES';

    summaryBody.innerHTML = rows + `
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 whitespace-nowrap pl-3">TỔNG BTC THU VỀ</td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border"></td>
            <td class="p-2 border text-blue-700">${sumBringBack}</td>
            <td class="p-2 border text-red-600">${btcThuVe}</td>
            <td class="p-2 border text-blue-700">${sumThucThu}</td>
            <td class="p-2 border whitespace-nowrap">
                <select onchange="setM1BtcOption(this.value)" class="text-xs font-bold p-1 border rounded bg-white text-emerald-700 outline-none">
                    <option value="YES" ${currentOption === 'YES' ? 'selected' : ''}>YES (Chuyển tổng)</option>
                    <option value="NO" ${currentOption === 'NO' ? 'selected' : ''}>NO (Không chuyển)</option>
                </select>
            </td>
        </tr>
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn</td>
            <td class="p-2 border text-red-600 text-sm" colspan="2">${quyCon}</td>
            <td class="p-2 border" colspan="2"></td>
        </tr>
    `;
}

function exportToExcelTeam() {
    const exportData = window.minigameTeamData.matches.map((m, i) => ({
        "STT": i + 1,
        "Lượt": m.luot,
        "Sân": m.san,
        "Nội Dung": m.noidung,
        "Team A - VĐV 1": m.a1,
        "Team A - VĐV 2": m.a2,
        "Tỷ Số A": m.scoreA,
        "Tỷ Số B": m.scoreB,
        "Team B - VĐV 1": m.b1,
        "Team B - VĐV 2": m.b2,
        "Ghi Chú": m.note
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minigame_Team");
    XLSX.writeFile(wb, `LichThiDau_Team_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function renderMinigameTeamTab() {
    renderHeaderNameTeam();
    renderTeamListsTeam();
    renderM1ScheduleTeam();
}

function autoBackupData() {
    try {
        const getVal = (id) => document.getElementById(id)?.value || "";
        const backupData = {
            appName: "CLB-PICKLEBALL-CMTD",
            exportDate: new Date().toISOString(),
            players: window.players,
            createdMinigames: window.createdMinigames,
            currentBracketMinigameId: window.currentBracketMinigameId,
            minigameTeamData: window.minigameTeamData,
            m2PairsA: window.m2PairsA,
            m2PairsB: window.m2PairsB,
            m2ScoresA: window.m2ScoresA,
            m2ScoresB: window.m2ScoresB,
            m2KeoState: window.m2KeoState,
            dates: window.dates,
            matchesData: window.matchesData,
            dateKeoMode: window.dateKeoMode,
            paymentStatus: window.paymentStatus,
            activeQuarterColumns: window.activeQuarterColumns,
            initialFund: window.initialFund,
            fundFeeStatus: window.fundFeeStatus,
            fundIncomes: window.fundIncomes,
            fundExpenses: window.fundExpenses,
            autoIncomeNotes: window.autoIncomeNotes,
            knockoutScores: {
                bk1: [getVal('bk1-s1'), getVal('bk1-s2')],
                bk2: [getVal('bk2-s1'), getVal('bk2-s2')],
                t3:  [getVal('t3-s1'),  getVal('t3-s2')],
                ck:  [getVal('ck-s1'),  getVal('ck-s2')]
            }
        };
        localStorage.setItem("auto_backup_minigame", JSON.stringify(backupData));
    } catch (err) { console.error("Lỗi autoBackup:", err); }
}

function restoreAutoBackup(silent = false) {
    const rawData = localStorage.getItem("auto_backup_minigame");
    if (!rawData) { if (!silent) alert("Không tìm thấy bản sao lưu!"); return; }
    try {
        const data = JSON.parse(rawData);
        if (data.players) window.players = data.players;
        if (data.createdMinigames) window.createdMinigames = data.createdMinigames;
        if (data.currentBracketMinigameId) window.currentBracketMinigameId = data.currentBracketMinigameId;
        if (data.minigameTeamData) {
            window.minigameTeamData = data.minigameTeamData;
            saveTeamData();
        }
        if (data.m2PairsA) window.m2PairsA = data.m2PairsA;
        if (data.m2PairsB) window.m2PairsB = data.m2PairsB;
        if (data.m2ScoresA) window.m2ScoresA = data.m2ScoresA;
        if (data.m2ScoresB) window.m2ScoresB = data.m2ScoresB;
        if (data.m2KeoState) window.m2KeoState = data.m2KeoState;
        if (data.dates) window.dates = data.dates;
        if (data.matchesData) window.matchesData = data.matchesData;
        if (data.dateKeoMode) window.dateKeoMode = data.dateKeoMode;
        if (data.paymentStatus) window.paymentStatus = data.paymentStatus;
        if (data.activeQuarterColumns) window.activeQuarterColumns = data.activeQuarterColumns;
        if (data.initialFund !== undefined) window.initialFund = data.initialFund;
        if (data.fundFeeStatus) window.fundFeeStatus = data.fundFeeStatus;
        if (data.fundIncomes) window.fundIncomes = data.fundIncomes;
        if (data.fundExpenses) window.fundExpenses = data.fundExpenses;
        if (data.autoIncomeNotes) window.autoIncomeNotes = data.autoIncomeNotes;

        refreshAllViews();
        if (!silent) alert("Đã nạp thành công dữ liệu từ Auto-Backup!");
    } catch (err) { console.error("Lỗi restoreAutoBackup:", err); }
}

function exportBackupJSON() {
    const getVal = (id) => document.getElementById(id)?.value || "";
    const backupData = {
        appName: "CLB-PICKLEBALL-CMTD",
        exportDate: new Date().toISOString(),
        players: window.players,
        createdMinigames: window.createdMinigames,
        currentBracketMinigameId: window.currentBracketMinigameId,
        minigameTeamData: window.minigameTeamData,
        m2PairsA: window.m2PairsA,
        m2PairsB: window.m2PairsB,
        m2ScoresA: window.m2ScoresA,
        m2ScoresB: window.m2ScoresB,
        m2KeoState: window.m2KeoState,
        dates: window.dates,
        matchesData: window.matchesData,
        dateKeoMode: window.dateKeoMode,
        paymentStatus: window.paymentStatus,
        activeQuarterColumns: window.activeQuarterColumns,
        initialFund: window.initialFund,
        fundFeeStatus: window.fundFeeStatus,
        fundIncomes: window.fundIncomes,
        fundExpenses: window.fundExpenses,
        autoIncomeNotes: window.autoIncomeNotes,
        knockoutScores: {
            bk1: [getVal('bk1-s1'), getVal('bk1-s2')],
            bk2: [getVal('bk2-s1'), getVal('bk2-s2')],
            t3:  [getVal('t3-s1'),  getVal('t3-s2')],
            ck:  [getVal('ck-s1'),  getVal('ck-s2')]
        }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `CMTD_Pickleball_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click(); anchor.remove();
}

function triggerRestoreInput() { document.getElementById('restore-file-input').click(); }

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.players) window.players = data.players;
            if (data.createdMinigames) window.createdMinigames = data.createdMinigames;
            if (data.currentBracketMinigameId) window.currentBracketMinigameId = data.currentBracketMinigameId;
            if (data.minigameTeamData) {
                window.minigameTeamData = data.minigameTeamData;
                saveTeamData();
            }
            if (data.m2PairsA) window.m2PairsA = data.m2PairsA;
            if (data.m2PairsB) window.m2PairsB = data.m2PairsB;
            if (data.m2ScoresA) window.m2ScoresA = data.m2ScoresA;
            if (data.m2ScoresB) window.m2ScoresB = data.m2ScoresB;
            if (data.m2KeoState) window.m2KeoState = data.m2KeoState;
            if (data.dates) window.dates = data.dates;
            if (data.matchesData) window.matchesData = data.matchesData;
            if (data.dateKeoMode) window.dateKeoMode = data.dateKeoMode;
            if (data.paymentStatus) window.paymentStatus = data.paymentStatus;
            if (data.activeQuarterColumns) window.activeQuarterColumns = data.activeQuarterColumns;
            if (data.initialFund !== undefined) window.initialFund = data.initialFund;
            if (data.fundFeeStatus) window.fundFeeStatus = data.fundFeeStatus;
            if (data.fundIncomes) window.fundIncomes = data.fundIncomes;
            if (data.fundExpenses) window.fundExpenses = data.fundExpenses;
            if (data.autoIncomeNotes) window.autoIncomeNotes = data.autoIncomeNotes;

            refreshAllViews();
            autoBackupData();
            if (window.syncToFirebase) window.syncToFirebase();
            alert("Phục hồi dữ liệu từ file backup thành công!");
        } catch (err) { alert("Lỗi đọc file backup!"); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function changeTheme(themeClass) {
    document.getElementById('app-body').className = `${themeClass} min-h-screen flex flex-col font-sans transition-colors duration-300 text-slate-800`;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-slate-700', 'text-yellow-400'));
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('bg-slate-700', 'text-yellow-400');

    if(tabId === 'home') renderHomeClosestDateView();
    if(tabId === 'tonghop') renderTongHopTab();
    if(tabId === 'day_detail') renderDayDetailView();
    if(tabId === 'fund_manager') updateFundDashboard();
    if(tabId === 'minigame1') renderMinigameTeamTab();
    if(tabId === 'minigame2') renderDynamicMinigameDropdowns();
}

function refreshAllViews() {
    renderPlayers();
    renderMinigameTeamTab();
    renderM2();
    renderDatesMenuList();
    renderDayDetailView();
    renderTongHopTab();
    updateFundDashboard();
    renderHomeClosestDateView();
    renderDynamicMinigameDropdowns();
}

function renderPlayers() {
    const tbody = document.getElementById('player-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    window.players.forEach((p, idx) => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center font-bold">${idx + 1}</td>
                <td class="p-3 border"><span class="player-tag text-base">${p.name}</span></td>
                <td class="p-3 border text-center font-semibold">${p.gender}</td>
                <td class="p-3 border text-center">
                    <button onclick="editPlayer(${p.id})" class="text-blue-600 hover:text-blue-800 mr-3 font-bold text-xs"><i class="fa-solid fa-pen"></i> Sửa</button>
                    <button onclick="deletePlayer(${p.id})" class="text-red-600 hover:text-red-800 font-bold text-xs"><i class="fa-solid fa-trash"></i> Xoá</button>
                </td>
            </tr>
        `;
    });
}

function openPlayerModal(isEdit = false) {
    document.getElementById('player-modal').classList.remove('hidden');
    if(!isEdit) {
        document.getElementById('modal-title').innerText = 'Thêm Pick Thủ Mới';
        document.getElementById('player-id').value = '';
        document.getElementById('player-name').value = '';
        document.getElementById('player-gender').value = 'Nam';
    }
}
function closePlayerModal() { document.getElementById('player-modal').classList.add('hidden'); }

function savePlayer() {
    const id = document.getElementById('player-id').value;
    const name = document.getElementById('player-name').value.trim();
    const gender = document.getElementById('player-gender').value;
    if(!name) return alert('Vui lòng nhập tên VĐV!');

    if(id) {
        const player = window.players.find(p => p.id == id);
        if(player) { player.name = name; player.gender = gender; }
    } else {
        window.players.push({ id: Date.now(), name: name, gender: gender });
    }

    savePlayersData();
    closePlayerModal(); 
    refreshAllViews();
}

function editPlayer(id) {
    const p = window.players.find(item => item.id == id);
    if(p) {
        document.getElementById('modal-title').innerText = 'Sửa Thông Tin Pick Thủ';
        document.getElementById('player-id').value = p.id;
        document.getElementById('player-name').value = p.name;
        document.getElementById('player-gender').value = p.gender;
        openPlayerModal(true);
    }
}

function deletePlayer(id) {
    if(confirm('Bạn có chắc muốn xoá VĐV này?')) {
        window.players = window.players.filter(p => p.id != id);
        savePlayersData();
        refreshAllViews();
    }
}

window.onload = function() {
    restoreAutoBackup(true);
    refreshAllViews();
};
// ==========================================
// XỬ LÝ PICK THỦ XIN NGHỈ + CỘT XIN NGHỈ (BẢNG TỔNG HỢP KÈO NGÀY)
// ------------------------------------------
// Dữ liệu lưu trong window.paymentStatus[<ngày>] (tự đồng bộ Firebase + sao lưu):
//   absentCount     : số VĐV nghỉ hôm đó (0, 2, 3, 4)
//   absentPlayers   : mảng tên VĐV nghỉ (độ dài = absentCount, '' = chưa chọn)
//   absentStatusMap : { tênVĐV: 'unexcused' (Nộp phạt) | 'excused' (Không nộp phạt) }
// Mức phạt: window.ABSENT_FINE_K (mặc định 30K)
// ==========================================
var ABSENT_COUNT_OPTIONS = [0, 2, 3, 4];

function escAbsentAttr(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAbsentJs(str) {
    return String(str == null ? '' : str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function getDayStatusObj(dateStr, create) {
    if (!window.paymentStatus) window.paymentStatus = {};
    let o = window.paymentStatus[dateStr];
    if (!o || typeof o !== 'object') {
        if (!create) return null;
        o = {};
        window.paymentStatus[dateStr] = o;
    }
    return o;
}

// Đọc cấu hình VĐV nghỉ của 1 ngày (đã chuẩn hóa)
function getAbsentInfo(dateStr) {
    const o = getDayStatusObj(dateStr, false) || {};
    let players = Array.isArray(o.absentPlayers) ? o.absentPlayers.map(x => x || '') : [];
    let count = parseInt(o.absentCount);
    if (isNaN(count)) count = players.filter(Boolean).length;
    while (players.length < count) players.push('');
    if (players.length > count) players = players.slice(0, count);
    return { count: count, players: players, status: o.absentStatusMap || {} };
}

// { tênVĐV: -30 (nộp phạt) | 0 (không nộp phạt) } - chỉ gồm VĐV nghỉ đã được chọn và còn trong danh sách
function getAbsentFineMap(dateStr) {
    const info = getAbsentInfo(dateStr);
    const valid = new Set((window.players || []).map(p => p && p.name).filter(Boolean));
    const fineK = Number(window.ABSENT_FINE_K) || 30;
    const map = {};
    info.players.forEach(name => {
        if (!name || !valid.has(name)) return;
        map[name] = (info.status[name] === 'excused') ? 0 : -fineK;
    });
    return map;
}

function persistAbsentChange() {
    refreshAllViews();
    if (typeof autoBackupData === 'function') autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

// Chọn số lượng VĐV nghỉ: 0 / 2 / 3 / 4
function setAbsentCount(dateStr, val) {
    const n = Math.max(0, parseInt(val) || 0);
    const o = getDayStatusObj(dateStr, true);
    const info = getAbsentInfo(dateStr);
    let players = info.players.slice(0, n);
    while (players.length < n) players.push('');
    o.absentCount = n;
    o.absentPlayers = players;
    // dọn trạng thái của VĐV không còn nằm trong danh sách nghỉ
    const status = o.absentStatusMap || {};
    Object.keys(status).forEach(k => { if (!players.includes(k)) delete status[k]; });
    o.absentStatusMap = status;
    persistAbsentChange();
}

// Chọn VĐV nghỉ cho ô số slotIdx
function setAbsentPlayerSlot(dateStr, slotIdx, name) {
    const o = getDayStatusObj(dateStr, true);
    const info = getAbsentInfo(dateStr);
    const players = info.players.slice();
    if (slotIdx < 0 || slotIdx >= players.length) return;
    if (name && players.some((p, i) => i !== slotIdx && p === name)) {
        alert('VĐV này đã được chọn nghỉ ở ô khác!');
        refreshAllViews();
        return;
    }
    const oldName = players[slotIdx];
    players[slotIdx] = name || '';
    o.absentCount = info.count;
    o.absentPlayers = players;
    const status = o.absentStatusMap || {};
    if (oldName && oldName !== name && !players.includes(oldName)) delete status[oldName];
    if (name && !status[name]) status[name] = 'unexcused'; // mặc định: Nộp phạt
    o.absentStatusMap = status;
    persistAbsentChange();
}

// Chọn Nộp phạt / Không nộp phạt cho 1 VĐV nghỉ
function setAbsentStatus(dateStr, playerName, statusValue) {
    const o = getDayStatusObj(dateStr, true);
    if (!o.absentStatusMap) o.absentStatusMap = {};
    o.absentStatusMap[playerName] = (statusValue === 'excused') ? 'excused' : 'unexcused';
    persistAbsentChange();
}

// Ô "XIN NGHỈ" của 1 dòng VĐV trong bảng tổng hợp
function buildAbsentFineCell(dateStr, playerName, isAbsent, fine, withK) {
    if (!isAbsent) return `<td class="p-2 border bg-rose-50/20"></td>`;
    const fineK = Number(window.ABSENT_FINE_K) || 30;
    const unexcused = fine < 0;
    const amtText = unexcused ? (withK ? `${fine}K` : `${fine}`) : (withK ? '0K' : '0');
    const n = escAbsentJs(playerName);
    return `
        <td class="p-1.5 border bg-rose-50/40">
            <div class="flex flex-col items-center gap-0.5">
                <span class="font-extrabold ${unexcused ? 'txt-lose' : 'text-slate-500'}">${amtText}</span>
                <select onchange="setAbsentStatus('${escAbsentJs(dateStr)}', '${n}', this.value)" class="text-[10px] font-bold p-0.5 border rounded bg-white outline-none cursor-pointer ${unexcused ? 'text-red-600 border-red-300' : 'text-emerald-700 border-emerald-300'}">
                    <option value="unexcused" ${unexcused ? 'selected' : ''}>Nộp phạt (-${fineK}K)</option>
                    <option value="excused" ${!unexcused ? 'selected' : ''}>Không nộp phạt (0K)</option>
                </select>
            </div>
        </td>`;
}

// Dòng chọn VĐV xin nghỉ (chọn 2, 3 hoặc 4 VĐV) nằm trong bảng tổng hợp kèo ngày
function buildAbsentSelectorRow(dateStr, colspan) {
    const info = getAbsentInfo(dateStr);
    const d = escAbsentJs(dateStr);
    const names = (window.players || []).map(p => p && p.name).filter(Boolean);

    const countOpts = ABSENT_COUNT_OPTIONS.slice();
    if (!countOpts.includes(info.count)) { countOpts.push(info.count); countOpts.sort((a, b) => a - b); }
    const countSelect = `
        <select onchange="setAbsentCount('${d}', this.value)" class="text-xs font-bold p-1 border rounded bg-white text-rose-700 border-rose-300 outline-none cursor-pointer">
            ${countOpts.map(n => `<option value="${n}" ${info.count === n ? 'selected' : ''}>${n === 0 ? 'Không có VĐV nghỉ' : n + ' VĐV nghỉ'}</option>`).join('')}
        </select>`;

    const slots = info.players.map((cur, i) => {
        const opts = names.map(nm => {
            const takenElsewhere = info.players.some((p, j) => j !== i && p === nm);
            return `<option value="${escAbsentAttr(nm)}" ${cur === nm ? 'selected' : ''} ${takenElsewhere ? 'disabled' : ''}>${escAbsentAttr(nm)}</option>`;
        }).join('');
        return `
            <select onchange="setAbsentPlayerSlot('${d}', ${i}, this.value)" class="text-xs font-bold p-1 border rounded bg-white outline-none cursor-pointer ${cur ? 'text-slate-800 border-rose-300' : 'text-slate-400 border-slate-300'}">
                <option value="">-- Chọn VĐV nghỉ ${i + 1} --</option>
                ${opts}
            </select>`;
    }).join('');

    const fineK = Number(window.ABSENT_FINE_K) || 30;
    return `
        <tr class="bg-rose-50/70">
            <td class="p-2 border text-left" colspan="${colspan}">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="font-extrabold text-rose-700 text-xs whitespace-nowrap"><i class="fa-solid fa-user-clock"></i> VĐV XIN NGHỈ HÔM NAY:</span>
                    ${countSelect}
                    ${slots}
                    <span class="text-[10px] italic text-slate-500">VĐV được chọn sẽ hiện trong bảng; chọn "Nộp phạt" (-${fineK}K) hoặc "Không nộp phạt" ở cột XIN NGHỈ.</span>
                </div>
            </td>
        </tr>`;
}

// Thêm cột tiêu đề XIN NGHỈ (giữa TỔNG và THỰC TẾ) cho bảng tổng hợp ở tab Chi Tiết Ngày
// (tiêu đề bảng này nằm trong HTML nên bổ sung bằng JS, chỉ thêm 1 lần)
function ensureDaySummaryAbsentHeader(sumBody) {
    try {
        const table = sumBody && sumBody.closest ? sumBody.closest('table') : null;
        if (!table) return;
        const headRow = table.querySelector('thead tr');
        if (!headRow) return;
        const ths = Array.from(headRow.children);
        if (ths.some(t => t.getAttribute('data-col') === 'absent' || t.textContent.normalize('NFC').toUpperCase().includes('XIN NGHỈ'.normalize('NFC')))) return;
        let target = ths.find(t => /TH[ỰỰ]C\s*T[ẾẾ]/i.test(t.textContent.normalize('NFC')));
        const th = document.createElement('th');
        th.setAttribute('data-col', 'absent');
        th.className = 'p-2 border w-28 bg-rose-50 text-rose-800';
        th.textContent = 'XIN NGHỈ';
        if (target) headRow.insertBefore(th, target);
        else if (ths.length >= 7) headRow.insertBefore(th, ths[6]);
        else headRow.appendChild(th);
    } catch (e) { console.warn('ensureDaySummaryAbsentHeader:', e); }
}

// Gỡ ô chọn "Pick thủ nghỉ" cũ (multi-select #absent-players-select) nằm cạnh tiêu đề
// "Bảng tổng hợp kèo thu chi" ở tab Chi Tiết Ngày, để bảng giống các ngày khác và giống trang chủ.
// Việc chọn VĐV nghỉ nay thực hiện bằng dòng "VĐV XIN NGHỈ HÔM NAY" nằm trong bảng.
function removeLegacyAbsentBox() {
    try {
        const sel = document.getElementById('absent-players-select');
        if (!sel) return;
        const stopRe = new RegExp('tổng hợp|kèo|thu chi'.normalize('NFC'));
        let target = sel;
        while (target.parentElement) {
            const p = target.parentElement;
            if (['BODY', 'SECTION', 'TABLE', 'MAIN'].includes(p.tagName) || /^tab-/.test(p.id || '')) break;
            const clone = p.cloneNode(true);
            const inner = clone.querySelector('#absent-players-select');
            if (inner) inner.remove();
            const rest = (clone.textContent || '').replace(/\s+/g, ' ').trim().normalize('NFC').toLowerCase();
            if (stopRe.test(rest) || rest.length > 40) break; // đã chạm khung chứa tiêu đề bảng -> dừng
            target = p;
        }
        target.remove();
    } catch (e) { console.warn('removeLegacyAbsentBox:', e); }
}

// ---- Hàm cũ (giữ tên để tương thích) - nay dùng chung dữ liệu mới theo ngày đang chọn ----
function renderAbsentPlayersDropdown(currentDateData) {
    const selectEl = document.getElementById('absent-players-select');
    if (!selectEl) return;
    const info = getAbsentInfo(window.currentSelectedDate);
    selectEl.innerHTML = (window.players || []).map(player => {
        const playerName = typeof player === 'object' ? player.name : player;
        return `<option value="${escAbsentAttr(playerName)}" ${info.players.includes(playerName) ? 'selected' : ''}>${escAbsentAttr(playerName)}</option>`;
    }).join('');
}

function handleAbsentPlayersChange(selectElement) {
    const selected = Array.from(selectElement.selectedOptions).map(opt => opt.value);
    const o = getDayStatusObj(window.currentSelectedDate, true);
    o.absentCount = selected.length;
    o.absentPlayers = selected;
    const status = o.absentStatusMap || {};
    selected.forEach(name => { if (!status[name]) status[name] = 'unexcused'; });
    Object.keys(status).forEach(k => { if (!selected.includes(k)) delete status[k]; });
    o.absentStatusMap = status;
    persistAbsentChange();
}

function handleIndividualAbsentStatusChange(playerName, statusValue) {
    setAbsentStatus(window.currentSelectedDate, playerName, statusValue);
}
