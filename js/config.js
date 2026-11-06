/**
 * js/config.js - Cấu hình biến trạng thái và dữ liệu ban đầu
 */
window.isAdminUnlocked = false;
window.ADMIN_PASSWORD = "123456";

window.createdMinigames = JSON.parse(localStorage.getItem('pb_created_minigames')) || [
    { id: 'mg_bracket_default', name: 'Phú Thọ Open (Bảng & Vòng Tròn)', type: 'bracket' }
];

window.currentBracketMinigameId = localStorage.getItem('pb_current_bracket_mg_id') || 'mg_bracket_default';

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

window.dates = ["1/10/26"];
window.currentSelectedDate = "1/10/26";

window.matchesData = {
    "1/10/26": [
        { id: 1, c1_p1: "Trí Đô", c1_p2: "Tiến Thọ", c2_p1: "Phú Mỗ", c2_p2: "Thành Đàm", score1: "8", score2: "11", keoMode: "default", customWin: 5, customLose: -15 }
    ]
};

window.ABSENT_FINE_K = 30; 
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
window.fundFeeStatus = JSON.parse(localStorage.getItem('pb_fee_status')) || {};
window.fundIncomes = JSON.parse(localStorage.getItem('pb_incomes')) || [];
window.fundExpenses = JSON.parse(localStorage.getItem('pb_expenses')) || [];
window.autoIncomeNotes = JSON.parse(localStorage.getItem('pb_auto_income_notes')) || {};
