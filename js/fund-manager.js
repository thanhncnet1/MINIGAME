// ==========================================
// QUẢN LÝ QUỸ, THU CHI & XUẤT EXCEL QUỸ
// ==========================================
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
        let isTransferYes = !(pStatus && typeof pStatus === 'object' && pStatus.btcNoteAdminOption === "NO");
        if (isTransferYes) {
            let dayNetK = getBtcThuVeForDate(d);
            if (dayNetK !== 0) autoDailyIncomeTotal += Math.abs(dayNetK * 1000);
        }
    });

    const grandTotalIncome = totalManualIncome + totalQuartersIncome + autoDailyIncomeTotal;
    const totalExpense = window.fundExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const currentBalance = window.initialFund + grandTotalIncome - totalExpense;

    if(document.getElementById('stat-income')) document.getElementById('stat-income').innerText = formatVND(grandTotalIncome);
    if(document.getElementById('stat-expense')) document.getElementById('stat-expense').innerText = formatVND(totalExpense);
    if(document.getElementById('stat-balance')) document.getElementById('stat-balance').innerText = formatVND(currentBalance);
}

function renderFundMembers() {
    const searchEl = document.getElementById('member-search');
    const tbody = document.getElementById('member-list');
    const theadTr = document.getElementById('member-list-thead-tr');
    const tfoot = document.getElementById('member-list-foot');
    if(!tbody || !theadTr) return;

    let headerHtml = `<th class="py-3 px-3 w-10 text-center">STT</th><th class="py-3 px-3 min-w-[140px]">Tên Pick Thủ</th>`;
    window.activeQuarterColumns.forEach(col => {
        const c = col.bgColor || "teal";
        headerHtml += `
            <th class="py-2 px-2 text-center bg-${c}-50/80 border-x border-${c}-100 min-w-[130px]">
                <input type="text" value="${col.title}" onchange="updateDynamicQuarterTitle('${col.id}', 'title', this.value)" class="w-full text-center bg-transparent border-b border-${c}-300 font-bold text-${c}-900 text-xs focus:bg-white outline-none p-0.5 rounded">
            </th>
            <th class="py-2 px-2 text-center bg-${c}-50/50 min-w-[110px]">
                <input type="text" value="${col.statusTitle}" onchange="updateDynamicQuarterTitle('${col.id}', 'statusTitle', this.value)" class="w-full text-center bg-transparent border-b border-${c}-300 font-bold text-${c}-800 text-xs focus:bg-white outline-none p-0.5 rounded">
            </th>
        `;
    });
    headerHtml += `<th class="py-3 px-3 text-center min-w-[90px]">Thao Tác</th>`;
    theadTr.innerHTML = headerHtml;

    const search = searchEl ? searchEl.value.toLowerCase() : '';
    tbody.innerHTML = '';
    const filtered = window.players.filter(p => p.name.toLowerCase().includes(search));

    let collectedTotalsAll = getQuarterCollectedTotals();
    filtered.forEach((p, idx) => {
        let rowHtml = `<td class="py-3 px-3 text-center font-medium text-slate-500">${idx + 1}</td><td class="py-3 px-3"><span class="player-tag">${p.name}</span></td>`;
        window.activeQuarterColumns.forEach(col => {
            const qKey = col.id;
            const c = col.bgColor || "teal";
            const currentStatus = window.fundFeeStatus[`${p.id}_${qKey}_status`] || "unpaid";
            const currentAmt = window.fundFeeStatus[`${p.id}_${qKey}_amt`] !== undefined ? window.fundFeeStatus[`${p.id}_${qKey}_amt`] : col.defaultAmt;

            rowHtml += `
                <td class="py-2 px-2 text-center bg-${c}-50/20">
                    <input type="number" step="10000" value="${currentAmt}" onchange="updateQuarterAmountDirect(${p.id}, '${qKey}', this.value)" class="w-24 text-center font-bold text-${c}-900 border rounded px-1 py-0.5 bg-white outline-none text-xs">
                </td>
                <td class="py-2 px-2 text-center bg-${c}-50/20">
                    <select onchange="updateQuarterStatusDirect(${p.id}, '${qKey}', this.value)" class="text-xs font-bold p-1 rounded-full border outline-none cursor-pointer bg-slate-100">
                        <option value="unpaid" ${currentStatus === 'unpaid' ? 'selected' : ''}>Chưa đóng</option>
                        <option value="paid" ${currentStatus === 'paid' ? 'selected' : ''}>Đã đóng</option>
                        <option value="pause" ${currentStatus === 'pause' ? 'selected' : ''}>Tạm nghỉ</option>
                    </select>
                </td>
            `;
        });
        rowHtml += `<td class="py-3 px-3 text-center"><button onclick="deleteFundPlayerRow(${p.id})" class="text-red-600 text-xs bg-red-50 border border-red-200 px-2 py-1 rounded-lg">Xóa</button></td>`;
        const tr = document.createElement('tr');
        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });
}

