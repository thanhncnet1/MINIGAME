/* ==========================================================================
   CLB-PICKLEBALL-CMTD SYSTEM - MAIN JAVASCRIPT LOGIC
   ========================================================================== */

// --- GLOBAL APP STATE & CONSTANTS ---
window.currentTab = 'home';
window.isAdminUnlocked = window.isAdminUnlocked || false;
window.ADMIN_PASSWORD = window.ADMIN_PASSWORD || "123456";

// App Theme Dynamic Switching
function changeTheme(themeClass) {
    const body = document.getElementById('app-body');
    if (body) {
        body.className = `${themeClass} min-h-screen flex flex-col font-sans transition-colors duration-300 text-slate-800`;
        localStorage.setItem('pb_app_theme', themeClass);
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('pb_app_theme') || 'bg-theme-slate';
    changeTheme(savedTheme);
}

// Global Tab Navigation
function showTab(tabId) {
    window.currentTab = tabId;
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    // Refresh dynamic components depending on active tab
    if (tabId === 'home') {
        renderHomeClosestDateView();
    } else if (tabId === 'players') {
        renderPlayersList();
    } else if (tabId === 'minigame1') {
        renderMinigame1();
    } else if (tabId === 'minigame2') {
        renderM2();
    } else if (tabId === 'fund_manager') {
        updateFundDashboard();
    } else if (tabId === 'tonghop') {
        renderTongHopView();
    } else if (tabId === 'day_detail') {
        renderDayDetailView();
    }

    closeAllDropdowns();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Dropdown Handling
function toggleMenu(menuId, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const isVisible = menu.classList.contains('show');
    closeAllDropdowns();
    if (!isVisible) {
        menu.classList.add('show');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}

// Back/Forward Navigation Event Handler
window.addEventListener('popstate', () => {
    showTab('home');
});

/* ==========================================================================
   1. MANAGE PICKLEBALL PLAYERS (PICK THỦ)
   ========================================================================== */
function renderPlayersList() {
    const tbody = document.getElementById('player-table-body');
    if (!tbody) return;

    if (!window.players || window.players.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">Chưa có VĐV nào trong hệ thống.</td></tr>`;
        return;
    }

    tbody.innerHTML = window.players.map((p, idx) => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-2 border text-center font-bold text-slate-500">${idx + 1}</td>
            <td class="p-2 border font-semibold text-slate-800">${p.name}</td>
            <td class="p-2 border text-center">
                <span class="px-2 py-0.5 text-xs font-bold rounded-full ${p.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">
                    ${p.gender}
                </span>
            </td>
            <td class="p-2 border text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="editPlayer(${p.id})" class="text-blue-600 hover:text-blue-800 p-1 font-bold text-xs">
                        <i class="fa-solid fa-pen"></i> Sửa
                    </button>
                    <button onclick="deletePlayer(${p.id})" class="text-red-500 hover:text-red-700 p-1 font-bold text-xs">
                        <i class="fa-solid fa-trash"></i> Xóa
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openPlayerModal(player = null) {
    const modal = document.getElementById('player-modal');
    if (!modal) return;

    if (player) {
        document.getElementById('modal-title').innerText = "Chỉnh Sửa Pick Thủ";
        document.getElementById('player-id').value = player.id;
        document.getElementById('player-name').value = player.name;
        document.getElementById('player-gender').value = player.gender || 'Nam';
    } else {
        document.getElementById('modal-title').innerText = "Thêm Pick Thủ Mới";
        document.getElementById('player-id').value = '';
        document.getElementById('player-name').value = '';
        document.getElementById('player-gender').value = 'Nam';
    }
    modal.classList.remove('hidden');
}

function closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.classList.add('hidden');
}

function savePlayer() {
    const id = document.getElementById('player-id').value;
    const name = document.getElementById('player-name').value.trim();
    const gender = document.getElementById('player-gender').value;

    if (!name) {
        alert("⚠️ Vui lòng nhập tên Pick Thủ!");
        return;
    }

    if (id) {
        const idx = window.players.findIndex(p => p.id == id);
        if (idx !== -1) {
            window.players[idx].name = name;
            window.players[idx].gender = gender;
        }
    } else {
        const newId = Date.now();
        window.players.push({ id: newId, name, gender });
    }

    savePlayersToStorage();
    closePlayerModal();
    renderPlayersList();
    refreshAllViews();
}

function editPlayer(id) {
    const player = window.players.find(p => p.id == id);
    if (player) openPlayerModal(player);
}

function deletePlayer(id) {
    if (confirm(" Bạn có chắc chắn muốn xóa Pick Thủ này khỏi danh sách CLB?")) {
        window.players = window.players.filter(p => p.id != id);
        savePlayersToStorage();
        renderPlayersList();
        refreshAllViews();
    }
}

function savePlayersToStorage() {
    localStorage.setItem('pb_players_list', JSON.stringify(window.players));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

/* ==========================================================================
   2. MINIGAME TEAM A & B MANAGEMENT
   ========================================================================== */
function renderMinigame1() {
    renderTeamMembers('A');
    renderTeamMembers('B');
    renderM1Schedule();
    renderM1KeoSummary();
}

function renameTournament() {
    const currentName = window.minigameTeamData.tourneyName || "MINIGAME TEAM A & B";
    const newName = prompt("Nhập tên mới cho Giải Minigame Team:", currentName);
    if (newName && newName.trim() !== "") {
        window.minigameTeamData.tourneyName = newName.trim();
        document.getElementById('current-tourney-name').innerText = newName.trim();
        saveM1ToStorage();
    }
}

function renderTeamMembers(team) {
    const listEl = document.getElementById(`team-${team}-list`);
    const countEl = document.getElementById(`team-${team}-count`);
    if (!listEl) return;

    const memberArray = team === 'A' ? window.minigameTeamData.teamA : window.minigameTeamData.teamB;
    if (countEl) countEl.innerText = memberArray.length;

    listEl.innerHTML = memberArray.map((name, idx) => `
        <div class="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
            <span class="font-bold text-xs text-slate-800">${idx + 1}. ${name}</span>
            <div class="flex items-center gap-1">
                <button onclick="openTeamEditModal('${team}', ${idx})" class="text-blue-600 hover:text-blue-800 text-xs px-1.5 py-0.5 font-bold"><i class="fa-solid fa-pen"></i></button>
                <button onclick="removeTeamMember('${team}', ${idx})" class="text-red-500 hover:text-red-700 text-xs px-1.5 py-0.5 font-bold"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addTeamMember(team) {
    const name = prompt(`Nhập tên VĐV mới cho Team ${team}:`);
    if (name && name.trim() !== '') {
        if (team === 'A') window.minigameTeamData.teamA.push(name.trim());
        else window.minigameTeamData.teamB.push(name.trim());

        saveM1ToStorage();
        renderMinigame1();
    }
}

function removeTeamMember(team, idx) {
    if (confirm(" Xóa VĐV này khỏi Team?")) {
        if (team === 'A') window.minigameTeamData.teamA.splice(idx, 1);
        else window.minigameTeamData.teamB.splice(idx, 1);

        saveM1ToStorage();
        renderMinigame1();
    }
}

function openTeamEditModal(team, idx) {
    const modal = document.getElementById('team-edit-modal');
    if (!modal) return;
    const name = team === 'A' ? window.minigameTeamData.teamA[idx] : window.minigameTeamData.teamB[idx];

    document.getElementById('edit-team-group').value = team;
    document.getElementById('edit-team-index').value = idx;
    document.getElementById('edit-team-name-input').value = name;
    modal.classList.remove('hidden');
}

function closeTeamEditModal() {
    const modal = document.getElementById('team-edit-modal');
    if (modal) modal.classList.add('hidden');
}

function saveTeamMemberEdit() {
    const team = document.getElementById('edit-team-group').value;
    const idx = parseInt(document.getElementById('edit-team-index').value);
    const newName = document.getElementById('edit-team-name-input').value.trim();

    if (!newName) return;

    if (team === 'A') window.minigameTeamData.teamA[idx] = newName;
    else window.minigameTeamData.teamB[idx] = newName;

    saveM1ToStorage();
    closeTeamEditModal();
    renderMinigame1();
}

function renderM1Schedule() {
    const tbody = document.getElementById('m1-schedule-body');
    const countEl = document.getElementById('m1-match-count');
    if (!tbody) return;

    const matches = window.minigameTeamData.matches || [];
    if (countEl) countEl.innerText = matches.length;

    tbody.innerHTML = matches.map((m, idx) => {
        const sA = m.scoreA !== "" && m.scoreA !== undefined ? parseInt(m.scoreA) : null;
        const sB = m.scoreB !== "" && m.scoreB !== undefined ? parseInt(m.scoreB) : null;

        let winner = "---";
        let diffText = "0";
        let pointsA = 0;
        let pointsB = 0;
        let statusTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Chưa đấu</span>`;

        if (sA !== null && sB !== null && !isNaN(sA) && !isNaN(sB)) {
            const diff = sA - sB;
            diffText = diff > 0 ? `+${diff}` : `${diff}`;

            if (sA > sB) {
                winner = "Đội A";
                pointsA = 1;
                statusTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">A Thắng</span>`;
            } else if (sB > sA) {
                winner = "Đội B";
                pointsB = 1;
                statusTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">B Thắng</span>`;
            } else {
                winner = "Hòa";
                statusTag = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">Hòa</span>`;
            }
        }

        return `
            <tr>
                <td class="text-center font-bold text-slate-600">${idx + 1}</td>
                <td class="text-center font-bold">${m.luot}</td>
                <td class="text-center font-bold">${m.san}</td>
                <td class="text-center font-semibold text-slate-700">${m.noidung}</td>
                <td class="player-cell">${generatePlayerSelectHTML('m1', idx, 'a1', m.a1, window.minigameTeamData.teamA)}</td>
                <td class="player-cell">${generatePlayerSelectHTML('m1', idx, 'a2', m.a2, window.minigameTeamData.teamA)}</td>
                <td class="text-center">
                    <input type="number" class="score-input" value="${m.scoreA !== undefined ? m.scoreA : ''}" onchange="updateM1Score(${idx}, 'scoreA', this.value)">
                </td>
                <td class="text-center font-black text-slate-400">VS</td>
                <td class="text-center">
                    <input type="number" class="score-input" value="${m.scoreB !== undefined ? m.scoreB : ''}" onchange="updateM1Score(${idx}, 'scoreB', this.value)">
                </td>
                <td class="player-cell">${generatePlayerSelectHTML('m1', idx, 'b1', m.b1, window.minigameTeamData.teamB)}</td>
                <td class="player-cell">${generatePlayerSelectHTML('m1', idx, 'b2', m.b2, window.minigameTeamData.teamB)}</td>
                <td class="text-center font-bold ${winner === 'Đội A' ? 'text-blue-600' : winner === 'Đội B' ? 'text-orange-600' : 'text-slate-500'}">${winner}</td>
                <td class="text-center font-bold">${diffText}</td>
                <td class="text-center font-bold text-blue-700">${pointsA}</td>
                <td class="text-center font-bold text-orange-700">${pointsB}</td>
                <td class="text-center">${statusTag}</td>
                <td class="text-center">
                    <button onclick="deleteM1Match(${idx})" class="text-red-500 hover:text-red-700 font-bold p-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function generatePlayerSelectHTML(type, matchIdx, field, currentValue, optionsList) {
    const list = optionsList && optionsList.length > 0 ? optionsList : window.players.map(p => p.name);
    return `
        <select onchange="updateMatchPlayer('${type}', ${matchIdx}, '${field}', this.value)" class="player-select-btn bg-slate-50 border rounded px-1 py-0.5 text-xs font-bold text-blue-900 outline-none w-full">
            <option value="">-- Chọn --</option>
            ${list.map(p => {
                const pName = typeof p === 'object' ? p.name : p;
                return `<option value="${pName}" ${pName === currentValue ? 'selected' : ''}>${pName}</option>`;
            }).join('')}
        </select>
    `;
}

function updateMatchPlayer(type, matchIdx, field, val) {
    if (type === 'm1') {
        window.minigameTeamData.matches[matchIdx][field] = val;
        saveM1ToStorage();
    }
}

function updateM1Score(matchIdx, field, val) {
    window.minigameTeamData.matches[matchIdx][field] = val === "" ? "" : parseInt(val);
    saveM1ToStorage();
    renderM1Schedule();
    renderM1KeoSummary();
}

function addM1Match() {
    const matches = window.minigameTeamData.matches || [];
    const newMatch = {
        id: matches.length + 1,
        luot: Math.floor(matches.length / 3) + 1,
        san: (matches.length % 3) + 1,
        noidung: "Đôi Nam",
        a1: window.minigameTeamData.teamA[0] || "",
        a2: window.minigameTeamData.teamA[1] || "",
        scoreA: "",
        scoreB: "",
        b1: window.minigameTeamData.teamB[0] || "",
        b2: window.minigameTeamData.teamB[1] || "",
        note: ""
    };

    window.minigameTeamData.matches.push(newMatch);
    saveM1ToStorage();
    renderM1Schedule();
}

function deleteM1Match(idx) {
    if (confirm(" Xóa trận đấu này khỏi lịch?")) {
        window.minigameTeamData.matches.splice(idx, 1);
        saveM1ToStorage();
        renderM1Schedule();
        renderM1KeoSummary();
    }
}

function checkM1AdminPassword() {
    const pass = document.getElementById('m1-admin-pass-input').value;
    if (pass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        const badge = document.getElementById('m1-admin-status-badge');
        if (badge) badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
        alert("🔑 Xác thực Admin thành công!");
        renderM1KeoSummary();
    } else {
        alert("❌ Mật khẩu không đúng!");
    }
}

function setM1KeoMode(mode) {
    window.minigameTeamData.keoMode = mode;
    const customBox = document.getElementById('m1-keo-custom-box');
    if (customBox) {
        if (mode === 'free') customBox.classList.remove('hidden');
        else customBox.classList.add('hidden');
    }
    saveM1ToStorage();
    renderM1KeoSummary();
}

function setM1CustomKeo() {
    const win = parseInt(document.getElementById('m1-keo-custom-win').value) || 0;
    const lose = parseInt(document.getElementById('m1-keo-custom-lose').value) || 0;
    window.minigameTeamData.customWin = win;
    window.minigameTeamData.customLose = lose;
    saveM1ToStorage();
    renderM1KeoSummary();
}

function renderM1KeoSummary() {
    const tbody = document.getElementById('m1-keo-summary-body');
    if (!tbody) return;

    const mode = window.minigameTeamData.keoMode || 'default';
    const matches = window.minigameTeamData.matches || [];
    const allPlayers = [...new Set([...window.minigameTeamData.teamA, ...window.minigameTeamData.teamB])];

    let playerStats = {};
    allPlayers.forEach(p => {
        playerStats[p] = { matchesCount: 0, winCount: 0, loseCount: 0, totalMoney: 0, paid: false };
    });

    matches.forEach(m => {
        const sA = parseInt(m.scoreA);
        const sB = parseInt(m.scoreB);
        if (isNaN(sA) || isNaN(sB)) return;

        let winVal = 5000;
        let loseVal = -15000;

        if (mode === 'k25') { winVal = 0; loseVal = -25000; }
        else if (mode === 'k0') { winVal = 0; loseVal = 0; }
        else if (mode === 'free') {
            winVal = window.minigameTeamData.customWin || 0;
            loseVal = -(window.minigameTeamData.customLose || 0);
        }

        // Tỷ số 0 = HẦM (Nhân đôi tiền thua)
        let isHamA = (sA === 0);
        let isHamB = (sB === 0);

        const playersA = [m.a1, m.a2];
        const playersB = [m.b1, m.b2];

        playersA.forEach(p => {
            if (p && playerStats[p]) {
                playerStats[p].matchesCount++;
                if (sA > sB) {
                    playerStats[p].winCount++;
                    playerStats[p].totalMoney += winVal;
                } else if (sB > sA) {
                    playerStats[p].loseCount++;
                    playerStats[p].totalMoney += isHamA ? loseVal * 2 : loseVal;
                }
            }
        });

        playersB.forEach(p => {
            if (p && playerStats[p]) {
                playerStats[p].matchesCount++;
                if (sB > sA) {
                    playerStats[p].winCount++;
                    playerStats[p].totalMoney += winVal;
                } else if (sA > sB) {
                    playerStats[p].loseCount++;
                    playerStats[p].totalMoney += isHamB ? loseVal * 2 : loseVal;
                }
            }
        });
    });

    tbody.innerHTML = allPlayers.map(pName => {
        const stat = playerStats[pName];
        const formattedMoney = stat.totalMoney.toLocaleString('vi-VN') + " ₫";
        const moneyClass = stat.totalMoney >= 0 ? 'txt-win' : 'txt-lose';

        return `
            <tr>
                <td class="p-2 border text-left pl-3 font-bold text-slate-800">${pName}</td>
                <td class="p-2 border font-bold">${stat.matchesCount}</td>
                <td class="p-2 border text-emerald-600 font-bold">${stat.winCount}</td>
                <td class="p-2 border text-red-600 font-bold">${stat.loseCount}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border bg-amber-50">
                    <input type="checkbox" ${stat.paid ? 'checked' : ''} ${window.isAdminUnlocked ? '' : 'disabled'} onchange="toggleM1PlayerPaid('${pName}', this.checked)" class="w-4 h-4 accent-emerald-600 cursor-pointer">
                </td>
                <td class="p-2 border font-bold ${stat.paid ? 'note-paid' : 'note-unpaid'}">${stat.paid ? 'ĐÃ NỘP' : 'CHƯA NỘP'}</td>
            </tr>
        `;
    }).join('');
}

function toggleM1PlayerPaid(pName, isChecked) {
    if (!window.minigameTeamData.paidStatus) window.minigameTeamData.paidStatus = {};
    window.minigameTeamData.paidStatus[pName] = isChecked;
    saveM1ToStorage();
    renderM1KeoSummary();
}

function saveM1ToStorage() {
    localStorage.setItem('pb_minigame_team_standalone_data', JSON.stringify(window.minigameTeamData));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function exportToExcelTeam() {
    if (typeof XLSX === 'undefined') {
        alert("⚠️ Thư viện XLSX chưa tải xong!");
        return;
    }
    const matches = window.minigameTeamData.matches || [];
    const sheetData = matches.map((m, idx) => ({
        "STT": idx + 1,
        "Lượt": m.luot,
        "Sân": m.san,
        "Nội dung": m.noidung,
        "Đội A - VĐV 1": m.a1,
        "Đội A - VĐV 2": m.a2,
        "Tỷ số A": m.scoreA,
        "Tỷ số B": m.scoreB,
        "Đội B - VĐV 1": m.b1,
        "Đội B - VĐV 2": m.b2
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minigame Team A-B");
    XLSX.writeFile(wb, `Minigame_Team_AB_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ==========================================================================
   3. MINIGAME BẢNG & VÒNG TRÒN (MINIGAME 2)
   ========================================================================== */
window.m2Data = JSON.parse(localStorage.getItem('pb_m2_bracket_data')) || {
    pairsA: [{ id: 1, p1: "Tiến Thọ", p2: "Châu Sĩ" }, { id: 2, p1: "Phú Mỗ", p2: "Hà Giấy" }],
    pairsB: [{ id: 3, p1: "Trí Đô", p2: "Thành Sóc" }, { id: 4, p1: "Dũng Ngạc", p2: "Lợi Trì" }],
    scheduleA: [],
    scheduleB: [],
    knockout: { bk1: { s1: '', s2: '' }, bk2: { s1: '', s2: '' }, t3: { s1: '', s2: '' }, ck: { s1: '', s2: '' } }
};

function renderM2() {
    renderM2Pairs('A');
    renderM2Pairs('B');
    renderM2ScheduleAndRank('A');
    renderM2ScheduleAndRank('B');
    renderM2Knockout();
    renderM2KeoSummary();
}

function renderM2Pairs(group) {
    const container = document.getElementById(`m2-pairs-${group}`);
    const countEl = document.getElementById(`count-m2-${group}`);
    if (!container) return;

    const list = group === 'A' ? window.m2Data.pairsA : window.m2Data.pairsB;
    if (countEl) countEl.innerText = list.length;

    container.innerHTML = list.map((item, idx) => `
        <div class="flex items-center justify-between p-2 bg-white border rounded shadow-sm text-xs">
            <span class="font-bold text-slate-800">Cặp ${idx + 1}: ${item.p1} & ${item.p2}</span>
            <div class="flex items-center gap-1">
                <button onclick="openM2EditModal('${group}', ${idx})" class="text-blue-600 hover:text-blue-800 p-1 font-bold"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteM2Pair('${group}', ${idx})" class="text-red-500 hover:text-red-700 p-1 font-bold"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addPairM2(group) {
    const p1 = prompt(`Nhập tên VĐV 1 Cặp Bảng ${group}:`);
    if (!p1) return;
    const p2 = prompt(`Nhập tên VĐV 2 Cặp Bảng ${group}:`);
    if (!p2) return;

    const newPair = { id: Date.now(), p1: p1.trim(), p2: p2.trim() };
    if (group === 'A') window.m2Data.pairsA.push(newPair);
    else window.m2Data.pairsB.push(newPair);

    saveM2ToStorage();
    renderM2();
}

function openM2EditModal(group, idx) {
    const modal = document.getElementById('m2-edit-modal');
    if (!modal) return;

    const item = group === 'A' ? window.m2Data.pairsA[idx] : window.m2Data.pairsB[idx];
    document.getElementById('m2-edit-group').value = group;
    document.getElementById('m2-edit-index').value = idx;
    document.getElementById('m2-p1-input').value = item.p1;
    document.getElementById('m2-p2-input').value = item.p2;

    modal.classList.remove('hidden');
}

function closeM2EditModal() {
    const modal = document.getElementById('m2-edit-modal');
    if (modal) modal.classList.add('hidden');
}

function saveM2PairEdit() {
    const group = document.getElementById('m2-edit-group').value;
    const idx = parseInt(document.getElementById('m2-edit-index').value);
    const p1 = document.getElementById('m2-p1-input').value.trim();
    const p2 = document.getElementById('m2-p2-input').value.trim();

    if (!p1 || !p2) return;

    if (group === 'A') {
        window.m2Data.pairsA[idx].p1 = p1;
        window.m2Data.pairsA[idx].p2 = p2;
    } else {
        window.m2Data.pairsB[idx].p1 = p1;
        window.m2Data.pairsB[idx].p2 = p2;
    }

    saveM2ToStorage();
    closeM2EditModal();
    renderM2();
}

function deleteM2Pair(group, idx) {
    if (confirm(" Xóa cặp đấu này?")) {
        if (group === 'A') window.m2Data.pairsA.splice(idx, 1);
        else window.m2Data.pairsB.splice(idx, 1);

        saveM2ToStorage();
        renderM2();
    }
}

function renderM2ScheduleAndRank(group) {
    const scheduleBody = document.getElementById(`m2-schedule-${group}`);
    const rankBody = document.getElementById(`m2-rank-${group}`);
    if (!scheduleBody || !rankBody) return;

    const pairs = group === 'A' ? window.m2Data.pairsA : window.m2Data.pairsB;
    let schedule = group === 'A' ? window.m2Data.scheduleA : window.m2Data.scheduleB;

    // Tự động sinh lịch xoay vòng nếu số cặp thay đổi
    if (!schedule || schedule.length === 0) {
        schedule = [];
        let mIdx = 1;
        for (let i = 0; i < pairs.length; i++) {
            for (let j = i + 1; j < pairs.length; j++) {
                schedule.push({
                    id: mIdx++,
                    team1Idx: i,
                    team2Idx: j,
                    s1: '',
                    s2: ''
                });
            }
        }
        if (group === 'A') window.m2Data.scheduleA = schedule;
        else window.m2Data.scheduleB = schedule;
    }

    // Compute Rankings
    let ranks = pairs.map((p, idx) => ({ idx, name: `${p.p1} & ${p.p2}`, points: 0, diff: 0, win: 0 }));

    scheduleBody.innerHTML = schedule.map((m, idx) => {
        const team1 = pairs[m.team1Idx] ? `${pairs[m.team1Idx].p1} & ${pairs[m.team1Idx].p2}` : 'N/A';
        const team2 = pairs[m.team2Idx] ? `${pairs[m.team2Idx].p1} & ${pairs[m.team2Idx].p2}` : 'N/A';

        const s1 = parseInt(m.s1);
        const s2 = parseInt(m.s2);

        if (!isNaN(s1) && !isNaN(s2)) {
            const diff = s1 - s2;
            if (ranks[m.team1Idx]) {
                ranks[m.team1Idx].diff += diff;
                if (s1 > s2) { ranks[m.team1Idx].points += 1; ranks[m.team1Idx].win += 1; }
            }
            if (ranks[m.team2Idx]) {
                ranks[m.team2Idx].diff -= diff;
                if (s2 > s1) { ranks[m.team2Idx].points += 1; ranks[m.team2Idx].win += 1; }
            }
        }

        return `
            <tr>
                <td class="p-1 border font-bold text-slate-500">${idx + 1}</td>
                <td class="p-1 border font-semibold text-slate-800">${team1}</td>
                <td class="p-1 border">
                    <input type="number" class="score-input" value="${m.s1 !== undefined ? m.s1 : ''}" onchange="updateM2Score('${group}', ${idx}, 's1', this.value)">
                </td>
                <td class="p-1 border">
                    <input type="number" class="score-input" value="${m.s2 !== undefined ? m.s2 : ''}" onchange="updateM2Score('${group}', ${idx}, 's2', this.value)">
                </td>
                <td class="p-1 border font-semibold text-slate-800">${team2}</td>
            </tr>
        `;
    }).join('');

    // Sắp xếp Bảng Xếp Hạng
    ranks.sort((a, b) => b.points - a.points || b.diff - a.diff);

    rankBody.innerHTML = ranks.map((r, idx) => `
        <tr class="${idx === 0 ? 'bg-amber-100 font-bold' : ''}">
            <td class="p-1 border font-bold text-slate-600">${idx + 1}</td>
            <td class="p-1 border text-slate-800">${r.name}</td>
            <td class="p-1 border font-bold text-blue-700">${r.points}</td>
            <td class="p-1 border font-bold text-emerald-700">${r.diff > 0 ? '+' + r.diff : r.diff}</td>
        </tr>
    `).join('');

    // Cập nhật tên vào các trận Knockout
    if (ranks.length >= 2) {
        if (group === 'A') {
            window.m2RankA1 = ranks[0].name;
            window.m2RankA2 = ranks[1].name;
        } else {
            window.m2RankB1 = ranks[0].name;
            window.m2RankB2 = ranks[1].name;
        }
    }
}

function updateM2Score(group, matchIdx, field, val) {
    let schedule = group === 'A' ? window.m2Data.scheduleA : window.m2Data.scheduleB;
    if (schedule[matchIdx]) {
        schedule[matchIdx][field] = val;
        saveM2ToStorage();
        renderM2();
    }
}

function renderM2Knockout() {
    const bk1T1 = document.getElementById('bk1-team1-name');
    const bk1T2 = document.getElementById('bk1-team2-name');
    const bk2T1 = document.getElementById('bk2-team1-name');
    const bk2T2 = document.getElementById('bk2-team2-name');

    if (bk1T1) bk1T1.innerText = window.m2RankA1 || "Nhất A";
    if (bk1T2) bk1T2.innerText = window.m2RankB2 || "Nhì B";
    if (bk2T1) bk2T1.innerText = window.m2RankB1 || "Nhất B";
    if (bk2T2) bk2T2.innerText = window.m2RankA2 || "Nhì A";

    // Re-assign values for input boxes from storage
    const ko = window.m2Data.knockout || {};
    ['bk1-s1', 'bk1-s2', 'bk2-s1', 'bk2-s2', 't3-s1', 't3-s2', 'ck-s1', 'ck-s2'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const keys = id.split('-');
            if (ko[keys[0]] && ko[keys[0]][keys[1]] !== undefined) {
                input.value = ko[keys[0]][keys[1]];
            }
        }
    });
}

function checkM2AdminPassword() {
    const pass = document.getElementById('m2-admin-pass-input').value;
    if (pass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        const badge = document.getElementById('m2-admin-status-badge');
        if (badge) badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin:`;
        alert("🔑 Xác thực Admin thành công!");
        renderM2KeoSummary();
    } else {
        alert("❌ Mật khẩu không đúng!");
    }
}

function setM2KeoMode(mode) {
    window.m2Data.keoMode = mode;
    const customBox = document.getElementById('m2-keo-custom-box');
    if (customBox) {
        if (mode === 'free') customBox.classList.remove('hidden');
        else customBox.classList.add('hidden');
    }
    saveM2ToStorage();
    renderM2KeoSummary();
}

function setM2CustomKeo() {
    const win = parseInt(document.getElementById('m2-keo-custom-win').value) || 0;
    const lose = parseInt(document.getElementById('m2-keo-custom-lose').value) || 0;
    window.m2Data.customWin = win;
    window.m2Data.customLose = lose;
    saveM2ToStorage();
    renderM2KeoSummary();
}

function renderM2KeoSummary() {
    const tbody = document.getElementById('m2-keo-summary-body');
    if (!tbody) return;

    const mode = window.m2Data.keoMode || 'default';
    const allPairs = [...window.m2Data.pairsA, ...window.m2Data.pairsB];
    const allSchedules = [...(window.m2Data.scheduleA || []), ...(window.m2Data.scheduleB || [])];

    let playerStats = {};
    allPairs.forEach(p => {
        if (!playerStats[p.p1]) playerStats[p.p1] = { matchesCount: 0, winCount: 0, loseCount: 0, totalMoney: 0 };
        if (!playerStats[p.p2]) playerStats[p.p2] = { matchesCount: 0, winCount: 0, loseCount: 0, totalMoney: 0 };
    });

    allSchedules.forEach(m => {
        const s1 = parseInt(m.s1);
        const s2 = parseInt(m.s2);
        if (isNaN(s1) || isNaN(s2)) return;

        let winVal = 5000;
        let loseVal = -15000;

        if (mode === 'k25') { winVal = 0; loseVal = -25000; }
        else if (mode === 'k0') { winVal = 0; loseVal = 0; }
        else if (mode === 'free') {
            winVal = window.m2Data.customWin || 0;
            loseVal = -(window.m2Data.customLose || 0);
        }

        const isHam1 = (s1 === 0);
        const isHam2 = (s2 === 0);

        const groupPairs = window.m2Data.pairsA.concat(window.m2Data.pairsB);
        const pair1 = groupPairs[m.team1Idx];
        const pair2 = groupPairs[m.team2Idx];

        if (pair1) {
            [pair1.p1, pair1.p2].forEach(p => {
                if (playerStats[p]) {
                    playerStats[p].matchesCount++;
                    if (s1 > s2) { playerStats[p].winCount++; playerStats[p].totalMoney += winVal; }
                    else if (s2 > s1) { playerStats[p].loseCount++; playerStats[p].totalMoney += isHam1 ? loseVal * 2 : loseVal; }
                }
            });
        }

        if (pair2) {
            [pair2.p1, pair2.p2].forEach(p => {
                if (playerStats[p]) {
                    playerStats[p].matchesCount++;
                    if (s2 > s1) { playerStats[p].winCount++; playerStats[p].totalMoney += winVal; }
                    else if (s1 > s2) { playerStats[p].loseCount++; playerStats[p].totalMoney += isHam2 ? loseVal * 2 : loseVal; }
                }
            });
        }
    });

    tbody.innerHTML = Object.keys(playerStats).map(pName => {
        const stat = playerStats[pName];
        const formattedMoney = stat.totalMoney.toLocaleString('vi-VN') + " ₫";
        const moneyClass = stat.totalMoney >= 0 ? 'txt-win' : 'txt-lose';

        return `
            <tr>
                <td class="p-2 border text-left pl-3 font-bold text-slate-800">${pName}</td>
                <td class="p-2 border font-bold">${stat.matchesCount}</td>
                <td class="p-2 border text-emerald-600 font-bold">${stat.winCount}</td>
                <td class="p-2 border text-red-600 font-bold">${stat.loseCount}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border bg-amber-50">
                    <input type="checkbox" ${window.isAdminUnlocked ? '' : 'disabled'} class="w-4 h-4 accent-emerald-600 cursor-pointer">
                </td>
                <td class="p-2 border font-bold text-slate-400">---</td>
            </tr>
        `;
    }).join('');
}

function saveM2ToStorage() {
    localStorage.setItem('pb_m2_bracket_data', JSON.stringify(window.m2Data));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

/* ==========================================================================
   4. MANAGE MATCHES & DAYS DETAILS (CHI TIẾT CÁC NGÀY CHƠI PICK)
   ========================================================================== */
window.dailyMatchesData = JSON.parse(localStorage.getItem('pb_daily_matches_data')) || {
    "1/10/26": {
        note: "YES",
        keoMode: "default",
        matches: [
            { id: 1, p1: "Tiến Thọ", p2: "Châu Sĩ", s1: 11, s2: 8, p3: "Phú Mỗ", p4: "Hà Giấy", keo: "default" }
        ],
        paidStatus: {}
    }
};

window.currentActiveDate = localStorage.getItem('pb_current_active_date') || "1/10/26";

function renderDatesMenuList() {
    const menuList = document.getElementById('datesMenuList');
    if (!menuList) return;

    const dates = Object.keys(window.dailyMatchesData);
    menuList.innerHTML = dates.map(d => `
        <div class="dropdown-item ${d === window.currentActiveDate ? 'bg-blue-50 text-blue-700 font-bold' : ''}" onclick="selectDateActive('${d}')">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-calendar-day text-blue-600"></i> ${d}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded ${window.dailyMatchesData[d].note === 'YES' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'}">
                ${window.dailyMatchesData[d].note || 'NO'}
            </span>
        </div>
    `).join('');
}

function selectDateActive(d) {
    window.currentActiveDate = d;
    localStorage.setItem('pb_current_active_date', d);
    showTab('day_detail');
    renderDayDetailView();
}

function addDateTab() {
    closeAllDropdowns();
    const newDate = prompt("Nhập tên ngày mới (VD: 15/10/26):");
    if (newDate && newDate.trim() !== "") {
        const dStr = newDate.trim();
        if (!window.dailyMatchesData[dStr]) {
            window.dailyMatchesData[dStr] = {
                note: "YES",
                keoMode: "default",
                matches: [],
                paidStatus: {}
            };
            saveDailyDataToStorage();
            selectDateActive(dStr);
        } else {
            alert("⚠️ Ngày này đã tồn tại trong hệ thống!");
        }
    }
}

function renameCurrentDate() {
    closeAllDropdowns();
    const oldDate = window.currentActiveDate;
    const newDate = prompt(`Sửa tên ngày "${oldDate}" thành:`, oldDate);
    if (newDate && newDate.trim() !== "" && newDate !== oldDate) {
        const dStr = newDate.trim();
        window.dailyMatchesData[dStr] = window.dailyMatchesData[oldDate];
        delete window.dailyMatchesData[oldDate];

        window.currentActiveDate = dStr;
        localStorage.setItem('pb_current_active_date', dStr);
        saveDailyDataToStorage();
        renderDayDetailView();
    }
}

function deleteCurrentDate() {
    closeAllDropdowns();
    const curDate = window.currentActiveDate;
    if (confirm(` Bạn có chắc chắn muốn xóa dữ liệu ngày ${curDate}?`)) {
        delete window.dailyMatchesData[curDate];
        const remaining = Object.keys(window.dailyMatchesData);
        if (remaining.length > 0) {
            window.currentActiveDate = remaining[0];
        } else {
            window.currentActiveDate = "1/10/26";
            window.dailyMatchesData["1/10/26"] = { note: "YES", keoMode: "default", matches: [], paidStatus: {} };
        }
        saveDailyDataToStorage();
        renderDayDetailView();
    }
}

function renderDayDetailView() {
    const titleEl = document.getElementById('current-date-title');
    if (titleEl) titleEl.innerText = window.currentActiveDate;

    renderDatesMenuList();
    renderDayMatchesTable();
    renderDayKeoSummary();
}

function renderDayMatchesTable() {
    const tbody = document.getElementById('day-matches-body');
    if (!tbody) return;

    const dayObj = window.dailyMatchesData[window.currentActiveDate] || { matches: [] };
    const matches = dayObj.matches || [];

    tbody.innerHTML = matches.map((m, idx) => `
        <tr>
            <td class="p-2 border font-bold text-slate-500">${idx + 1}</td>
            <td class="p-2 border font-semibold">${generatePlayerSelectHTML('day', idx, 'p1', m.p1)}</td>
            <td class="p-2 border font-semibold">${generatePlayerSelectHTML('day', idx, 'p2', m.p2)}</td>
            <td class="p-2 border">
                <div class="flex items-center justify-center gap-1">
                    <input type="number" class="score-input" value="${m.s1 !== undefined ? m.s1 : ''}" onchange="updateDayMatchScore(${idx}, 's1', this.value)">
                    <span class="font-bold text-slate-400">-</span>
                    <input type="number" class="score-input" value="${m.s2 !== undefined ? m.s2 : ''}" onchange="updateDayMatchScore(${idx}, 's2', this.value)">
                </div>
            </td>
            <td class="p-2 border font-semibold">${generatePlayerSelectHTML('day', idx, 'p3', m.p3)}</td>
            <td class="p-2 border font-semibold">${generatePlayerSelectHTML('day', idx, 'p4', m.p4)}</td>
            <td class="p-2 border">
                <select onchange="updateDayMatchKeo(${idx}, this.value)" class="text-xs p-1 border rounded font-semibold outline-none bg-amber-50 text-amber-900 border-amber-300">
                    <option value="default" ${m.keo === 'default' ? 'selected' : ''}>+5k / -15k</option>
                    <option value="k25" ${m.keo === 'k25' ? 'selected' : ''}>Kèo 25k</option>
                    <option value="k0" ${m.keo === 'k0' ? 'selected' : ''}>Kèo 0k</option>
                </select>
            </td>
            <td class="p-2 border text-emerald-600 font-bold">+5k</td>
            <td class="p-2 border text-red-600 font-bold">-15k</td>
            <td class="p-2 border">
                <button onclick="deleteDayMatch(${idx})" class="text-red-500 hover:text-red-700 font-bold p-1"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateDayMatchScore(idx, field, val) {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (dayObj && dayObj.matches[idx]) {
        dayObj.matches[idx][field] = val === "" ? "" : parseInt(val);
        saveDailyDataToStorage();
        renderDayMatchesTable();
        renderDayKeoSummary();
    }
}

function updateDayMatchKeo(idx, keoVal) {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (dayObj && dayObj.matches[idx]) {
        dayObj.matches[idx].keo = keoVal;
        saveDailyDataToStorage();
        renderDayKeoSummary();
    }
}

function addMatchToCurrentDate() {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (!dayObj) return;

    dayObj.matches.push({
        id: Date.now(),
        p1: window.players[0] ? window.players[0].name : "",
        p2: window.players[1] ? window.players[1].name : "",
        s1: "",
        s2: "",
        p3: window.players[2] ? window.players[2].name : "",
        p4: window.players[3] ? window.players[3].name : "",
        keo: dayObj.keoMode || "default"
    });

    saveDailyDataToStorage();
    renderDayMatchesTable();
}

function deleteDayMatch(idx) {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (dayObj && confirm(" Xóa trận đấu này khỏi ngày?")) {
        dayObj.matches.splice(idx, 1);
        saveDailyDataToStorage();
        renderDayMatchesTable();
        renderDayKeoSummary();
    }
}

function applyKeoToAllMatchesInDate(keoMode) {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (dayObj) {
        dayObj.keoMode = keoMode;
        if (keoMode !== 'free') {
            dayObj.matches.forEach(m => m.keo = keoMode);
        }
        saveDailyDataToStorage();
        renderDayMatchesTable();
        renderDayKeoSummary();
    }
}

function renderDayKeoSummary() {
    const tbody = document.getElementById('day-summary-body');
    if (!tbody) return;

    const dayObj = window.dailyMatchesData[window.currentActiveDate] || { matches: [], paidStatus: {} };
    const matches = dayObj.matches || [];

    let playerStats = {};
    window.players.forEach(p => {
        playerStats[p.name] = { matchesCount: 0, winCount: 0, loseCount: 0, totalMoney: 0 };
    });

    matches.forEach(m => {
        const s1 = parseInt(m.s1);
        const s2 = parseInt(m.s2);
        if (isNaN(s1) || isNaN(s2)) return;

        let winVal = 5000;
        let loseVal = -15000;

        if (m.keo === 'k25') { winVal = 0; loseVal = -25000; }
        else if (m.keo === 'k0') { winVal = 0; loseVal = 0; }

        const isHam1 = (s1 === 0);
        const isHam2 = (s2 === 0);

        const pair1 = [m.p1, m.p2];
        const pair2 = [m.p3, m.p4];

        pair1.forEach(p => {
            if (p && playerStats[p]) {
                playerStats[p].matchesCount++;
                if (s1 > s2) { playerStats[p].winCount++; playerStats[p].totalMoney += winVal; }
                else if (s2 > s1) { playerStats[p].loseCount++; playerStats[p].totalMoney += isHam1 ? loseVal * 2 : loseVal; }
            }
        });

        pair2.forEach(p => {
            if (p && playerStats[p]) {
                playerStats[p].matchesCount++;
                if (s2 > s1) { playerStats[p].winCount++; playerStats[p].totalMoney += winVal; }
                else if (s1 > s2) { playerStats[p].loseCount++; playerStats[p].totalMoney += isHam2 ? loseVal * 2 : loseVal; }
            }
        });
    });

    tbody.innerHTML = Object.keys(playerStats).map(pName => {
        const stat = playerStats[pName];
        if (stat.matchesCount === 0) return ''; // Bỏ qua VĐV không thi đấu ngày này

        const isPaid = dayObj.paidStatus[pName] || false;
        const formattedMoney = stat.totalMoney.toLocaleString('vi-VN') + " ₫";
        const moneyClass = stat.totalMoney >= 0 ? 'txt-win' : 'txt-lose';

        return `
            <tr>
                <td class="p-2 border text-left pl-3 font-bold text-slate-800">${pName}</td>
                <td class="p-2 border font-bold">${stat.matchesCount}</td>
                <td class="p-2 border text-emerald-600 font-bold">${stat.winCount}</td>
                <td class="p-2 border text-red-600 font-bold">${stat.loseCount}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border font-bold ${moneyClass}">${formattedMoney}</td>
                <td class="p-2 border bg-amber-50">
                    <input type="checkbox" ${isPaid ? 'checked' : ''} ${window.isAdminUnlocked ? '' : 'disabled'} onchange="toggleDayPlayerPaid('${pName}', this.checked)" class="w-4 h-4 accent-emerald-600 cursor-pointer">
                </td>
                <td class="p-2 border font-bold ${isPaid ? 'note-paid' : 'note-unpaid'}">${isPaid ? 'ĐÃ NỘP' : 'CHƯA NỘP'}</td>
            </tr>
        `;
    }).join('');
}

function toggleDayPlayerPaid(pName, isChecked) {
    const dayObj = window.dailyMatchesData[window.currentActiveDate];
    if (dayObj) {
        if (!dayObj.paidStatus) dayObj.paidStatus = {};
        dayObj.paidStatus[pName] = isChecked;
        saveDailyDataToStorage();
        renderDayKeoSummary();
    }
}

function saveDailyDataToStorage() {
    localStorage.setItem('pb_daily_matches_data', JSON.stringify(window.dailyMatchesData));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

/* ==========================================================================
   5. FUND MANAGER (QUẢN LÝ QUỸ PICKLEBALL)
   ========================================================================== */
window.fundData = JSON.parse(localStorage.getItem('pb_fund_data')) || {
    initialFund: 5000000,
    transactions: [
        { id: 1, type: 'income', date: '2026-10-01', desc: 'Thu quỹ Quý 4 VĐV Tiến Thọ', amount: 500000, source: 'Tiến Thọ', note: 'Chuyển khoản' },
        { id: 2, type: 'expense', date: '2026-10-02', desc: 'Tiền thuê sân Tháng 10', amount: 1200000, source: 'Chi Sân', note: 'Tiền mặt' }
    ],
    quarters: ['Quý 1/26', 'Quý 2/26', 'Quý 3/26', 'Quý 4/26'],
    quarterPaid: {}
};

function updateFundDashboard() {
    renderFundSummaryCards();
    renderFundTransactions();
    renderFundMembers();
}

function updateInitialFund(val) {
    requireAdminAuth(() => {
        window.fundData.initialFund = parseInt(val) || 0;
        saveFundToStorage();
        updateFundDashboard();
    });
}

function renderFundSummaryCards() {
    const initialInput = document.getElementById('input-initial-fund');
    if (initialInput) initialInput.value = window.fundData.initialFund || 0;

    let totalIncome = 0;
    let totalExpense = 0;

    (window.fundData.transactions || []).forEach(tx => {
        if (tx.type === 'income') totalIncome += parseInt(tx.amount || 0);
        else if (tx.type === 'expense') totalExpense += parseInt(tx.amount || 0);
    });

    const balance = (window.fundData.initialFund || 0) + totalIncome - totalExpense;

    const incomeEl = document.getElementById('stat-income');
    const expenseEl = document.getElementById('stat-expense');
    const balanceEl = document.getElementById('stat-balance');

    if (incomeEl) incomeEl.innerText = totalIncome.toLocaleString('vi-VN') + " ₫";
    if (expenseEl) expenseEl.innerText = totalExpense.toLocaleString('vi-VN') + " ₫";
    if (balanceEl) balanceEl.innerText = balance.toLocaleString('vi-VN') + " ₫";

    const incTot = document.getElementById('income-total');
    const expTot = document.getElementById('expense-total');
    if (incTot) incTot.innerText = totalIncome.toLocaleString('vi-VN') + " ₫";
    if (expTot) expTot.innerText = totalExpense.toLocaleString('vi-VN') + " ₫";
}

function renderFundTransactions() {
    const incBody = document.getElementById('income-list');
    const expBody = document.getElementById('expense-list');

    if (!incBody || !expBody) return;

    const incomes = (window.fundData.transactions || []).filter(t => t.type === 'income');
    const expenses = (window.fundData.transactions || []).filter(t => t.type === 'expense');

    incBody.innerHTML = incomes.map(t => `
        <tr class="hover:bg-slate-50 transition border-b">
            <td class="py-2 px-3 font-semibold text-slate-600">${t.date}</td>
            <td class="py-2 px-3 font-bold text-slate-800">${t.desc}</td>
            <td class="py-2 px-3 text-right font-extrabold text-emerald-600">+${parseInt(t.amount).toLocaleString('vi-VN')} ₫</td>
            <td class="py-2 px-3 font-semibold text-slate-700">${t.source || 'N/A'}</td>
            <td class="py-2 px-3 text-slate-500">${t.note || ''}</td>
            <td class="py-2 px-3 text-center">
                <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 p-1 font-bold text-xs"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    expBody.innerHTML = expenses.map(t => `
        <tr class="hover:bg-slate-50 transition border-b">
            <td class="py-2 px-3 font-semibold text-slate-600">${t.date}</td>
            <td class="py-2 px-3 font-bold text-slate-800">${t.desc}</td>
            <td class="py-2 px-3 text-right font-extrabold text-rose-600">-${parseInt(t.amount).toLocaleString('vi-VN')} ₫</td>
            <td class="py-2 px-3 font-semibold text-slate-700">${t.source || 'N/A'}</td>
            <td class="py-2 px-3 text-slate-500">${t.note || ''}</td>
            <td class="py-2 px-3 text-center">
                <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 p-1 font-bold text-xs"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openFundModal(type) {
    const backdrop = document.getElementById('fund-modal-backdrop');
    if (!backdrop) return;

    document.getElementById('tx-type').value = type;
    document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('tx-desc').value = '';
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-note').value = '';

    const header = document.getElementById('fund-modal-header');
    const title = document.getElementById('fund-modal-title');
    const btnSubmit = document.getElementById('fund-btn-submit');
    const sourceSelect = document.getElementById('tx-source-select');

    if (type === 'income') {
        header.className = "p-4 bg-emerald-600 text-white flex justify-between items-center";
        title.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Thêm Khoản Thu Mới`;
        btnSubmit.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm";
    } else {
        header.className = "p-4 bg-rose-600 text-white flex justify-between items-center";
        title.innerHTML = `<i class="fa-solid fa-minus-circle"></i> Thêm Khoản Chi Mới`;
        btnSubmit.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm";
    }

    sourceSelect.innerHTML = `<option value="Khác">Khác / Chi Sân</option>` + window.players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

    backdrop.classList.remove('hidden');
}

function closeFundModal() {
    const backdrop = document.getElementById('fund-modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
}

function handleFundFormSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('tx-type').value;
    const date = document.getElementById('tx-date').value;
    const desc = document.getElementById('tx-desc').value.trim();
    const amount = parseInt(document.getElementById('tx-amount').value);
    const source = document.getElementById('tx-source-select').value;
    const note = document.getElementById('tx-note').value.trim();

    if (!desc || isNaN(amount) || amount <= 0) {
        alert("⚠️ Vui lòng nhập đầy đủ và chính xác thông tin!");
        return;
    }

    const newTx = { id: Date.now(), type, date, desc, amount, source, note };
    if (!window.fundData.transactions) window.fundData.transactions = [];
    window.fundData.transactions.push(newTx);

    saveFundToStorage();
    closeFundModal();
    updateFundDashboard();
}

function deleteTransaction(id) {
    requireAdminAuth(() => {
        if (confirm(" Xóa giao dịch này khỏi Nhật Ký Quỹ?")) {
            window.fundData.transactions = window.fundData.transactions.filter(t => t.id !== id);
            saveFundToStorage();
            updateFundDashboard();
        }
    });
}

function renderFundMembers() {
    const trHead = document.getElementById('member-list-thead-tr');
    const tbody = document.getElementById('member-list');
    const tfoot = document.getElementById('member-list-foot');

    if (!trHead || !tbody) return;

    const quarters = window.fundData.quarters || ['Quý 1/26', 'Quý 2/26', 'Quý 3/26', 'Quý 4/26'];
    const searchTerm = (document.getElementById('member-search') ? document.getElementById('member-search').value : '').toLowerCase();

    // Table Header
    trHead.innerHTML = `
        <th class="py-2.5 px-3 w-12 text-center">STT</th>
        <th class="py-2.5 px-3 min-w-[160px]">Họ & Tên Pick Thủ</th>
        ${quarters.map((q, idx) => `
            <th class="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200" onclick="renameQuarterColumn(${idx})">
                ${q} <i class="fa-solid fa-pen text-[10px] text-slate-400"></i>
            </th>
        `).join('')}
    `;

    const filteredPlayers = window.players.filter(p => p.name.toLowerCase().includes(searchTerm));

    tbody.innerHTML = filteredPlayers.map((p, idx) => `
        <tr class="hover:bg-slate-50 transition border-b">
            <td class="py-2 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
            <td class="py-2 px-3 font-bold text-slate-800">${p.name}</td>
            ${quarters.map(q => {
                const key = `${p.name}_${q}`;
                const isPaid = window.fundData.quarterPaid[key] || false;
                return `
                    <td class="py-2 px-3 text-center">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} ${window.isAdminUnlocked ? '' : 'disabled'} onchange="toggleQuarterPaid('${p.name}', '${q}', this.checked)" class="w-4 h-4 accent-emerald-600 cursor-pointer">
                    </td>
                `;
            }).join('')}
        </tr>
    `).join('');
}

function toggleQuarterPaid(pName, quarter, isChecked) {
    if (!window.fundData.quarterPaid) window.fundData.quarterPaid = {};
    const key = `${pName}_${quarter}`;
    window.fundData.quarterPaid[key] = isChecked;

    saveFundToStorage();
    updateFundDashboard();
}

function addNewQuarterColumn() {
    requireAdminAuth(() => {
        const qName = prompt("Nhập tên Cột Quý Mới (VD: Quý 1/27):");
        if (qName && qName.trim() !== '') {
            if (!window.fundData.quarters) window.fundData.quarters = [];
            window.fundData.quarters.push(qName.trim());
            saveFundToStorage();
            updateFundDashboard();
        }
    });
}

function renameQuarterColumn(idx) {
    requireAdminAuth(() => {
        const oldName = window.fundData.quarters[idx];
        const newName = prompt(`Sửa tên cột "${oldName}" thành:`, oldName);
        if (newName && newName.trim() !== '' && newName !== oldName) {
            window.fundData.quarters[idx] = newName.trim();
            saveFundToStorage();
            updateFundDashboard();
        }
    });
}

function addNewFundPlayerPrompt() {
    openPlayerModal();
}

function saveFundToStorage() {
    localStorage.setItem('pb_fund_data', JSON.stringify(window.fundData));
    autoBackupData();
    if (window.syncToFirebase) window.syncToFirebase();
}

function exportFundToExcel() {
    if (typeof XLSX === 'undefined') {
        alert("⚠️ Thư viện XLSX chưa tải xong!");
        return;
    }
    const wsTx = XLSX.utils.json_to_sheet(window.fundData.transactions || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTx, "Thu Chi Quỹ");
    XLSX.writeFile(wb, `Quan_Ly_Quy_Pickleball_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ==========================================================================
   6. BẢNG TỔNG HỢP CÁC NGÀY & HOME VIEWS
   ========================================================================== */
function renderTongHopView() {
    const container = document.getElementById('tonghop-content-container');
    if (!container) return;

    const dates = Object.keys(window.dailyMatchesData).filter(d => window.dailyMatchesData[d].note === 'YES');

    if (dates.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500 font-semibold">Chưa có ngày chơi nào được bật trạng thái NOTE = YES.</div>`;
        return;
    }

    let summaryMap = {};
    window.players.forEach(p => {
        summaryMap[p.name] = { totalMatches: 0, totalWin: 0, totalLose: 0, totalMoney: 0 };
    });

    dates.forEach(d => {
        const dayObj = window.dailyMatchesData[d];
        (dayObj.matches || []).forEach(m => {
            const s1 = parseInt(m.s1);
            const s2 = parseInt(m.s2);
            if (isNaN(s1) || isNaN(s2)) return;

            let winVal = 5000;
            let loseVal = -15000;
            if (m.keo === 'k25') { winVal = 0; loseVal = -25000; }
            else if (m.keo === 'k0') { winVal = 0; loseVal = 0; }

            const pair1 = [m.p1, m.p2];
            const pair2 = [m.p3, m.p4];

            pair1.forEach(p => {
                if (p && summaryMap[p]) {
                    summaryMap[p].totalMatches++;
                    if (s1 > s2) { summaryMap[p].totalWin++; summaryMap[p].totalMoney += winVal; }
                    else if (s2 > s1) { summaryMap[p].totalLose++; summaryMap[p].totalMoney += (s1 === 0 ? loseVal * 2 : loseVal); }
                }
            });

            pair2.forEach(p => {
                if (p && summaryMap[p]) {
                    summaryMap[p].totalMatches++;
                    if (s2 > s1) { summaryMap[p].totalWin++; summaryMap[p].totalMoney += winVal; }
                    else if (s1 > s2) { summaryMap[p].totalLose++; summaryMap[p].totalMoney += (s2 === 0 ? loseVal * 2 : loseVal); }
                }
            });
        });
    });

    container.innerHTML = `
        <table class="w-full text-center border-collapse text-xs">
            <thead>
                <tr class="bg-slate-800 text-white font-bold">
                    <th class="p-2 border">STT</th>
                    <th class="p-2 border text-left pl-3">PICK THỦ</th>
                    <th class="p-2 border">TỔNG TRẬN</th>
                    <th class="p-2 border">TỔNG THẮNG</th>
                    <th class="p-2 border">TỔNG THUA</th>
                    <th class="p-2 border">TỔNG MANG VỀ</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(summaryMap).map((pName, idx) => {
                    const stat = summaryMap[pName];
                    if (stat.totalMatches === 0) return '';
                    const moneyClass = stat.totalMoney >= 0 ? 'text-emerald-600' : 'text-red-600';
                    return `
                        <tr class="hover:bg-slate-50 transition border-b">
                            <td class="p-2 border font-bold text-slate-500">${idx + 1}</td>
                            <td class="p-2 border text-left pl-3 font-bold text-slate-800">${pName}</td>
                            <td class="p-2 border font-bold">${stat.totalMatches}</td>
                            <td class="p-2 border font-bold text-emerald-600">${stat.totalWin}</td>
                            <td class="p-2 border font-bold text-red-600">${stat.totalLose}</td>
                            <td class="p-2 border font-extrabold ${moneyClass}">${stat.totalMoney.toLocaleString('vi-VN')} ₫</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderHomeClosestDateView() {
    const titleEl = document.getElementById('home-closest-date-title');
    const container = document.getElementById('home-closest-date-container');

    const dates = Object.keys(window.dailyMatchesData);
    const closestDate = dates[dates.length - 1] || "1/10/26";

    if (titleEl) titleEl.innerText = closestDate;

    if (!container) return;

    const dayObj = window.dailyMatchesData[closestDate] || { matches: [] };
    const matches = dayObj.matches || [];

    container.innerHTML = `
        <div class="border rounded-xl p-4 bg-slate-50">
            <h4 class="font-bold text-sm text-slate-700 mb-3"><i class="fa-solid fa-list-check"></i> Các trận đấu ngày ${closestDate}:</h4>
            <div class="smooth-scroll">
                <table class="w-full text-xs text-center border-collapse">
                    <thead class="bg-blue-600 text-white font-bold">
                        <tr>
                            <th class="p-1.5 border">Cặp Pick 1</th>
                            <th class="p-1.5 border w-16">Tỷ Số</th>
                            <th class="p-1.5 border">Cặp Pick 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matches.length > 0 ? matches.map(m => `
                            <tr class="border-b bg-white">
                                <td class="p-2 font-bold text-blue-900">${m.p1} & ${m.p2}</td>
                                <td class="p-2 font-extrabold text-slate-800">${m.s1 !== '' ? m.s1 : '-'} : ${m.s2 !== '' ? m.s2 : '-'}</td>
                                <td class="p-2 font-bold text-orange-900">${m.p3} & ${m.p4}</td>
                            </tr>
                        `).join('') : `<tr><td colspan="3" class="p-3 text-slate-400">Chưa có trận nào.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function goToClosestDateTab() {
    const dates = Object.keys(window.dailyMatchesData);
    const closestDate = dates[dates.length - 1] || "1/10/26";
    selectDateActive(closestDate);
}

/* ==========================================================================
   7. IMPORT / EXPORT BACKUP JSON & AUTO REFRESH
   ========================================================================== */
function autoBackupData() {
    const fullBackup = {
        players: window.players,
        minigameTeamData: window.minigameTeamData,
        m2Data: window.m2Data,
        createdMinigames: window.createdMinigames,
        dailyMatchesData: window.dailyMatchesData,
        fundData: window.fundData,
        backupTime: new Date().toISOString()
    };
    localStorage.setItem('pb_full_system_backup', JSON.stringify(fullBackup));
}

function exportBackupJSON() {
    autoBackupData();
    const backupData = localStorage.getItem('pb_full_system_backup');
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLB_Pickleball_CMTD_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function triggerRestoreInput() {
    const input = document.getElementById('restore-file-input');
    if (input) input.click();
}

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.players) window.players = data.players;
            if (data.minigameTeamData) window.minigameTeamData = data.minigameTeamData;
            if (data.m2Data) window.m2Data = data.m2Data;
            if (data.createdMinigames) window.createdMinigames = data.createdMinigames;
            if (data.dailyMatchesData) window.dailyMatchesData = data.dailyMatchesData;
            if (data.fundData) window.fundData = data.fundData;

            savePlayersToStorage();
            saveM1ToStorage();
            saveM2ToStorage();
            saveDailyDataToStorage();
            saveFundToStorage();

            refreshAllViews();
            alert("🎉 Đã Phục Hồi (Restore) Dữ Liệu Thành Công!");
        } catch (err) {
            alert("❌ File sao lưu không hợp lệ hoặc bị hỏng!");
        }
    };
    reader.readAsText(file);
}

function backupDataJSON() { exportBackupJSON(); }
function triggerRestoreJSON() { triggerRestoreInput(); }

function refreshAllViews() {
    renderDynamicMinigameDropdowns();
    renderPlayersList();
    renderMinigame1();
    renderM2();
    renderDayDetailView();
    updateFundDashboard();
    renderHomeClosestDateView();
}

// Global Export to Excel function for all views
function exportToExcel() {
    exportToExcelTeam();
}

/* ==========================================================================
   INITIALIZATION UPON PAGE LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    renderDynamicMinigameDropdowns();
    refreshAllViews();

    // Online status indicator
    const statusEl = document.getElementById('status-element');
    const statusElMob = document.getElementById('status-element-mobile');
    if (statusEl) statusEl.innerText = "Online (Sẵn sàng)";
    if (statusElMob) statusElMob.innerText = "Online";
});
