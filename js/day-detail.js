/**
 * js/day-detail.js - Quản lý ngày đấu, trận đấu và bảng tổng hợp kèo (Tối ưu hóa & Chính xác)
 */

window.getClosestDateToToday = function() {
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
};

// 1. Render giao diện Trang Chủ (Home) tối ưu hóa tốc độ
window.renderHomeClosestDateView = function() {
    const container = document.getElementById('home-closest-date-container');
    const titleEl = document.getElementById('home-closest-date-title');
    if (!container) return;

    const homeAdminBadge = document.getElementById('home-admin-status-badge');
    if (homeAdminBadge) {
        if (window.isAdminUnlocked) {
            homeAdminBadge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin`;
            homeAdminBadge.className = "text-xs font-bold text-emerald-700 flex items-center gap-1";
        } else {
            homeAdminBadge.innerHTML = `<i class="fa-solid fa-lock text-red-500"></i> Chưa Mở Khóa Admin`;
            homeAdminBadge.className = "text-xs font-bold text-slate-600 flex items-center gap-1";
        }
    }

    const closestDate = window.getClosestDateToToday();
    if (!closestDate) {
        if(titleEl) titleEl.innerText = "Chưa có dữ liệu";
        container.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">Chưa có ngày nào được tạo trong hệ thống.</div>`;
        return;
    }

    if(titleEl) titleEl.innerText = closestDate;
    const matches = window.matchesData[closestDate] || [];

    let matchesTableRows = '';
    let stats = {};
    if (window.players) {
        window.players.forEach(p => { stats[p.name] = { played: 0, wins: 0, losses: 0, total: 0 }; });
    }

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
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].total += effWin; } });
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].total += effLose; } });
            } else if(s2 > s1) {
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].total += effWin; } });
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].total += effLose; } });
            }
        }

        const buildPlayerSelectHome = (val, field) => {
            let opts = `<option value="">-- Chọn Pick --</option>`;
            if (window.players) {
                window.players.forEach(p => {
                    opts += `<option value="${p.name}" ${p.name === val ? 'selected' : ''}>${p.name}</option>`;
                });
            }
            return `<select onchange="window.updateMatchDataForDate('${closestDate}', ${idx}, '${field}', this.value)" class="player-select-btn text-[11px] border rounded p-1 outline-none w-full bg-white shadow-sm">${opts}</select>`;
        };

        matchesTableRows += `
            <tr class="hover:bg-slate-50 text-center">
                <td class="font-bold text-slate-700 whitespace-nowrap px-1">Trận ${idx + 1}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c1_p1, 'c1_p1')}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c1_p2, 'c1_p2')}</td>
                <td class="p-1 bg-purple-50/40 border-x border-purple-200">
                    <div class="flex items-center justify-center gap-0.5">
                        <input type="text" class="score-input w-12 text-center border rounded p-1" value="${m.score1 || ''}" onchange="window.updateMatchDataForDate('${closestDate}', ${idx}, 'score1', this.value)">
                        <span class="font-black text-slate-400 px-0.5">-</span>
                        <input type="text" class="score-input w-12 text-center border rounded p-1" value="${m.score2 || ''}" onchange="window.updateMatchDataForDate('${closestDate}', ${idx}, 'score2', this.value)">
                    </div>
                </td>
                <td class="p-1">${buildPlayerSelectHome(m.c2_p1, 'c2_p1')}</td>
                <td class="p-1">${buildPlayerSelectHome(m.c2_p2, 'c2_p2')}</td>
                <td class="p-1 font-extrabold ${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1 !== '' ? keo1 + 'K' : '---'}</td>
                <td class="p-1 font-extrabold ${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2 !== '' ? keo2 + 'K' : '---'}</td>
                <td class="p-1 text-center whitespace-nowrap">
                    <button onclick="window.deleteMatchFromDate('${closestDate}', ${idx})" class="text-slate-400 hover:text-red-600 font-bold p-1 transition-colors" title="Xóa trận">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-600">Hiển thị nhanh kết quả ngày ${closestDate}</span>
                <button onclick="window.addMatchToDate('${closestDate}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded shadow font-bold">
                    <i class="fa-solid fa-plus"></i> Thêm Trận
                </button>
            </div>
            <div class="smooth-scroll border border-slate-200 rounded-lg bg-white shadow-sm overflow-x-auto">
                <table class="w-full text-xs min-w-[780px] border-collapse text-center">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 font-bold">
                            <th class="p-2 border w-10">STT</th>
                            <th class="p-2 border bg-emerald-50 text-emerald-900" colspan="2">CẶP PICK 1</th>
                            <th class="p-2 border bg-purple-100 text-purple-900 w-24">TỶ SỐ</th>
                            <th class="p-2 border bg-red-50 text-red-900" colspan="2">CẶP PICK 2</th>
                            <th class="p-2 border" colspan="2">KÈO BAN ĐẦU</th>
                            <th class="p-2 border w-12 bg-slate-200"><i class="fa-solid fa-gear"></i></th>
                        </tr>
                    </thead>
                    <tbody>${matchesTableRows || '<tr><td colspan="9" class="p-4 text-center text-slate-400">Chưa có trận đấu nào trong ngày này.</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
};

// 2. Render giao diện Chi tiết ngày đấu đầy đủ
window.renderDayDetailView = function() {
    const dateStr = window.currentSelectedDate;
    const titleEl = document.getElementById('current-date-title');
    if(titleEl) titleEl.innerText = dateStr || "Chưa chọn ngày";

    const matches = window.matchesData[dateStr] || [];
    const tbody = document.getElementById('day-matches-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let stats = {};
    if (window.players) {
        window.players.forEach(p => { stats[p.name] = { played: 0, wins: 0, losses: 0, total: 0 }; });
    }

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
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].total += effWin; } });
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].total += effLose; } });
            } else if(s2 > s1) {
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].total += effWin; } });
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].total += effLose; } });
            }
        }

        const buildPlayerSelect = (val, field) => {
            let opts = `<option value="">-- Chọn Pick --</option>`;
            if (window.players) {
                window.players.forEach(p => {
                    opts += `<option value="${p.name}" ${p.name === val ? 'selected' : ''}>${p.name}</option>`;
                });
            }
            return `<select onchange="window.updateMatchDataForDate('${dateStr}', ${idx}, '${field}', this.value)" class="player-select-btn text-[11px] border rounded p-1 outline-none w-full bg-white shadow-sm">${opts}</select>`;
        };

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 text-center">
                <td class="font-bold text-slate-700 whitespace-nowrap px-1">Trận ${idx+1}</td>
                <td class="p-1">${buildPlayerSelect(m.c1_p1, 'c1_p1')}</td>
                <td class="p-1">${buildPlayerSelect(m.c1_p2, 'c1_p2')}</td>
                <td class="p-1 bg-purple-50/40 border-x border-purple-200">
                    <div class="flex items-center justify-center gap-0.5">
                        <input type="text" class="score-input w-12 text-center border rounded p-1" value="${m.score1 || ''}" onchange="window.updateMatchDataForDate('${dateStr}', ${idx}, 'score1', this.value)">
                        <span class="font-black text-slate-400 px-0.5">-</span>
                        <input type="text" class="score-input w-12 text-center border rounded p-1" value="${m.score2 || ''}" onchange="window.updateMatchDataForDate('${dateStr}', ${idx}, 'score2', this.value)">
                    </div>
                </td>
                <td class="p-1">${buildPlayerSelect(m.c2_p1, 'c2_p1')}</td>
                <td class="p-1">${buildPlayerSelect(m.c2_p2, 'c2_p2')}</td>
                <td class="p-1 font-extrabold ${keo1 > 0 ? 'txt-win' : (keo1 < 0 ? 'txt-lose' : '')}">${keo1}</td>
                <td class="p-1 font-extrabold ${keo2 > 0 ? 'txt-win' : (keo2 < 0 ? 'txt-lose' : '')}">${keo2}</td>
                <td class="p-1 text-center whitespace-nowrap">
                    <button onclick="window.deleteMatchFromDate('${dateStr}', ${idx})" class="text-slate-400 hover:text-red-600 font-bold p-1 transition-colors">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </td>
            </tr>
        `;
    });
};

