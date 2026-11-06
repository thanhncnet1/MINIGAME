// ==========================================
// QUẢN LÝ NGÀY ĐẤU, TRẬN ĐẤU & TỔNG HỢP KÈO (HOME & CHI TIẾT NGÀY)
// ==========================================
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

// Hàm render giao diện Trang Chủ (Home) tích hợp ô xác thực Admin và chuẩn hóa cột Thực Tế / Quỹ Còn
function renderHomeClosestDateView() {
    const container = document.getElementById('home-closest-date-container');
    const titleEl = document.getElementById('home-closest-date-title');
    if (!container) return;

    // Hiển thị trạng thái mở khóa Admin ở trang Home nếu có phần tử tương ứng
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
    window.players.forEach(p => { stats[p.name] = { played: 0, wins: 0, losses: 0, winK: 0, loseK: 0, total: 0 }; });

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
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].loseK += effLose; stats[v].total += effLose; } });
            } else if(s2 > s1) {
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].loseK += effLose; stats[v].total += effLose; } });
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

    let summaryRows = '';
    let sumBringBack = 0, sumThucThu = 0, sumThucTeAm = 0, sumThieuChuaChon = 0, sumFine = 0;
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

            // Cột thực tế chỉ cộng dồn giá trị âm (tiền âm hoặc phạt âm)
            let thucTeVal = netTotal < 0 ? netTotal : 0;
            if (thucTeVal < 0) {
                sumThucTeAm += thucTeVal;
                if (isPaid) {
                    sumThucThu += Math.abs(thucTeVal);
                } else {
                    sumThieuChuaChon += Math.abs(thucTeVal);
                }
            }

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
                    <td class="p-2 border txt-win font-bold">${st.wins > 0 ? st.wins : ''}</td>
                    <td class="p-2 border txt-lose font-bold">${st.losses > 0 ? st.losses : ''}</td>
                    <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? '+' + bringBack + 'K' : ''}</td>
                    <td class="p-2 border font-extrabold ${netTotal < 0 ? 'txt-lose' : (netTotal > 0 ? 'txt-win' : '')}">${netTotal !== 0 ? (netTotal > 0 ? '+' + netTotal + 'K' : netTotal + 'K') : '0K'}</td>
                    ${buildAbsentFineCell(closestDate, p.name, isAbsent, fine, true)}
                    <td class="p-2 border bg-amber-50/30">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="togglePaymentStatus('${payKey}')" class="w-4 h-4 cursor-pointer accent-emerald-600">
                    </td>
                    <td class="p-2 border">${noteText}</td>
                </tr>
            `;
        }
    });

    let btcThuVe = sumThucTeAm + sumBringBack;
    let quyCon = sumThieuChuaChon; // Quỹ còn chính là giá trị thiếu mà cột thực tế chưa được chọn nộp/nhận

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
                            ${summaryRows}
                            ${buildAbsentSelectorRow(closestDate, 9)}
                            <tr class="bg-slate-100 font-extrabold text-center">
                                <td class="p-2 border text-left text-red-600 pl-3">TỔNG BTC THU VỀ</td>
                                <td class="p-2 border" colspan="3"></td>
                                <td class="p-2 border text-blue-700">+${sumBringBack}K</td>
                                <td class="p-2 border text-red-600">${btcThuVe}K</td>
                                <td class="p-2 border ${sumFine < 0 ? 'txt-lose' : 'text-slate-500'}">${sumFine < 0 ? sumFine + 'K' : '0K'}</td>
                                <td class="p-2 border text-blue-700">+${sumThucThu}K</td>
                                <td class="p-2 border text-slate-600 whitespace-nowrap">---</td>
                            </tr>
                            <tr class="bg-slate-100 font-extrabold text-center">
                                <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn (Chưa chọn)</td>
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

// Render màn hình Chi Tiết Ngày Đấu áp dụng đồng bộ quy tắc cột Thực Tế & Quỹ Còn
function renderDayDetailView() {
    removeLegacyAbsentBox();
    const dateStr = window.currentSelectedDate;
    const titleEl = document.getElementById('current-date-title');
    if(titleEl) titleEl.innerText = dateStr;

    const matches = window.matchesData[dateStr] || [];
    const tbody = document.getElementById('day-matches-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let stats = {};
    window.players.forEach(p => { stats[p.name] = { played: 0, wins: 0, losses: 0, winK: 0, loseK: 0, total: 0 }; });

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
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].loseK += effLose; stats[v].total += effLose; } });
            } else if(s2 > s1) {
                pair2.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].wins++; stats[v].winK += effWin; stats[v].total += effWin; } });
                pair1.forEach(v => { if(stats[v]) { stats[v].played++; stats[v].losses++; stats[v].loseK += effLose; stats[v].total += effLose; } });
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

    let sumBringBack = 0, sumThucThu = 0, sumThucTeAm = 0, sumThieuChuaChon = 0, sumFine = 0;
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

            let thucTeVal = netTotal < 0 ? netTotal : 0;
            if (thucTeVal < 0) {
                sumThucTeAm += thucTeVal;
                if (isPaid) {
                    sumThucThu += Math.abs(thucTeVal);
                } else {
                    sumThieuChuaChon += Math.abs(thucTeVal);
                }
            }

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
                    <td class="p-2 border txt-win font-bold">${st.wins > 0 ? st.wins : ''}</td>
                    <td class="p-2 border txt-lose font-bold">${st.losses > 0 ? st.losses : ''}</td>
                    <td class="p-2 border text-blue-600 font-bold">${bringBack > 0 ? bringBack : ''}</td>
                    <td class="p-2 border font-extrabold ${netTotal < 0 ? 'txt-lose' : (netTotal > 0 ? 'txt-win' : '')}">${netTotal}</td>
                    ${buildAbsentFineCell(dateStr, p.name, isAbsent, fine, false)}
                    <td class="p-2 border bg-amber-50/30">
                        <input type="checkbox" ${isPaid ? 'checked' : ''} ${disabledAttr} onclick="togglePaymentStatus('${payKey}')" class="w-4 h-4 cursor-pointer accent-emerald-600">
                    </td>
                    <td class="p-2 border whitespace-nowrap">${noteText}</td>
                </tr>
            `;
        }
    });

    let btcThuVe = sumThucTeAm + sumBringBack;
    let quyCon = sumThieuChuaChon;

    sumBody.innerHTML += `
        ${buildAbsentSelectorRow(dateStr, 9)}
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 whitespace-nowrap pl-3">TỔNG BTC THU VỀ</td>
            <td class="p-2 border"></td><td class="p-2 border"></td><td class="p-2 border"></td>
            <td class="p-2 border text-blue-700">${sumBringBack}</td>
            <td class="p-2 border text-red-600">${btcThuVe}</td>
            <td class="p-2 border ${sumFine < 0 ? 'txt-lose' : 'text-slate-500'}">${sumFine < 0 ? sumFine : 0}</td>
            <td class="p-2 border text-blue-700">${sumThucThu}</td>
            <td class="p-2 border whitespace-nowrap">---</td>
        </tr>
        <tr class="bg-slate-100 font-extrabold">
            <td class="p-2 border text-left text-red-600 pl-3" colspan="4">Quỹ Còn (Chưa chọn)</td>
            <td class="p-2 border text-red-600 text-sm" colspan="2">${quyCon}</td>
            <td class="p-2 border" colspan="3"></td>
        </tr>
    `;
}

function addMatchToDate(dateStr) {
    if(!window.matchesData[dateStr]) window.matchesData[dateStr] = [];
    const nextId = window.matchesData[dateStr].length + 1;
    const globalMode = window.dateKeoMode[dateStr] || 'default';
    window.matchesData[dateStr].push({ 
        id: nextId, c1_p1: "", c1_p2: "", c2_p1: "", c2_p2: "", score1: "", score2: "",
        keoMode: globalMode, customWin: 5, customLose: -15
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
