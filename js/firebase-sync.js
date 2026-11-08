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

// Biến lưu trữ bộ hẹn giờ debounce cho Firebase
let firebaseSyncTimer = null;

// Hàm tự động đẩy dữ liệu lên Cloud có áp dụng Debounce (Tránh gọi liên tục gây chậm)
window.syncToFirebase = function(immediate = false) {
    if (!db) return;

    const executeSync = () => {
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

    if (immediate) {
        clearTimeout(firebaseSyncTimer);
        executeSync();
    } else {
        // Trì hoãn 1.5 giây sau thao tác cuối cùng mới gọi Firebase để tối ưu tốc độ mạng
        clearTimeout(firebaseSyncTimer);
        firebaseSyncTimer = setTimeout(executeSync, 1500);
    }
};
// Hàm tải dữ liệu từ Cloud khi khởi động ứng dụng trên thiết bị mới
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