// 3. Các hàm hỗ trợ thao tác dữ liệu trận đấu
window.addMatchToDate = function(dateStr) {
    if(!window.matchesData[dateStr]) window.matchesData[dateStr] = [];
    const nextId = window.matchesData[dateStr].length + 1;
    const globalMode = window.dateKeoMode ? (window.dateKeoMode[dateStr] || 'default') : 'default';
    window.matchesData[dateStr].push({ 
        id: nextId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "",
        keoMode: globalMode, customWin: 5, customLose: -15
    });
    if (typeof window.refreshAllViews === 'function') window.refreshAllViews();
    if (typeof window.autoBackupData === 'function') window.autoBackupData();
    if (typeof window.syncToFirebase === 'function') window.syncToFirebase();
};

window.deleteMatchFromDate = function(dateStr, index) {
    if(confirm(`Bạn có chắc chắn muốn XÓA Trận ${index + 1}?`)) {
        if(window.matchesData[dateStr]) {
            window.matchesData[dateStr].splice(index, 1);
            if (typeof window.refreshAllViews === 'function') window.refreshAllViews();
            if (typeof window.autoBackupData === 'function') window.autoBackupData();
            if (typeof window.syncToFirebase === 'function') window.syncToFirebase();
        }
    }
};

window.updateMatchDataForDate = function(dateStr, index, field, value) {
    if(window.matchesData[dateStr] && window.matchesData[dateStr][index]) {
        window.matchesData[dateStr][index][field] = value;
        if (typeof window.refreshAllViews === 'function') window.refreshAllViews();
        if (typeof window.autoBackupData === 'function') window.autoBackupData();
        if (typeof window.syncToFirebase === 'function') window.syncToFirebase();
    }
};
