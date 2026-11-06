// ==========================================
// XỬ LÝ PICK THỦ XIN NGHỈ + CỘT XIN NGHỈ (BẢNG TỔNG HỢP KÈO NGÀY)
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

function getAbsentInfo(dateStr) {
    const o = getDayStatusObj(dateStr, false) || {};
    let players = Array.isArray(o.absentPlayers) ? o.absentPlayers.map(x => x || '') : [];
    let count = parseInt(o.absentCount);
    if (isNaN(count)) count = players.filter(Boolean).length;
    while (players.length < count) players.push('');
    if (players.length > count) players = players.slice(0, count);
    return { count: count, players: players, status: o.absentStatusMap || {} };
}

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

function setAbsentCount(dateStr, val) {
    const n = Math.max(0, parseInt(val) || 0);
    const o = getDayStatusObj(dateStr, true);
    const info = getAbsentInfo(dateStr);
    let players = info.players.slice(0, n);
    while (players.length < n) players.push('');
    o.absentCount = n;
    o.absentPlayers = players;
    const status = o.absentStatusMap || {};
    Object.keys(status).forEach(k => { if (!players.includes(k)) delete status[k]; });
    o.absentStatusMap = status;
    persistAbsentChange();
}

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
    if (name && !status[name]) status[name] = 'unexcused';
    o.absentStatusMap = status;
    persistAbsentChange();
}

function setAbsentStatus(dateStr, playerName, statusValue) {
    const o = getDayStatusObj(dateStr, true);
    if (!o.absentStatusMap) o.absentStatusMap = {};
    o.absentStatusMap[playerName] = (statusValue === 'excused') ? 'excused' : 'unexcused';
    persistAbsentChange();
}

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

function ensureDaySummaryAbsentHeader(sumBody) {
    try {
        const table = sumBody && sumBody.closest ? sumBody.closest('table') : null;
        if (!table) return;
        const headRow = table.querySelector('thead tr');
        if (!headRow) return;
        const ths = Array.from(headRow.children);
        if (ths.some(t => t.getAttribute('data-col') === 'absent' || t.textContent.normalize('NFC').toUpperCase().includes('XIN NGHỈ'.normalize('NFC')))) return;
        let target = ths.find(t => /TH[ỰỰ]C\s*T[Ếế]/i.test(t.textContent.normalize('NFC')));
        const th = document.createElement('th');
        th.setAttribute('data-col', 'absent');
        th.className = 'p-2 border w-28 bg-rose-50 text-rose-800';
        th.textContent = 'XIN NGHỈ';
        if (target) headRow.insertBefore(th, target);
        else if (ths.length >= 7) headRow.insertBefore(th, ths[6]);
        else headRow.appendChild(th);
    } catch (e) { console.warn('ensureDaySummaryAbsentHeader:', e); }
}

function removeLegacyAbsentBox() {
    try {
        const sel = document.getElementById('absent-players-select');
        if (!sel) return;
        let target = sel;
        while (target.parentElement) {
            const p = target.parentElement;
            if (['BODY', 'SECTION', 'TABLE', 'MAIN'].includes(p.tagName) || /^tab-/.test(p.id || '')) break;
            const clone = p.cloneNode(true);
            if (clone.querySelector('#absent-players-select')) clone.querySelector('#absent-players-select').remove();
            let rest = (clone.textContent || '').replace(/\s+/g, ' ').trim();
            if (rest.length > 40) break;
            target = p;
        }
        target.remove();
    } catch (e) { console.warn('removeLegacyAbsentBox:', e); }
}
