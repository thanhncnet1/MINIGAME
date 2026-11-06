// ==========================================
// QUẢN LÝ MINIGAMES (TEAM A/B & M2 BẢNG ĐẤU)
// ==========================================
function renderMinigameTeamTab() {
    renderHeaderNameTeam();
    renderTeamListsTeam();
    renderM1ScheduleTeam();
}

function renderHeaderNameTeam() {
    const el = document.getElementById('current-tourney-name');
    if(el) el.innerText = window.minigameTeamData.tourneyName || "MINIGAME TEAM A & B";
}

function saveTeamData() {
    localStorage.setItem('pb_minigame_team_standalone_data', JSON.stringify(window.minigameTeamData));
}

function renderTeamListsTeam() {
    const listA = document.getElementById('team-A-list');
    const listB = document.getElementById('team-B-list');
    if(!listA || !listB) return;

    document.getElementById('team-A-count').innerText = window.minigameTeamData.teamA.length;
    document.getElementById('team-B-count').innerText = window.minigameTeamData.teamB.length;

    listA.innerHTML = window.minigameTeamData.teamA.map((name, i) => `
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200 shadow-sm">
            <span class="text-xs font-bold text-blue-700">${i + 1}. <span class="player-tag">${name}</span></span>
        </div>
    `).join('');

    listB.innerHTML = window.minigameTeamData.teamB.map((name, i) => `
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-200 shadow-sm">
            <span class="text-xs font-bold text-orange-700">${i + 1}. <span class="player-tag">${name}</span></span>
        </div>
    `).join('');
}

function renderM1ScheduleTeam() {
    const tbody = document.getElementById('m1-schedule-body');
    const countEl = document.getElementById('m1-match-count');
    if(!tbody) return;

    const matches = window.minigameTeamData.matches;
    countEl.innerText = matches.length;
    let playerKeoStats = {};
    [...window.minigameTeamData.teamA, ...window.minigameTeamData.teamB].forEach(v => {
        playerKeoStats[v] = { name: v, team: window.minigameTeamData.teamA.includes(v) ? 'A' : 'B', played: 0, wins: 0, losses: 0, winK: 0, loseK: 0, total: 0 };
    });

    tbody.innerHTML = matches.map((m, index) => `
        <tr>
            <td class="font-bold text-center">${index + 1}</td>
            <td class="text-center font-semibold">${m.noidung || ''}</td>
            <td class="text-center font-bold text-blue-800">${m.a1} - ${m.a2}</td>
            <td class="text-center">${m.scoreA ?? ''} - ${m.scoreB ?? ''}</td>
            <td class="text-center font-bold text-orange-800">${m.b1} - ${m.b2}</td>
        </tr>
    `).join('');
}

function renderM2() {
    renderM2Pairs();
}

function renderM2Pairs() {
    const boxA = document.getElementById('m2-pairs-A');
    const boxB = document.getElementById('m2-pairs-B');
    if(!boxA || !boxB) return;
    boxA.innerHTML = ''; boxB.innerHTML = '';

    document.getElementById('count-m2-A').innerText = window.m2PairsA.length;
    document.getElementById('count-m2-B').innerText = window.m2PairsB.length;

    window.m2PairsA.forEach((pair, idx) => {
        boxA.innerHTML += `<div class="flex items-center justify-between bg-white p-2 rounded border text-xs shadow-sm">Cặp ${idx+1}: <span class="player-tag">${pair.p1}</span> & <span class="player-tag">${pair.p2}</span></div>`;
    });
    window.m2PairsB.forEach((pair, idx) => {
        boxB.innerHTML += `<div class="flex items-center justify-between bg-white p-2 rounded border text-xs shadow-sm">Cặp ${idx+1}: <span class="player-tag">${pair.p1}</span> & <span class="player-tag">${pair.p2}</span></div>`;
    });
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