function renderFundIncomes() {
    const tbody = document.getElementById('income-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    (window.fundIncomes || []).forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-xs text-slate-500">${formatDate(item.date)}</td>
            <td class="py-2.5 px-3 font-medium text-slate-800">${item.desc}</td>
            <td class="py-2.5 px-3 text-right font-semibold text-emerald-600">+${formatVND(item.amount)}</td>
            <td class="py-2.5 px-3 text-xs"><span class="player-tag">${item.source}</span></td>
            <td class="py-2.5 px-3 text-xs text-slate-600">${item.note || '---'}</td>
            <td class="py-2.5 px-3 text-center"><button onclick="deleteFundTx(${item.id}, 'income')" class="text-rose-500"><i class="fa-solid fa-trash-can"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderFundExpenses() {
    const tbody = document.getElementById('expense-list');
    if(!tbody) return;
    tbody.innerHTML = '';
    (window.fundExpenses || []).forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-xs text-slate-500">${formatDate(item.date)}</td>
            <td class="py-2.5 px-3 font-medium text-slate-800">${item.desc}</td>
            <td class="py-2.5 px-3 text-right font-semibold text-rose-600">-${formatVND(item.amount)}</td>
            <td class="py-2.5 px-3 text-xs"><span class="player-tag">${item.source}</span></td>
            <td class="py-2.5 px-3 text-xs text-slate-600">${item.note || '---'}</td>
            <td class="py-2.5 px-3 text-center"><button onclick="deleteFundTx(${item.id}, 'expense')" class="text-rose-500"><i class="fa-solid fa-trash-can"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function saveFundData() {
    localStorage.setItem('pb_fee_status', JSON.stringify(window.fundFeeStatus));
    localStorage.setItem('pb_incomes', JSON.stringify(window.fundIncomes));
    localStorage.setItem('pb_expenses', JSON.stringify(window.fundExpenses));
    updateFundDashboard();
    autoBackupData();
    if(window.syncToFirebase) window.syncToFirebase();
}

function deleteFundTx(id, type) {
    requireAdminAuth(() => {
        if(confirm("Bạn có muốn xóa giao dịch này?")) {
            if(type === 'income') window.fundIncomes = window.fundIncomes.filter(i => i.id !== id);
            else window.fundExpenses = window.fundExpenses.filter(i => i.id !== id);
            saveFundData();
        }
    });
}

function updateQuarterAmountDirect(playerId, qKey, val) {
    requireAdminAuth(() => {
        window.fundFeeStatus[`${playerId}_${qKey}_amt`] = Number(val) || 0;
        saveFundData();
    });
}

function updateQuarterStatusDirect(playerId, qKey, val) {
    requireAdminAuth(() => {
        window.fundFeeStatus[`${playerId}_${qKey}_status`] = val;
        saveFundData();
    });
}

function deleteFundPlayerRow(playerId) {
    requireAdminAuth(() => {
        if (confirm(`Bạn có chắc chắn muốn XÓA Pick thủ này khỏi Quỹ?`)) {
            window.players = window.players.filter(item => item.id !== playerId);
            localStorage.setItem('pb_players_list', JSON.stringify(window.players));
            refreshAllViews();
        }
    });
}
