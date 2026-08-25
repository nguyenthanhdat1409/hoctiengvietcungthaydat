/* =========================================================
   HỌC TIẾNG VIỆT CÙNG THẦY ĐẠT — app.js
   ========================================================= */

const CATS = {
  tuvung:  {name:"Hình → từ", chip:"#ECFEFF;color:#0E7490;border:2px solid #06B6D4", color:"#06B6D4", emoji:"🖼️"},
  hoithoai:{name:"Hội thoại An & Bảo", chip:"#F0FDFA;color:#0F766E;border:2px solid #14B8A6", color:"#14B8A6", emoji:"💬"},
  matchu:  {name:"Mặt chữ", chip:"#FEF9C3;color:#854D0E;border:2px solid #F59E0B", color:"#F59E0B", emoji:"🔤"},
  anhviet: {name:"Anh → Việt", chip:"#F0FDF4;color:#166534;border:2px solid #22C55E", color:"#22C55E", emoji:"🌏"},
  dauthanh:{name:"Dấu thanh", chip:"#F5F3FF;color:#5B21B6;border:2px solid #8B5CF6", color:"#8B5CF6", emoji:"🎵"},
  noi:     {name:"Nói", chip:"#FDF4FF;color:#86198F;border:2px solid #D946EF", color:"#D946EF", emoji:"🎤"},
  viet:    {name:"Xếp câu (Viết)", chip:"#FEF2F2;color:#991B1B;border:2px solid #F87171", color:"#F87171", emoji:"🧩"},
  doc:     {name:"Đọc hiểu", chip:"#FFF7ED;color:#9A3412;border:2px solid #FB923C", color:"#FB923C", emoji:"📖"},
  nghe:    {name:"Nghe", chip:"#EEF2FF;color:#3730A3;border:2px solid #6366F1", color:"#6366F1", emoji:"🎧"},
};

/* =========================================================
   HỆ THỐNG THEO DÕI TIẾN ĐỘ (localStorage)
   ========================================================= */
const PROGRESS_KEY = "thaydat_progress_v1";
function loadProgress(){
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || defaultProgress(); }
  catch { return defaultProgress(); }
}
function defaultProgress(){
  return {
    lessonsViewed: [],   // mảng index bài học đã xem
    quizHighScore: 0,   // điểm cao nhất kiểm tra
    totalQuizzes: 0,    // số lần làm kiểm tra
    totalStars: 0,      // tổng số sao kiểm tra
    streak: 0,          // ngày học liên tiếp
    lastStudyDate: null,// ngày học cuối (YYYY-MM-DD)
    badges: [],         // badge đã đạt
    xp: 0,              // tổng XP
  };
}
function saveProgress(p){ localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }
let progress = loadProgress();

function addXP(amount){
  progress.xp += amount;
  checkBadges();
  saveProgress(progress);
}
function recordQuiz(score, total){
  progress.totalQuizzes++;
  const pct = Math.round(score / total * 100);
  if(pct > progress.quizHighScore) progress.quizHighScore = pct;
  progress.totalStars += Math.round(score);
  updateStreak();
  addXP(Math.round(score * 10));
  saveProgress(progress);
}
function markLessonViewed(idx){
  if(!progress.lessonsViewed.includes(idx)){
    progress.lessonsViewed.push(idx);
    addXP(20);
    saveProgress(progress);
  }
}
function updateStreak(){
  const today = new Date().toISOString().slice(0,10);
  const last = progress.lastStudyDate;
  if(last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  progress.streak = (last === yesterday) ? progress.streak + 1 : 1;
  progress.lastStudyDate = today;
  checkBadges();
  saveProgress(progress);
}
const BADGES = [
  {id:"first_quiz", icon:"🎯", name:"Lần đầu chơi", desc:"Hoàn thành bài kiểm tra đầu tiên", check: () => progress.totalQuizzes >= 1},
  {id:"streak3", icon:"🔥", name:"3 ngày liên tiếp", desc:"Học 3 ngày liên tiếp", check: () => progress.streak >= 3},
  {id:"streak7", icon:"🌟", name:"1 tuần liên tiếp", desc:"Học 7 ngày liên tiếp", check: () => progress.streak >= 7},
  {id:"high80", icon:"💎", name:"Đỉnh cao", desc:"Đạt trên 80% điểm kiểm tra", check: () => progress.quizHighScore >= 80},
  {id:"all_lessons", icon:"📚", name:"Thủ khoa", desc:"Xem hết tất cả bài học", check: () => progress.lessonsViewed.length >= LESSONS.length},
  {id:"xp500", icon:"💪", name:"Siêu nhân", desc:"Đạt 500 XP tổng cộng", check: () => progress.xp >= 500},
];
function checkBadges(){
  BADGES.forEach(b => {
    if(!progress.badges.includes(b.id) && b.check()){
      progress.badges.push(b.id);
      burst(8, ["🎉","⭐","💜"]);
    }
  });
}
function getBadges(){ return BADGES.filter(b => progress.badges.includes(b.id)); }

// Ngân hàng câu hỏi theo sao: 1⭐ trung bình · 2⭐ khá · 3⭐ khó
const BANK = {
1: [
  {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐱", opts:["Con mèo","Con chó","Con gà","Con cá"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐟", opts:["Con chim","Con cá","Con vịt","Con tôm"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐔", opts:["Con chó","Con gà","Con mèo","Con heo"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là cái gì?", glyph:"🍎", opts:["Quả chuối","Quả táo","Quả cam","Quả dưa"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là cái gì?", glyph:"🥛", opts:["Nước ngọt","Sữa","Trà","Cà phê"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Quả nào màu ĐỎ?", opts:["🍌","🍇","🍎","🥒"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào là CON BÒ?", opts:["🐔","🐷","🐮","🐸"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào dùng để BƠI?", opts:["🏊","🎾","🏓","⚽"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Đâu là TRƯỜNG HỌC?", opts:["🏫","🏥","🏪","🏖️"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là cái gì?", glyph:"✈️", opts:["Xe đạp","Máy bay","Tàu hỏa","Thuyền"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Trời đang làm sao?", glyph:"🌈", opts:["Trời nắng","Trời mưa","Trời đẹp","Trời lạnh"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào là CON CHÓ?", opts:["🐱","🐶","🐹","🐰"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào là CẦU THANG?", opts:["🪜","🚪","🪟","🛋️"], a:0},
   {cat:"anhviet", type:"glyph", q:"\"Apple\" nghĩa là gì?", glyph:"Apple 🍎", opts:["Quả chuối","Quả táo","Quả cam","Quả măng cụt"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Book\" là gì?", glyph:"Book 📚", opts:["Bút","Sách","Vở","Thước"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Water\" là gì?", glyph:"Water 💧", opts:["Sữa","Nước","Trà","Cà phê"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"School\" là gì?", glyph:"School 🏫", opts:["Bệnh viện","Trường học","Chợ","Công viên"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Happy\" là gì?", glyph:"Happy 😊", opts:["Buồn","Vui","Giận","Sợ"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Moon\" là gì?", glyph:"Moon 🌙", opts:["Mặt trời","Mặt trăng","Sao","Đám mây"], a:1},
   {cat:"noi", type:"speak", q:"Bạn thích chơi thể thao gì nhất? Vì sao?"},
   {cat:"noi", type:"speak", q:"Hãy kể tên 3 món ăn bạn thích ăn?"},
   {cat:"noi", type:"speak", q:"Bạn thường đi học bằng cách gì? (xe đạp, đi bộ, xe buýt...)"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Con","mèo","đang","ngủ"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Hôm","nay","trời","nắng"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Bạn","tên","là","gì"]},
   {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐘", opts:["Con voi","Con bò","Con hổ","Con gấu"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐰", opts:["Con chuột","Con thỏ","Con mèo","Con sóc"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là cái gì?", glyph:"🌙", opts:["Mặt trời","Ngôi sao","Mặt trăng","Đám mây"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Quả nào màu VÀNG?", opts:["🍎","🍌","🍇","🍆"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào biết BAY?", opts:["🐟","🐦","🐘","🐢"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào là CÁI Ô (dù)?", opts:["🌂","🎒","👟","🧢"], a:0},
   {cat:"anhviet", type:"glyph", q:"\"Dog\" là gì?", glyph:"Dog 🐶", opts:["Con mèo","Con chó","Con gà","Con vịt"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"House\" là gì?", glyph:"House 🏠", opts:["Trường học","Ngôi nhà","Cửa hàng","Bệnh viện"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Tree\" là gì?", glyph:"Tree 🌳", opts:["Hoa","Cỏ","Cây","Lá"], a:2},
   {cat:"anhviet", type:"glyph", q:"\"Milk\" là gì?", glyph:"Milk 🥛", opts:["Nước","Sữa","Trà","Cơm"], a:1},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"ô", opts:["o","ô","ơ","u"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"ư", opts:["u","ơ","ư","i"], a:2, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"cá", opts:["ca","cà","cá","cạ"], a:2, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"mẹ", opts:["me","mè","mé","mẹ"], a:3, letterOpts:true},
   {cat:"noi", type:"speak", q:"Bạn tên là gì? Bạn học lớp mấy?"},
   {cat:"noi", type:"speak", q:"Hãy kể tên các con vật mà bạn yêu thích?"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Em","bé","đang","cười"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Chim","hót","trên","cây"]},
   {cat:"doc", type:"read", passage:"Nhà bạn Minh có một cây ổi. Mỗi mùa hè, cây ra rất nhiều quả ngọt.",
     q:"Nhà bạn Minh trồng cây gì?", opts:["Cây xoài","Cây ổi","Cây cam","Cây chuối"], a:1},
   {cat:"nghe", type:"hear", say:"con mèo", q:"Nghe rồi chọn đúng từ nha!", opts:["con mèo","con chó","con gà","con cá"], a:0},
   {cat:"nghe", type:"hear", say:"quả táo", q:"Nghe rồi chọn đúng từ nha!", opts:["quả cam","quả táo","quả nho","quả chuối"], a:1},
   {cat:"nghe", type:"hear", say:"màu đỏ", q:"Nghe rồi chọn đúng màu nha!", opts:["màu xanh","màu vàng","màu đỏ","màu tím"], a:2},
   {cat:"nghe", type:"hear", say:"cái mũi", q:"Nghe rồi chọn đúng bộ phận nha!", opts:["cái tai","con mắt","cái mũi","cái miệng"], a:2},
   {cat:"dauthanh", type:"tf", q:"Con mèo thường kêu \"meo meo\".", opts:["Đúng","Sai"], a:0},
   {cat:"tuvung", type:"tf", q:"Quả chuối có màu xanh da trời.", opts:["Đúng","Sai"], a:1},
   {cat:"tuvung", type:"tf", q:"Buổi tối chúng ta nhìn thấy Mặt Trăng trên trời.", opts:["Đúng","Sai"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là bộ phận nào trên cơ thể?", glyph:"👂", opts:["Cái tai","Con mắt","Cái mũi","Cái miệng"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là cái gì? (đồ dùng học tập)", glyph:"✏️", opts:["Cục tẩy","Bút chì","Cái thước","Quyển vở"], a:1},
],
2: [
  {cat:"tuvung", type:"emojiQ", q:"Đây là chỗ nào?", glyph:"🏫", opts:["Bệnh viện","Chợ","Trường học","Công viên"], a:2},
  {cat:"tuvung", type:"emojiQ", q:"Trời đang làm sao?", glyph:"🌧️", opts:["Trời nắng","Trời mưa","Trời gió","Trời tuyết"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Bạn ấy đang làm gì?", glyph:"🏊", opts:["Chạy bộ","Bơi","Nhảy dây","Leo núi"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là chỗ nào?", glyph:"🏥", opts:["Bệnh viện","Chợ","Trường học","Công viên"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là con gì?", glyph:"🐘", opts:["Con voi","Con heo","Con hổ","Con gấu"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào là CON VỊT?", opts:["🐔","🐷","🦆","🐸"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Quả nào là QUẢ CAM?", opts:["🍌","🍇","🍊","🍉"], a:2},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào dùng để ĐỌC SÁCH?", opts:["🖊️","📚","🎒","🖐️"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Đâu là CÔNG VIÊN?", opts:["🏫","🏥","🏪","🏖️"], a:3},
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Chào Bảo! Bạn khỏe không?"],["bao","…?…"]],
     opts:["Mình khỏe, cảm ơn bạn!","Mình tên là Bảo.","Tạm biệt nhé!","Mình 10 tuổi."], a:0},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","An ơi, bạn mấy tuổi?"],["an","…?…"]],
     opts:["Mình thích ăn phở.","Nhà mình ở gần đây.","Mình 11 tuổi.","Hôm nay trời đẹp."], a:2},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","Bạn học lớp mấy?"],["an","…?…"]],
     opts:["Mình học lớp 6.","Mình thích màu đỏ.","Nhà mình có ba người.","Mình đói bụng quá."], a:0},
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Bạn thích ăn gì?"],["bao","…?…"]],
     opts:["Mình thích ăn phở!","Mình 9 tuổi.","Mình ở Hà Nội.","Mình không thích học."], a:0},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"ă", opts:["a","ă","â","e"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"đ", opts:["b","p","d","đ"], a:3, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"ê", opts:["e","ê","ơ","â"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"ơ", opts:["o","ô","ơ","ư"], a:2, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Chữ này là chữ gì?", glyph:"â", opts:["a","ă","â","ê"], a:2, letterOpts:true},
   {cat:"anhviet", type:"glyph", q:"\"Eat\" nghĩa là gì?", glyph:"Eat 🍜", opts:["Ngủ","Chạy","Ăn","Uống"], a:2},
   {cat:"anhviet", type:"glyph", q:"\"Sleep\" nghĩa là gì?", glyph:"Sleep 🛏️", opts:["Ngủ","Ăn","Học","Chơi"], a:0},
   {cat:"anhviet", type:"glyph", q:"\"Family\" là gì?", glyph:"Family 👨‍👩‍👧", opts:["Bạn bè","Gia đình","Thầy cô","Hàng xóm"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Teacher\" là gì?", glyph:"Teacher 👩‍🏫", opts:["Bác sĩ","Thầy cô","Bạn bè","Cửa hàng"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Run\" nghĩa là gì?", glyph:"Run 🏃", opts:["Đi","Ngồi","Chạy","Nhảy"], a:2},
   {cat:"dauthanh", type:"emojiQ", q:"Đây là ai? Chọn đúng dấu!", glyph:"👨", opts:["Ba","Bá","Bà","Bạ"], a:0, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"má", opts:["ma","mà","má","mạ"], a:2, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"bà", opts:["ba","bà","bá","bạ"], a:1, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Con này là con gì?", glyph:"🐻", opts:["Gấu","Chó","Mèo","Heo"], a:0},
   {cat:"noi", type:"speak", q:"Bạn thích ăn món gì nhất? Món đó có gì ngon?"},
   {cat:"noi", type:"speak", q:"Cuối tuần bạn thường làm gì? Kể 2–3 việc nha?"},
   {cat:"noi", type:"speak", q:"Hãy giới thiệu về gia đình của bạn (nhà có mấy người, là ai)?"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Mình","thích","ăn","phở","bò"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Hôm nay","trời","đẹp","quá"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Bạn","học","lớp","mấy","vậy"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Con","chó","của","mình","trắng"]},
   {cat:"doc", type:"read", passage:"Bé Na có một con mèo. Con mèo màu đen, rất thích ngủ.",
     q:"Con mèo của Na màu gì?", opts:["Màu trắng","Màu đen","Màu vàng","Màu xám"], a:1},
   {cat:"doc", type:"read", passage:"Hôm nay trời mưa to. An ở nhà đọc truyện tranh với em gái.",
     q:"Vì sao An ở nhà?", opts:["Vì An bị ốm","Vì trời mưa to","Vì An lười","Vì mẹ bảo thế"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào SỐNG DƯỚI NƯỚC?", opts:["🐔","🐟","🐘","🐴"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào để VIẾT?", opts:["🖊️","🍽️","🎈","🧦"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Đây là bộ phận nào trên cơ thể?", glyph:"👁️", opts:["Cái tai","Con mắt","Cái mũi","Cái miệng"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là nghề gì?", glyph:"👩‍⚕️", opts:["Giáo viên","Bác sĩ","Đầu bếp","Nông dân"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Read\" nghĩa là gì?", glyph:"Read 📖", opts:["Viết","Đọc","Nghe","Nói"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Doctor\" là gì?", glyph:"Doctor 👨‍⚕️", opts:["Giáo viên","Bác sĩ","Kỹ sư","Ca sĩ"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Winter\" là gì?", glyph:"Winter ❄️", opts:["Mùa hè","Mùa đông","Mùa xuân","Mùa thu"], a:1},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"trường", opts:["Trương","Trường","Trưởng","Trượng"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này bắt đầu bằng phụ âm ghép nào?", glyph:"nhà", opts:["nh","ng","ch","th"], a:0, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Số này đọc là gì?", glyph:"4️⃣", opts:["Bốn","Bốn?","Bồn","Bổn"], a:0, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"ngã", opts:["nga","ngà","ngá","ngã"], a:3, letterOpts:true},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","Bạn có khỏe không?"],["an","…?…"]],
     opts:["Mình khỏe, cảm ơn bạn!","Mình tên là An.","Nhà mình ở xa.","Mình thích màu xanh."], a:0},
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Mình mượn bút một chút được không?"],["bao","…?…"]],
     opts:["Được chứ, bạn cầm đi!","Mình 10 tuổi.","Trời hôm nay đẹp.","Mình đi học rồi."], a:0},
   {cat:"noi", type:"speak", q:"Hãy kể về một ngày đi học của bạn (buổi sáng làm gì)?"},
   {cat:"noi", type:"speak", q:"Bạn thích mùa nào nhất trong năm? Vì sao?"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Mẹ","nấu","cơm","rất","ngon"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Buổi","sáng","em","đánh","răng"]},
   {cat:"doc", type:"read", passage:"Chủ nhật, cả nhà bạn Hoa đi công viên. Hoa chơi cầu trượt, còn em Bi thì tập đi xe đạp.",
     q:"Em Bi làm gì ở công viên?", opts:["Chơi cầu trượt","Tập đi xe đạp","Đá bóng","Ăn kem"], a:1},
   {cat:"nghe", type:"hear", say:"trường học", q:"Nghe rồi chọn đúng nơi chốn nha!", opts:["bệnh viện","trường học","cửa hàng","công viên"], a:1},
   {cat:"nghe", type:"hear", say:"bác sĩ", q:"Nghe rồi chọn đúng nghề nghiệp nha!", opts:["giáo viên","nông dân","bác sĩ","đầu bếp"], a:2},
   {cat:"nghe", type:"hear", say:"mùa xuân", q:"Nghe rồi chọn đúng mùa nha!", opts:["mùa hạ","mùa thu","mùa đông","mùa xuân"], a:3},
   {cat:"nghe", type:"hear", say:"cặp sách", q:"Nghe rồi chọn đúng đồ dùng nha!", opts:["cặp sách","bút chì","quyển vở","cái thước"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào KHÔNG phải con vật?", opts:["🐮","🐔","🍎","🐟"], a:2},
   {cat:"tuvung", type:"emojiQ", q:"Đây là nghề gì?", glyph:"👨‍🍳", opts:["Đầu bếp","Bác sĩ","Thợ xây","Ca sĩ"], a:0},
   {cat:"tuvung", type:"emojiQ", q:"Trời đang thế nào?", glyph:"💨", opts:["Trời nắng","Trời mưa","Trời gió","Trời tuyết"], a:2},
   {cat:"matchu", type:"tf", q:"\"gh\" đi được với e, ê, i — ví dụ: ghế, ghi.", opts:["Đúng","Sai"], a:0},
   {cat:"matchu", type:"tf", q:"Chữ \"Y\" có thể đứng đầu một từ tiếng Việt.", opts:["Đúng","Sai"], a:1},
   {cat:"matchu", type:"glyph", q:"Từ này bắt đầu bằng phụ âm ghép nào?", glyph:"khỉ", opts:["kh","ch","nh","th"], a:0, letterOpts:true},
   {cat:"anhviet", type:"tf", q:"\"ăn\" là một động từ (chỉ hành động).", opts:["Đúng","Sai"], a:0},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Em","rửa","tay","trước","khi","ăn"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Cô","giáo","đang","giảng","bài"]},
],
3: [
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Bạn thích ăn gì nhất?"],["bao","…?…"]],
     opts:["Mình đi học bằng xe buýt.","Mình thích ăn phở bò!","Mình có một con mèo.","Mình học lớp 5."], a:1},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","Chủ nhật mình đi đá bóng nha?"],["an","…?…"]],
     opts:["Mình ăn cơm rồi.","Con mèo của mình màu đen.","Hôm qua trời mưa.","Ok luôn! Mấy giờ vậy?"], a:3},
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Bạn ơi, quyển sách này của ai vậy?"],["bao","…?…"]],
     opts:["Của mình đó, cảm ơn bạn nha!","Mình đi ngủ đây.","Trời hôm nay nóng quá.","Mình không thích ăn cá."], a:0},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","Mày có muốn đi xem phim không?"],["an","…?…"]],
     opts:["Được nha! Chiều nay mày rảnh không?","Mình đang làm bài tập.","Mình không thích xem phim.","Hôm nay trời đẹp quá."], a:0},
   {cat:"matchu", type:"text", q:"Bấm vào chữ Ơ!", opts:["o","ô","ơ","u"], a:2, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"mẹ", opts:["me","mè","mê","mẹ"], a:3, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"cơm", opts:["com","cơm","cốm","cợm"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"má", opts:["ma","mà","má","mạ"], a:2, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"bà", opts:["ba","bà","bá","bạ"], a:1, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"ngựa", opts:["Ngứa","Ngưa","Ngừa","Ngựa"], a:3, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Đây là ai? Chọn từ đúng dấu!", glyph:"👵", opts:["Ba","Bà","Bá","Bạ"], a:1, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Số này đọc là gì?", glyph:"5️⃣", opts:["Nắm","Nằm","Năm","Nậm"], a:2, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Con này là con gì? Nhìn kỹ dấu nha!", glyph:"🐴", opts:["Ngứa","Ngưa","Ngừa","Ngựa"], a:3, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Đây là gì? Nhìn kỹ dấu nha!", glyph:"🧂", opts:["Muôi","Muối","Muồi","Muội"], a:1, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"mẹ", opts:["mẹ","mề","mễ","mệ"], a:0, letterOpts:true},
    {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì?", glyph:"cá", opts:["cá","cả","cã","cạ"], a:0, letterOpts:true},
   {cat:"tuvung", type:"emojiQ", q:"Đây là loại phương tiện gì?", glyph:"🚂", opts:["Xe hơi","Tàu hỏa","Xe buýt","Xe đạp"], a:1},
   {cat:"tuvung", type:"emojiQ", q:"Đây là loại trái cây gì?", glyph:"🍇", opts:["Nho","Dâu","Táo","Cam"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Con nào là CON VOI?", opts:["🐘","🦒","🦁","🐯"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Đâu là BỆNH VIỆN?", opts:["🏫","🏥","🏪","🏖️"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào là ĐỒNG HỒ?", opts:["⌚","📱","💻","📷"], a:0},
   {cat:"anhviet", type:"glyph", q:"\"Friend\" là gì?", glyph:"Friend 👫", opts:["Thầy cô","Bạn bè","Gia đình","Hàng xóm"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Sun\" là gì?", glyph:"Sun ☀️", opts:["Mặt trăng","Mặt trời","Sao","Đám mây"], a:1},
   {cat:"anhviet", type:"glyph", q:"\"Cat\" tiếng Việt là gì?", glyph:"Cat 🐱", opts:["Con chó","Con mèo","Con heo","Con gà"], a:1},
   {cat:"noi", type:"speak", q:"Nếu bạn có 100.000 đồng, bạn sẽ mua gì? Vì sao?"},
   {cat:"noi", type:"speak", q:"Hãy mô tả người bạn thân nhất của bạn (cao/thấp, tóc dài/ngắn, tính cách...)"},
   {cat:"noi", type:"speak", q:"Bạn thích học môn gì nhất? Môn đó có gì thú vị?"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Chủ","nhật","mình","đi","chơi","công","viên"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Bà","tôi","đang","đọc","báo","ở","phòng","khách"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Học","sinh","đi","học","bằng","xe","đạp"]},
   {cat:"doc", type:"read", passage:"Mẹ đi chợ mua cá, thịt, rau và trái cây. Về nhà, mẹ nấu cơm và làm cá kho tộ. Cả nhà ăn rất ngon miệng.",
     q:"Mẹ đi chợ mua những gì?", opts:["Cá, thịt, rau, trái cây","Cơm, phở, bánh","Sách, bút, vở","Áo, quần, giày"], a:0},
   {cat:"doc", type:"read", passage:"Nam là bạn của An. Cả hai rất thích chơi bóng rổ. Chiều nay, Nam và An sẽ đến nhà An làm bài tập rồi chơi game.",
     q:"Nam và An thích chơi gì?", opts:["Bóng rổ","Bóng đá","Bơi lội","Cầu lông"], a:0},
   {cat:"doc", type:"read", passage:"Trong lớp có 40 học sinh. Có 20 em học giỏi, 15 em học khá và 5 em học trung bình. Cô giáo rất tự hào về lớp mình.",
     q:"Có bao nhiêu em học khá?", opts:["20 em","15 em","5 em","40 em"], a:1},
   {cat:"doc", type:"read", passage:"Bé Lan dậy sớm, đánh răng, rửa mặt rồi ăn sáng với bà. Sau đó, Lan đến trường cùng mẹ. Ở trường, Lan học rất chăm chỉ.",
     q:"Bé Lan ăn sáng với ai?", opts:["Với mẹ","Với bà","Với bố","Một mình"], a:1},
   {cat:"matchu", type:"glyph", q:"Từ nào viết ĐÚNG chính tả?", glyph:"🪑", opts:["cái ghế","cái gế","cái ghê","cái kế"], a:0, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Điền phụ âm đúng: ...i chợ (đi chợ)", glyph:"...i chợ", opts:["đ","d","gi","t"], a:0, letterOpts:true},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"nghé", opts:["Ngé","Nghé","Nge","Nghe"], a:1, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Từ này đọc là gì? Nhìn kỹ dấu nha!", glyph:"đũa", opts:["đua","đùa","đúa","đũa"], a:3, letterOpts:true},
   {cat:"dauthanh", type:"emojiQ", q:"Đây là gì? Nhìn kỹ dấu nha!", glyph:"🥭", opts:["Xoai","Xoài","Xoái","Xoải"], a:1, letterOpts:true},
   {cat:"tuvung", type:"emojiQ", q:"Đây là nghề gì?", glyph:"👨‍🌾", opts:["Bác sĩ","Nông dân","Thợ xây","Phi công"], a:1},
   {cat:"tuvung", type:"emojiOpts", q:"Cái nào MẶC vào người?", opts:["👕","🍳","📕","🔑"], a:0},
   {cat:"anhviet", type:"glyph", q:"\"Yesterday\" nghĩa là gì?", glyph:"Yesterday 📅", opts:["Hôm nay","Ngày mai","Hôm qua","Tuần sau"], a:2},
   {cat:"anhviet", type:"glyph", q:"\"Beautiful\" nghĩa là gì?", glyph:"Beautiful 🌸", opts:["Xấu","Đẹp","To","Nhỏ"], a:1},
   {cat:"hoithoai", type:"chat", q:"An sẽ trả lời thế nào?",
     chat:[["bao","Cuối tuần này mình đi nhà sách nhé?"],["an","…?…"]],
     opts:["Ý hay đó! Mấy giờ mình đi?","Mình không biết bơi.","Con mèo nhà mình bị ốm.","Hôm qua mình ăn phở."], a:0},
   {cat:"hoithoai", type:"chat", q:"Bảo sẽ trả lời thế nào?",
     chat:[["an","Cảm ơn bạn đã giúp mình nhé!"],["bao","…?…"]],
     opts:["Không có gì đâu, bạn bè mà!","Mình học lớp 6.","Trời sắp mưa rồi.","Mình thích ăn kem."], a:0},
   {cat:"noi", type:"speak", q:"Hãy kể một câu chuyện ngắn về việc tốt bạn đã làm?"},
   {cat:"noi", type:"speak", q:"Nếu được đi du lịch, bạn muốn đi đâu? Vì sao?"},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Mùa","xuân","hoa","đào","nở","rất","đẹp"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Chúng","em","chăm","chỉ","học","tập","mỗi","ngày"]},
   {cat:"doc", type:"read", passage:"Vào ngày Tết, nhà bạn Lan gói bánh chưng. Cả nhà ngồi quây quần bên nhau, vừa gói bánh vừa kể chuyện vui. Lan rất thích không khí ấm áp ấy.",
     q:"Gia đình bạn Lan làm gì vào ngày Tết?", opts:["Đi du lịch","Gói bánh chưng","Xem phim","Đi chợ"], a:1},
   {cat:"doc", type:"read", passage:"Rùa và Thỏ chạy thi. Thỏ chạy nhanh nên chủ quan, nằm ngủ giữa đường. Rùa tuy chậm nhưng cố gắng không nghỉ, cuối cùng về đích trước.",
     q:"Vì sao Rùa thắng cuộc?", opts:["Vì Rùa chạy nhanh hơn","Vì Rùa kiên trì cố gắng","Vì Thỏ nhường Rùa","Vì đường ngắn"], a:1},
   {cat:"nghe", type:"hear", say:"con ngựa", q:"Nghe kỹ rồi chọn đúng từ nha!", opts:["con ngựa","con hươu","con lừa","con nai"], a:0},
   {cat:"nghe", type:"hear", say:"bàn", q:"Nghe kỹ dấu thanh rồi chọn nha!", opts:["bàn","bàng","bán","bản"], a:0},
   {cat:"nghe", type:"hear", say:"Chào buổi sáng", q:"Nghe cả câu rồi chọn nha!", opts:["Chào buổi sáng","Chào buổi tối","Hẹn gặp lại","Cảm ơn bạn"], a:0},
   {cat:"nghe", type:"hear", say:"quả dưa hấu", q:"Nghe rồi chọn đúng loại quả nha!", opts:["quả dưa hấu","quả dừa","quả đu đủ","quả bưởi"], a:0},
   {cat:"matchu", type:"tf", q:"Viết \"con cá\" là đúng, viết \"con ká\" là sai.", opts:["Đúng","Sai"], a:0},
   {cat:"matchu", type:"tf", q:"Trước e, ê, i thì viết \"k\" chứ không viết \"c\".", opts:["Đúng","Sai"], a:0},
   {cat:"anhviet", type:"tf", q:"\"đẹp\" là một danh từ (tên gọi sự vật).", opts:["Đúng","Sai"], a:1},
   {cat:"viet", type:"tf", q:"Câu hỏi khi viết sẽ kết thúc bằng dấu chấm hỏi \"?\".", opts:["Đúng","Sai"], a:0},
   {cat:"tuvung", type:"emojiOpts", q:"Đâu KHÔNG phải phương tiện giao thông?", opts:["🚗","✈️","🚲","🍚"], a:3},
   {cat:"tuvung", type:"emojiOpts", q:"Đâu KHÔNG phải bộ phận cơ thể?", opts:["👁️","👂","👃","📚"], a:3},
   {cat:"matchu", type:"glyph", q:"Từ này đọc là gì?", glyph:"chuông", opts:["Chuôn","Chuông","Chương","Chuồn"], a:1, letterOpts:true},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Bác","sĩ","khám","bệnh","cho","em"]},
   {cat:"viet", type:"order", q:"Bấm vào các từ theo đúng thứ tự để thành câu có nghĩa!", words:["Mùa","đông","trời","rất","lạnh"]},
]
};

const PRAISE = ["Chuẩn luôn! 🔥","Quá đỉnh! ⚡","10 điểm! 💯","Xịn xò! 😎","Đỉnh của chóp! 🏆"];
const KEYS = ["A","B","C","D"];

/* ---------- Trạng thái trình chơi ---------- */
let mode = "test";        // "test" | "practice"
let total = 20;           // số câu của lượt chơi hiện tại
let queue = [];           // hàng đợi câu hỏi (chế độ luyện tập)
let practiceCat = "all";
let runnerReturn = "kiemtra";
let star = 1, idx = 0, score = 0, locked = false;
let current = null, history = [], used = null;
let orderAns = [], orderPool = [];

function shuffle(arr){
  const a = arr.slice();
  for(let i = a.length-1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

/* =========================================================
   ĐIỀU HƯỚNG
   ========================================================= */
const SECTIONS = ["home","baihoc","baitap","kiemtra","lienhe"];
let navLock = false;

/* Không cho trình duyệt tự khôi phục vị trí cuộn khi F5 (tránh bị tụt xuống) */
if('scrollRestoration' in history){ history.scrollRestoration = 'manual'; }

function go(id){
  if(!SECTIONS.includes(id)) id = "home";
  const runner = document.getElementById("runner");
  if(!runner.classList.contains("hidden")){
    runner.classList.add("hidden");
    document.body.style.overflow = "";
  }
  const pages = document.querySelectorAll("#pages .page");
  pages.forEach(p => {
    if(p.id === id){
      p.classList.remove("hidden");
      p.style.animation = "none";
      void p.offsetWidth;
      p.style.animation = "fadeUp .4s ease";
    } else {
      p.classList.add("hidden");
      p.style.animation = "";
    }
  });
  document.querySelectorAll("#navLinks a").forEach(a => a.classList.toggle("active", a.dataset.nav === id));
  document.getElementById("nav").classList.remove("open");
  if(("#" + id) !== location.hash){ navLock = true; location.hash = id; }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => {
  if(navLock){ navLock = false; return; }
  go((location.hash || "#home").slice(1));
});
function toggleMenu(){ document.getElementById("nav").classList.toggle("open"); }

/* =========================================================
   TRANG CHỦ — thẻ tính năng & kỹ năng
   ========================================================= */
const FEATURES = [
  {i:"🎨", h:"Học mà chơi", p:"Giao diện nhiều màu, emoji ngộ nghĩnh — bé học mà cứ ngỡ đang chơi."},
  {i:"⭐", h:"Tăng dần độ khó", p:"Bài kiểm tra tự điều chỉnh theo sức của bé, không dễ quá cũng không khó quá."},
  {i:"🗣️", h:"Đủ 4 kỹ năng", p:"Nghe – nói – đọc – viết, luyện đều đặn mỗi ngày một chút."},
  {i:"👨‍🏫", h:"Có Thầy Đạt", p:"Sau mỗi bài đều có lời khuyên cụ thể cho ba mẹ và gia sư."},
  {i:"🤖", h:"Bắt nhịp AI", p:"Thầy sẵn sàng chỉ trò về AI, giúp các em nắm bắt kịp xu hướng công nghệ hiện nay."},
];

function renderHome(){
  document.getElementById("featGrid").innerHTML = FEATURES.map(f =>
    `<div class="featCard"><div class="fi">${f.i}</div><h4>${f.h}</h4><p>${f.p}</p></div>`).join("");
  document.getElementById("skillGrid").innerHTML = Object.values(CATS).map(c =>
    `<div class="skillCard" style="background:${c.color}"><span class="se">${c.emoji}</span><span class="sn">${c.name}</span></div>`).join("");
  const progEl = document.getElementById("homeProgress");
  if(progEl){
    const xp = progress.xp || 0;
    const streak = progress.streak || 0;
    const badges = getBadges();
    const viewed = progress.lessonsViewed.length;
    const totalL = LESSONS.length;
    progEl.innerHTML = `
      <div class="progGrid">
        <div class="progItem"><div class="progNum">${xp}</div><div class="progLbl">XP</div></div>
        <div class="progItem"><div class="progNum">${streak}🔥</div><div class="progLbl">Ngày liên tiếp</div></div>
        <div class="progItem"><div class="progNum">${viewed}/${totalL}</div><div class="progLbl">Bài học</div></div>
        <div class="progItem"><div class="progNum">${badges.length}/${BADGES.length}</div><div class="progLbl">Thành tích</div></div>
      </div>
      ${badges.length ? `<div class="badgeRow">${badges.map(b => `<span class="badge" title="${b.desc}">${b.icon} ${b.name}</span>`).join("")}</div>` : ""}`;
  }
  initHeroAnim();
}
function initHeroAnim(){
  const hero = document.querySelector(".heroArt");
  if(!hero) return;
  hero.addEventListener("mousemove", e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    hero.style.transform = `perspective(600px) rotateY(${x*12}deg) rotateX(${-y*12}deg)`;
  });
  hero.addEventListener("mouseleave", () => {
    hero.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg)";
    hero.style.transition = "transform .5s ease";
    setTimeout(() => hero.style.transition = "", 500);
  });
}

/* =========================================================
   HIỆU ỨNG ÂM THANH (Web Audio API — không cần file ngoài)
   ========================================================= */
let audioCtx = null;
function getAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playTone(freq, dur, type="square", vol=0.08){
  try {
    const ctx = getAudio(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch {}
}
const sfx = {
  click:  () => playTone(600, 0.08, "square", 0.05),
  correct:() => { playTone(523, 0.1); setTimeout(()=>playTone(659, 0.1), 80); setTimeout(()=>playTone(784, 0.15), 160); },
  wrong:  () => { playTone(200, 0.2, "sawtooth", 0.06); setTimeout(()=>playTone(150, 0.3, "sawtooth", 0.04), 150); },
  win:    () => { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f, 0.15, "square", 0.07), i*100)); },
  pop:    () => playTone(400, 0.06, "sine", 0.04),
};
document.addEventListener("click", e => {
  if(e.target.closest("button, .opt, .chip, .topicChip, .lessonCard, .flashcard")) sfx.click();
});

const ALPHABET = "a ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y".split(" ");
const TONES = [
  {g:"a",  n:"Thanh ngang", ex:"ma", w:"con ma 👻"},
  {g:"à",  n:"Thanh huyền", ex:"mà", w:"nhưng mà"},
  {g:"á",  n:"Thanh sắc",  ex:"má", w:"đôi má 😊"},
  {g:"ả",  n:"Thanh hỏi",  ex:"hỏi", w:"câu hỏi ❓"},
  {g:"ã",  n:"Thanh ngã",  ex:"ngã", w:"ngã tư 🚦"},
  {g:"ạ",  n:"Thanh nặng", ex:"mạ", w:"cây mạ 🌱"},
];
const VOCAB_ANIMAL = [["🐱","Con mèo"],["🐶","Con chó"],["🐔","Con gà"],["🐟","Con cá"],["🐷","Con lợn"],["🐮","Con bò"]];
const VOCAB_COLOR  = [["🔴","Màu đỏ"],["🔵","Màu xanh"],["🟡","Màu vàng"],["🟢","Màu lá"],["🟣","Màu tím"],["⚫","Màu đen"]];
const VOCAB_FOOD   = [["🍚","Cơm"],["🍜","Phở"],["🍎","Quả táo"],["🍌","Quả chuối"],["🥛","Sữa"],["🍰","Bánh"]];

const vocabHtml = list => `<div class="vocabGrid">${list.map(([e,w]) =>
  `<div class="vocabItem"><div class="ve">${e}</div><div class="vw">${w}</div></div>`).join("")}</div>`;

const LESSONS = [
  {icon:"🔤", color:"#7C3AED", title:"Bài 1: Nhóm A — A, Ă, Â", desc:"3 nguyên âm đầu tiên: âm dài, âm ngắn, âm giữa — nền tảng để đọc mọi từ tiếng Việt.",
    body:`<p><b>🎯 Mục tiêu:</b> Phân biệt và phát âm đúng 3 chữ A, Ă, Â. Đây là nhóm nguyên âm quan trọng nhất!</p>
      <div class="langBox"><b>A</b> = long "ah" sound, like "father" — miệng mở to.<br>
      <b>Ă</b> = giống A nhưng cắt ngắn, bật nhanh rồi tắt liền — miệng vẫn mở to.<br>
      <b>Â</b> = miệng khép hơn A, âm ngắn và chìm — giống "u" trong tiếng Anh "but".</div>

      <div class="secTitle" data-icon="📖">A — Âm dài, miệng mở to</div>
      <div class="letterVisual">
        <div class="letterBig">A</div>
        <div class="letterExamples">
          <div class="letterExample"><span class="vi">ba</span><span class="en">dad</span></div>
          <div class="letterExample"><span class="vi">bà</span><span class="en">grandma</span></div>
          <div class="letterExample"><span class="vi">cá</span><span class="en">fish</span></div>
          <div class="letterExample"><span class="vi">cha</span><span class="en">father</span></div>
          <div class="letterExample"><span class="vi">nhà</span><span class="en">house</span></div>
          <div class="letterExample"><span class="vi">ca</span><span class="en">sing</span></div>
        </div>
      </div>
      <img src="images/baihoc/bai1-a.png" class="lessonImg" alt="Mẫu chữ A">

      <div class="secTitle" data-icon="📖">Ă — Âm ngắn, bật nhanh</div>
      <div class="letterVisual">
        <div class="letterBig" style="background:linear-gradient(135deg,var(--pink),#F472B6); -webkit-background-clip:text; background-clip:text; color:transparent">Ă</div>
        <div class="letterExamples">
          <div class="letterExample"><span class="vi">ăn</span><span class="en">eat</span></div>
          <div class="letterExample"><span class="vi">mắt</span><span class="en">eyes</span></div>
          <div class="letterExample"><span class="vi">trắng</span><span class="en">white</span></div>
          <div class="letterExample"><span class="vi">cắt</span><span class="en">cut</span></div>
          <div class="letterExample"><span class="vi">mất</span><span class="en">lose</span></div>
          <div class="letterExample"><span class="vi">bát</span><span class="en">bowl</span></div>
        </div>
      </div>
      <img src="images/baihoc/bai1-a2.png" class="lessonImg" alt="Mẫu chữ Ă">

      <div class="secTitle" data-icon="📖">Â — Âm ngắn, miệng khép lại một nửa</div>
      <div class="letterVisual">
        <div class="letterBig" style="background:linear-gradient(135deg,var(--cyan),#22D3EE); -webkit-background-clip:text; background-clip:text; color:transparent">Â</div>
        <div class="letterExamples">
          <div class="letterExample"><span class="vi">cần</span><span class="en">need</span></div>
          <div class="letterExample"><span class="vi">bận</span><span class="en">busy</span></div>
          <div class="letterExample"><span class="vi">đất</span><span class="en">earth</span></div>
          <div class="letterExample"><span class="vi">cấp</span><span class="en">supply</span></div>
          <div class="letterExample"><span class="vi">mận</span><span class="en">plum</span></div>
          <div class="letterExample"><span class="vi">tân</span><span class="en">new</span></div>
        </div>
      </div>
      <img src="images/baihoc/bai1-a3.png" class="lessonImg" alt="Mẫu chữ Â">

      <div class="secTitle" data-icon="📜">Luật hai anh em đội mũ</div>
      <div class="dlg"><b>Quan trọng:</b> Ă và Â <b>không bao giờ</b> đứng cuối tiếng một mình — chúng luôn cần một âm cuối đi kèm: <b>ăn</b>, <b>mắt</b>, <b>chân</b>, <b>đất</b>.<br>
      Chỉ có <b>A</b> được đứng cuối tự do: <b>ba</b>, <b>cá</b>, <b>nhà</b>.<br>
      <b>Bộ cặp chuẩn để luyện:</b><br>
      · <b>can – căn – cân</b> (cả 3 đều là từ thật!)<br>
      · <b>cát – cắt – cất</b> (cát biển ✋ · cắt kéo ✂️ · cất đồ 📦)<br>
      · <b>mát – mắt – mất</b><br>
      · <b>tan – tăng – tân</b></div>

      <div class="secTitle" data-icon="🖐️">Cử chỉ tay</div>
      <div class="emojiScene">
        <div class="emojiChar">🙌</div>
        <div style="font-weight:700; color:var(--ink); z-index:1">A — tay mở rộng<br><small style="color:#64748B">âm dài</small></div>
        <div class="emojiChar">✋</div>
        <div style="font-weight:700; color:var(--ink); z-index:1">Ă — chém ngang<br><small style="color:#64748B">âm bật</small></div>
        <div class="emojiChar">🤛</div>
        <div style="font-weight:700; color:var(--ink); z-index:1">Â — tay lên ngực<br><small style="color:#64748B">âm trầm</small></div>
      </div>

      <div class="secTitle" data-icon="🎨">Tô màu chữ A, Ă, Â</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Chọn màu bên dưới, rồi tô vào chữ nhé! 🖍️</p>
      <div class="canvasPickerWrap">
        <div class="canvasCard">
          <div class="canvasCardLabel">A</div>
          <canvas id="canvasA" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasA')">Xóa</button>
        </div>
        <div class="canvasCard">
          <div class="canvasCardLabel">a</div>
          <canvas id="canvasAl" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasAl')">Xóa</button>
        </div>
        <div class="canvasCard">
          <div class="canvasCardLabel">Ă</div>
          <canvas id="canvasA2" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasA2')">Xóa</button>
        </div>
        <div class="canvasCard">
          <div class="canvasCardLabel">ă</div>
          <canvas id="canvasA2l" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasA2l')">Xóa</button>
        </div>
        <div class="canvasCard">
          <div class="canvasCardLabel">Â</div>
          <canvas id="canvasA3" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasA3')">Xóa</button>
        </div>
        <div class="canvasCard">
          <div class="canvasCardLabel">â</div>
          <canvas id="canvasA3l" width="160" height="160"></canvas>
          <button class="btn small clearBtn" onclick="clearCanvas('canvasA3l')">Xóa</button>
        </div>
      </div>

      <div class="canvasGlobalControls">
        <span style="font-weight:700;color:#475569;font-size:14px">Bảng màu:</span>
        <div class="colorDotsRow">
          <div class="colorDot active" style="background:#EF4444" data-color="#EF4444"></div>
          <div class="colorDot" style="background:#3B82F6" data-color="#3B82F6"></div>
          <div class="colorDot" style="background:#10B981" data-color="#10B981"></div>
          <div class="colorDot" style="background:#F59E0B" data-color="#F59E0B"></div>
          <div class="colorDot" style="background:#8B5CF6" data-color="#8B5CF6"></div>
          <div class="colorDot" style="background:#EC4899" data-color="#EC4899"></div>
          <div class="colorDot" style="background:#06B6D4" data-color="#06B6D4"></div>
        </div>
      </div>

      <div class="secTitle" data-icon="🎧">Bài 1: Tai thính</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Gia sư đọc một âm bất kỳ, bé bấm đúng chữ nhé! 10 lượt, đạt 8/10 là giỏi.</p>
      <div class="listenGame" id="listenGame">
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:12px">
          <button class="btn" onclick="teacherRead()">🎧 Gia sư đọc một âm</button>
          <button class="btn small ghost" onclick="revealListen()" title="Chỉ gia sư xem">🤫 Đáp án</button>
        </div>
        <div class="listenScore" id="listenScore">Điểm: <b>0</b> / <b>10</b></div>
        <div class="listenBtns">
          <button class="btn small" onclick="listenAnswer('A')">A</button>
          <button class="btn small" onclick="listenAnswer('Ă')">Ă</button>
          <button class="btn small" onclick="listenAnswer('Â')">Â</button>
        </div>
        <div class="listenFeedback" id="listenFeedback"></div>
      </div>

      <div class="secTitle" data-icon="⚙️">Bài 2: Máy ghép âm</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Chọn phụ âm + nguyên âm, bấm GHÉP! để xem từ xuất hiện.</p>
      <div class="blendMachine">
        <div class="blendBox">
          <label style="font-weight:700;font-size:13px;color:#64748B">Phụ âm:</label>
          <select id="blendInit" class="blendSelect">
            <option value="b">b</option>
            <option value="c">c</option>
            <option value="m">m</option>
            <option value="t">t</option>
            <option value="n">n</option>
          </select>
        </div>
        <div class="blendBox">
          <label style="font-weight:700;font-size:13px;color:#64748B">Nguyên âm:</label>
          <select id="blendVowel" class="blendSelect">
            <option value="a">a</option>
            <option value="ă">ă</option>
            <option value="â">â</option>
          </select>
        </div>
        <button class="btn small" onclick="blendSound()" style="margin-top:10px">GHÉP! ✨</button>
        <div class="blendResult" id="blendResult"></div>
      </div>

      <div class="secTitle" data-icon="🗂️">Bài 3: Phân loại vào 3 nhà</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px"><b>Bước 1:</b> bấm một từ. <b>Bước 2:</b> bấm nhà đúng (Nhà A / Nhà Ă / Nhà Â).</p>
      <div class="sortGame" id="sortGame">
        <div class="sortWords">
          <button class="wordChip" onclick="sortWord(this, 'A')">ba</button>
          <button class="wordChip" onclick="sortWord(this, 'A')">bà</button>
          <button class="wordChip" onclick="sortWord(this, 'Ă')">ăn</button>
          <button class="wordChip" onclick="sortWord(this, 'Ă')">mắt</button>
          <button class="wordChip" onclick="sortWord(this, 'Â')">cần</button>
          <button class="wordChip" onclick="sortWord(this, 'Â')">bận</button>
          <button class="wordChip" onclick="sortWord(this, 'A')">cá</button>
          <button class="wordChip" onclick="sortWord(this, 'Ă')">trắng</button>
          <button class="wordChip" onclick="sortWord(this, 'Â')">đất</button>
        </div>
        <div class="sortColumns">
          <div class="sortCol" data-col="A" onclick="dropInto('A')">
            <div class="sortLabel">Nhà A</div>
            <div class="sortDrop" data-col="A"></div>
          </div>
          <div class="sortCol" data-col="Ă" onclick="dropInto('Ă')">
            <div class="sortLabel">Nhà Ă</div>
            <div class="sortDrop" data-col="Ă"></div>
          </div>
          <div class="sortCol" data-col="Â" onclick="dropInto('Â')">
            <div class="sortLabel">Nhà Â</div>
            <div class="sortDrop" data-col="Â"></div>
          </div>
        </div>
        <button class="btn small" onclick="resetSort()" style="margin-top:10px">Làm lại ↻</button>
      </div>

      <div class="secTitle" data-icon="🔍">Bài 4: Thám tử săn chữ</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Bấm vào mọi chữ thuộc <b>họ A</b> (a, à, á, ă, â, ậ…) trong câu bên dưới để "bắt" chúng!</p>
      <div class="detectiveGame" id="detectiveGame">
        <div class="detectiveSentence" id="detectiveSentence"></div>
        <div class="detectiveScore" id="detectiveScore">Đã bắt: <b>0</b> / <b>0</b></div>
        <button class="btn small" onclick="newDetective()" style="margin-top:8px">Câu mới 🔄</button>
      </div>

      <div class="secTitle" data-icon="🖼️">Bài 5: Chọn từ đúng theo hình</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Chọn từ đúng cho hình ảnh bên dưới.</p>
      <div class="chooseWordGame" id="chooseWordGame">
        <div class="cwImage" id="cwImage"></div>
        <div class="cwChoices" id="cwChoices"></div>
        <button class="btn small" onclick="newChooseWord()" style="margin-top:10px">Câu mới 🔄</button>
      </div>

      <div class="secTitle" data-icon="⚡">Bài 6: Flash tốc độ</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Chữ hiện 1 giây rồi biến mất — bấm đúng chữ vừa thấy! 10 lượt.</p>
      <div class="flashSpeedGame" id="flashSpeedGame">
        <div class="fsCard" id="fsCard"></div>
        <div class="fsChoices" id="fsChoices"></div>
        <div class="fsScore" id="fsScore">Điểm: <b>0</b> / <b>10</b></div>
        <button class="btn small" onclick="startFlashSpeed()" style="margin-top:8px">Bắt đầu ▶️</button>
      </div>

      <div class="secTitle" data-icon="🎯">Thử thách cuối bài</div>
      <p style="color:#64748B;font-size:14px;margin-bottom:12px">Đọc to <b>"cát – cắt – cất"</b> 3 lượt, càng nhanh càng tốt!</p>
      <div class="challengeBox"><b>Mẹo:</b> Lặp lại 5 lần mỗi âm: "a... a... a...", "ă... ă... ă...", "â... â... â...".<br>
      <b>Luật nhớ:</b> A đứng cuối tự do (ba, cá, nhà) — Ă/Â cần bạn đi kèm (ăn, mắt, cần, đất).<br>
      <b>Thử thách:</b> Đọc to <b>cát – cắt – cất</b> 3 lượt nhanh dần — vui như tongue twister!</div>

      <div class="secTitle" data-icon="🤖">Chốt bài — nối với góc AI</div>
      <div class="dlg"><b>Đố em:</b> Nãy giờ em vừa dùng <b>vòng lặp</b> mấy lần?<br>
      Khi em "lặp 5 lần: đọc a" — đó chính là <b>loop</b> (vòng lặp) trong lập trình đó!<br>
      Ở góc AI cuối buổi, em sẽ dạy máy tính lặp đi lặp lại y hệt như thế. 💡</div>`},

  {icon:"🔤", color:"#EC4899", title:"Bài 2: Nhóm E — E, Ê", desc:"2 nguyên âm E: âm đơn giản và âm đóng miệng — dễ phân biệt với A.",
    body:`<p><b>🎯 Mục tiêu:</b> Phân biệt E và Ê — hai âm khác nhau hoàn toàn!</p>
      <div class="langBox"><b>E</b> = "eh" sound, like "bed" — miệng mở vừa.<br>
      <b>Ê</b> = "ey" sound, like "hey" — miệng đóng hơn, mũi cong lên.</div>

      <div class="secTitle" data-icon="📖">E — Âm đơn giản</div>
      <div class="toneList">
        <div class="toneRow pink"><div class="tg">E</div><div class="td"><b>Cách phát âm:</b> Miệng mở vừa, lưỡi phẳng, âm ngắn.<br>
          <div class="exampleWords"><span class="exampleWord">e <span class="ew">eh</span></span><span class="exampleWord">mẹ <span class="ew">mother</span></span><span class="exampleWord">dê <span class="ew">goat</span></span></div></div></div>
      </div>

      <div class="secTitle" data-icon="📖">Ê — Âm đóng miệng</div>
      <div class="toneList">
        <div class="toneRow lime"><div class="tg">Ê</div><div class="td"><b>Cách phát âm:</b> Miệng hơi nhắm, mũi cong lên, âm kéo dài hơn E.<br>
          <div class="exampleWords"><span class="exampleWord">bê <span class="ew">calf</span></span><span class="exampleWord">thế <span class="ew">how/about</span></span><span class="exampleWord">mê <span class="ew">love</span></span></div></div></div>
      </div>

      <div class="tipBox"><b>Mẹo:</b> So sánh: <b>mẹ</b> (mother) vs <b>mê</b> (love). Cùng nghĩa tiếng Anh nhưng âm khác hẳn!</div>
      <div class="challengeBox"><b>Thử thách:</b> Đọc to: mẹ – bê – dê – thế. Người bên cạnh có nghe ra E và Ê khác nhau không?</div>`},

  {icon:"🔤", color:"#06B6D4", title:"Bài 3: Nhóm O — O, Ô, Ơ", desc:"3 nguyên âm O: âm tròn, âm mũi, âm mở — rất quan trọng cho người nước ngoài.",
    body:`<p><b>🎯 Mục tiêu:</b> Phân biệt O, Ô, Ơ — 3 âm dễ nhầm lẫn, cần luyện nhiều!</p>
      <div class="langBox"><b>O</b> = "oh" sound, like "go" — miệng tròn.<br>
      <b>Ô</b> = "oo" sound, like "book" — mũi ưỡn lên.<br>
      <b>Ơ</b> = "uh" sound, like "up" — miệng mở, lưỡi thấp.</div>

      <div class="secTitle" data-icon="📖">O — Âm tròn, miệng chu</div>
      <div class="toneList">
        <div class="toneRow cyan"><div class="tg">O</div><div class="td"><b>Cách phát âm:</b> Miệng tròn như đang huýt sáo, âm dài.<br>
          <div class="exampleWords"><span class="exampleWord">cô <span class="ew">aunt</span></span><span class="exampleWord">cho <span class="ew">give</span></span><span class="exampleWord">to <span class="ew">to</span></span></div></div></div>
      </div>

      <div class="secTitle" data-icon="📖">Ô — Âm mũi, mũi ưỡn lên</div>
      <div class="toneList">
        <div class="toneRow lime"><div class="tg">Ô</div><div class="td"><b>Cách phát âm:</b> Mũi ưỡn lên, môi tròn như "oo" trong "book".<br>
          <div class="exampleWords"><span class="exampleWord">bố <span class="ew">father</span></span><span class="exampleWord">có <span class="ew">have</span></span><span class="exampleWord">nô <span class="ew">play</span></span></div></div></div>
      </div>

      <div class="secTitle" data-icon="📖">Ơ — Âm mở, lưỡi thấp</div>
      <div class="toneList">
        <div class="toneRow org"><div class="tg">Ơ</div><div class="td"><b>Cách phát âm:</b> Miệng mở, lưỡi thấp xuống, âm ngắn.<br>
          <div class="exampleWords"><span class="exampleWord">mơ <span class="ew">dream</span></span><span class="exampleWord">dơ <span class="ew">dirty</span></span><span class="exampleWord">cơ <span class="ew">sticky rice</span></span></div></div></div>
      </div>

      <div class="tipBox"><b>Mẹo:</b> So sánh: <b>cô</b> (aunt - O) vs <b>cô</b> (girl - Ô) vs <b>cơ</b> (sticky rice - Ơ). Cùng chữ "c" nhưng 3 âm khác nhau!</div>
      <div class="challengeBox"><b>Thử thách:</b> Đọc to: cô – bố – mơ – ơi – ơn. Nghe có khác nhau không?</div>`},

  {icon:"🔤", color:"#22C55E", title:"Bài 4: Nhóm U — U, Ư", desc:"2 nguyên âm U: âm tròn môi và âm môi cong — dễ học sau nhóm O.",
    body:`<p><b>🎯 Mục tiêu:</b> Phân biệt U và Ư — U tròn hơn, Ư môi cong hơn.</p>
      <div class="langBox"><b>U</b> = "oo" sound, like "too" — môi tròn.<br>
      <b>Ư</b> = "ee" sound, like "see" — môi cong, miệng mở.</div>

      <div class="secTitle" data-icon="📖">U — Âm tròn, môi chu</div>
      <div class="toneList">
        <div class="toneRow org"><div class="tg">U</div><div class="td"><b>Cách phát âm:</b> Môi tròn như đang hôn, âm dài.<br>
          <div class="exampleWords"><span class="exampleWord">bù <span class="ew">compensate</span></span><span class="exampleWord">tủ <span class="ew">closet</span></span><span class="exampleWord">đủ <span class="ew">enough</span></span></div></div></div>
      </div>

      <div class="secTitle" data-icon="📖">Ư — Âm môi cong, miệng mở</div>
      <div class="toneList">
        <div class="toneRow yel"><div class="tg">Ư</div><div class="td"><b>Cách phát âm:</b> Môi cong như đang cười, miệng mở rộng.<br>
          <div class="exampleWords"><span class="exampleWord">từ <span class="ew">from</span></span><span class="exampleWord">tư <span class="ew">personal</span></span><span class="exampleWord">vừa <span class="ew">just/enough</span></span></div></div></div>
      </div>

      <div class="tipBox"><b>Mẹo:</b> So sánh: <b>tủ</b> (closet - U) vs <b>từ</b> (from - Ư). Cùng "t" nhưng âm sau hoàn toàn khác!</div>
      <div class="challengeBox"><b>Thử thách:</b> Đọc to: tủ – từ – bù – vừa – tư. Ai phân biệt được U và Ư?</div>`},

  {icon:"🔤", color:"#F97316", title:"Bài 5: Nhóm I — I, Y", desc:"2 nguyên âm cuối: I và Y — Y thường xuất hiện sau chữ U.",
    body:`<p><b>🎯 Mục tiêu:</b> Hiểu khi nào dùng I và khi nào dùng Y trong từ tiếng Việt.</p>
      <div class="langBox"><b>I</b> = "ee" sound, like "see" — miệng mở rộng, môi cười.<br>
      <b>Y</b> = cũng "ee" sound, nhưng chỉ xuất hiện sau U (uy, uyên, uỷ).</div>

      <div class="secTitle" data-icon="📖">I — Âm đơn giản</div>
      <div class="toneList">
        <div class="toneRow vio"><div class="tg">I</div><div class="td"><b>Cách phát âm:</b> Miệng mở rộng, môi cười như đang nói "ee".<br>
          <div class="exampleWords"><span class="exampleWord">tin <span class="ew">news</span></span><span class="exampleWord">sinh <span class="ew">life</span></span><span class="exampleWord">tim <span class="ew">heart</span></span></div></div></div>
      </div>

      <div class="secTitle" data-icon="📖">Y — Y chỉ xuất hiện sau U</div>
      <div class="toneList">
        <div class="toneRow pink"><div class="tg">Y</div><div class="td"><b>Cách phát âm:</b> Giống I, nhưng chỉ sau U.<br>
          <div class="exampleWords"><span class="exampleWord">tuy <span class="ew">though</span></span><span class="exampleWord">huy <span class="ew">wave</span></span><span class="exampleWord">nguy <span class="ew">danger</span></span></div></div></div>
      </div>

      <div class="tipBox"><b>Mẹo:</b> Y không bao giờ đứng đầu từ! Nếu thấy Y, nhìn chữ trước đó chắc chắn là U. Remember: U + Y = always!</div>
      <div class="challengeBox"><b>Thử thách:</b> Tìm từ có Y trong từ điển? Không có đâu! Y chỉ xuất hiện sau U thôi.</div>`},

  {icon:"🎵", color:"#EC4899", title:"Bài 6: 6 Dấu thanh", desc:"Ngang – huyền – sắc – hỏi – ngã – nặng. Đổi dấu là đổi nghĩa!",
    body:`<p><b>🎯 Mục tiêu:</b> Nghe và phân biệt 6 thanh điệu tiếng Việt.</p>
      <div class="dlg"><b>💡 English hint (A2):</b><br>
      Thanh điệu = pitch change. Vietnamese uses pitch like music notes!<br>
      🎵 <b>ngang</b> = flat (no change) · 🎵 <b>huyền</b> = low falling · 🎵 <b>sắc</b> = high rising<br>
      🎵 <b>hỏi</b> = dipping (down-up) · 🎵 <b>ngã</b> = creaky (like a question) · 🎵 <b>nặng</b> = heavy (stop)</div>
      <div class="toneList">${TONES.map((t, i) =>
        `<div class="toneRow ${["vio","pink","cyan","org","lime","yel"][i % 6]}"><div class="tg">${t.g}</div><div class="td"><b>${t.n}</b> — ví dụ: <b>${t.ex}</b> <small>(${t.w})</small></div></div>`).join("")}</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đọc chậm, nghe kỹ độ cao – thấp của giọng. Dùng tay vẽ đường line để nhớ: huyền (\) , sắc (/), hỏi (∨), ngã (~), nặng (.!).</div>`},
  {icon:"🖼️", color:"#06B6D4", title:"Bài 7: Từ vựng theo chủ đề", desc:"Con vật, màu sắc, đồ ăn — học từ mới gắn với hình ảnh.",
    body:`<p><b>🎯 Mục tiêu:</b> Học 30 từ vựng thông dụng, gắn với hình ảnh để nhớ nhanh.</p>
      <p><b>Con vật quen thuộc 🐾</b></p>${vocabHtml(VOCAB_ANIMAL)}
      <p><b>Màu sắc 🌈</b></p>${vocabHtml(VOCAB_COLOR)}
      <p><b>Đồ ăn – thức uống 🍽️</b></p>${vocabHtml(VOCAB_FOOD)}
      <div class="tipBox">💡 <b>Mẹo:</b> Chỉ vào đồ vật thật quanh nhà rồi gọi tên bằng tiếng Việt. Repeat 3 times each word!</div>`},
  {icon:"💬", color:"#F97316", title:"Bài 8: Hội thoại cơ bản", desc:"Chào hỏi, giới thiệu bản thân — nói được ngay từ buổi đầu.",
    body:`<p><b>🎯 Mục tiêu:</b> Dùng được 5 câu hội thoại cơ bản trong cuộc sống hàng ngày.</p>
      <div class="dlg"><b>Chào hỏi:</b> "Con chào cô ạ!" · "Chào bạn, bạn khỏe không?"<br>
      <b>Giới thiệu:</b> "Mình tên là An. Mình học lớp 3."<br>
      <b>Cảm ơn – xin lỗi:</b> "Cảm ơn bạn nhé!" · "Mình xin lỗi."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đóng vai với bạn bè, mỗi người đóng 1 vai. Làm 5 phút mỗi ngày!</div>`},
  {icon:"🧩", color:"#22C55E", title:"Bài 9: Ghép vần", desc:"Ghép phụ âm với vần để đọc thành tiếng — b + a = ba.",
    body:`<p><b>🎯 Mục tiêu:</b> Biết cách ghép phụ âm + nguyên âm = tiếng đọc được.</p>
      <div class="dlg"><b>b + a = ba</b> (dad) · <b>m + e = me</b> · <b>c + á = cá</b> (fish) 🐟</div>
      <div class="dlg"><b>b + a + huyền = bà</b> (grandma) 👵 · <b>c + ơ + m = cơm</b> (rice) 🍚</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đọc phần đầu rồi kéo dài sang vần: "bờ… a… ba". Practice 10 minutes daily!</div>`},
  {icon:"📖", color:"#FB923C", title:"Bài 10: Đọc hiểu", desc:"Đọc đoạn ngắn rồi trả lời câu hỏi — luyện hiểu ý.",
    body:`<p><b>🎯 Mục tiêu:</b> Đọc đoạn văn 2-3 câu và trả lời câu hỏi về nội dung.</p>
      <div class="passage">Bé Na có một con mèo. Con mèo màu đen, rất thích ngủ.</div>
      <div class="dlg"><b>Hỏi:</b> Con mèo của Na màu gì? → <b>Màu đen</b> ✅</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Gạch chân "từ khóa" trong câu hỏi rồi tìm lại trong đoạn văn. Underline the keywords!</div>`},
  {icon:"👨‍👩‍👧‍👦", color:"#8B5CF6", title:"Bài 11: Từ vựng gia đình", desc:"Bố mẹ, anh chị em — học gọi tên người thân trong gia đình.",
    body:`<p><b>🎯 Mục tiêu:</b> Gọi tên đúng 8 người trong gia đình tiếng Việt.</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">👨</div><div class="vw">Bố (dad)</div></div>
        <div class="vocabItem"><div class="ve">👩</div><div class="vw">Mẹ (mom)</div></div>
        <div class="vocabItem"><div class="ve">👦</div><div class="vw">Anh trai (older brother)</div></div>
        <div class="vocabItem"><div class="ve">👧</div><div class="vw">Chị gái (older sister)</div></div>
        <div class="vocabItem"><div class="ve">👶</div><div class="vw">Em bé (baby)</div></div>
        <div class="vocabItem"><div class="ve">👴</div><div class="vw">Ông (grandpa)</div></div>
        <div class="vocabItem"><div class="ve">👵</div><div class="vw">Bà (grandma)</div></div>
        <div class="vocabItem"><div class="ve">👨‍👩‍👧</div><div class="vw">Gia đình (family)</div></div>
      </div>
      <div class="dlg"><b>Ví dụ:</b> "Đây là <b>bố</b> mình. Bố rất thích đọc sách."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Chỉ vào từng người trong ảnh gia đình và gọi tên đúng. Point and say!</div>`},
  {icon:"🔢", color:"#06B6D4", title:"Bài 12: Số đếm 1–20", desc:"Học đếm số từ 1 đến 20 — nền tảng để học toán và giao tiếp.",
    body:`<p><b>🎯 Mục tiêu:</b> Đếm được từ 1 đến 20 tiếng Việt.</p>
      <div class="alphaGrid" style="grid-template-columns:repeat(auto-fill,minmax(44px,1fr))">
        ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n =>
          `<span style="font-size:18px;padding:8px 0">${n}</span>`).join("")}
      </div>
      <div class="dlg"><b>Mẹo đếm:</b> 1-một, 2-hai, 3-ba, 4-bốn, 5-năm, 6-sáu, 7-bảy, 8-tám, 9-chín, 10-mười</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đếm đồ vật thật quanh nhà (bút, sách, bàn ghế). Count real objects around you!</div>`},
  {icon:"📅", color:"#F97316", title:"Bài 13: Ngày tháng", desc:"Thứ 2 đến chủ nhật, các tháng trong năm — dùng để hẹn hò và lên kế hoạch.",
    body:`<p><b>🎯 Mục tiêu:</b> Biết tên các thứ trong tuần và tháng trong năm.</p>
      <div class="toneList">
        <div class="toneRow"><div class="tg">📆</div><div class="td"><b>Thứ 2 – Thứ 7</b> — ngày đi học (weekdays)</div></div>
        <div class="toneRow"><div class="tg">🎉</div><div class="td"><b>Chủ nhật</b> — ngày nghỉ, đi chơi! (Sunday)</div></div>
      </div>
      <div class="alphaGrid" style="grid-template-columns:repeat(auto-fill,minmax(64px,1fr))">
        ${["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"].map(m =>
          `<span style="font-size:15px;padding:8px 0">${m}</span>`).join("")}
      </div>
      <div class="dlg"><b>Hôm nay là thứ mấy?</b> Hãy nhìn lịch treo tường và đọc to nhé!</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Mỗi sáng, hỏi bé "Hôm nay thứ mấy?" để luyện mỗi ngày. Ask every morning!</div>`},
  {icon:"👤", color:"#EC4899", title:"Bài 14: Mô tả người", desc:"Cao/thấp, tóc dài/ngắn, già/trẻ — mô tả bạn bè và người thân.",
    body:`<p><b>🎯 Mục tiêu:</b> Dùng 6 tính từ để mô tả người.</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">📏</div><div class="vw">Cao / Thấp (tall/short)</div></div>
        <div class="vocabItem"><div class="ve">💇</div><div class="vw">Tóc dài / Ngắn (long/short hair)</div></div>
        <div class="vocabItem"><div class="ve">🎂</div><div class="vw">Trẻ / Già (young/old)</div></div>
        <div class="vocabItem"><div class="ve">😊</div><div class="vw">Vui vẻ (happy)</div></div>
        <div class="vocabItem"><div class="ve">😠</div><div class="vw">Buồn / Giận (sad/angry)</div></div>
        <div class="vocabItem"><div class="ve">👓</div><div class="vw">Đeo kính (wear glasses)</div></div>
      </div>
      <div class="dlg"><b>Ví dụ:</b> "Anh trai mình <b>cao</b>, có <b>tóc ngắn</b> và rất <b>vui vẻ</b>."<br>
      <b>English:</b> "My older brother is <b>tall</b>, has <b>short hair</b> and is very <b>happy</b>."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Mô tả 1 người trong nhà mỗi buổi, bé tập dùng 2-3 tính từ. Describe one person daily!</div>`},

  {icon:"🔡", color:"#7C3AED", title:"Bài 15: Phụ âm đầu", desc:"17 phụ âm đầu: b, c, d, đ, g, h, k, l, m, n, p, q, r, s, t, v, x — đầu mỗi tiếng.",
    body:`<p><b>🎯 Mục tiêu:</b> Nhận biết và đọc đúng các phụ âm đứng đầu tiếng. Bấm vào từng ví dụ để nghe nhé! 🔊</p>
      <div class="langBox"><b>Phụ âm đầu</b> = âm đứng ở <b>đầu</b> một tiếng, đọc trước nguyên âm.<br>
      Ví dụ tiếng <b>ba</b>: <b>b</b> là phụ âm đầu, <b>a</b> là nguyên âm.</div>
      <div class="alphaGrid" style="grid-template-columns:repeat(auto-fill,minmax(48px,1fr))">
        ${["b","c","d","đ","g","h","k","l","m","n","p","q","r","s","t","v","x"].map(ch =>
          `<span style="font-size:20px;font-weight:800;padding:10px 0;color:var(--vio)">${ch}</span>`).join("")}
      </div>
      <div class="secTitle" data-icon="📖">Ví dụ mỗi phụ âm (bấm để nghe)</div>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🍚</div><div class="vw">bát (bowl)</div></div>
        <div class="vocabItem"><div class="ve">🐟</div><div class="vw">cá (fish)</div></div>
        <div class="vocabItem"><div class="ve">🐐</div><div class="vw">dê (goat)</div></div>
        <div class="vocabItem"><div class="ve">🌰</div><div class="vw">đậu (bean)</div></div>
        <div class="vocabItem"><div class="ve">🧸</div><div class="vw">gấu (bear)</div></div>
        <div class="vocabItem"><div class="ve">🌸</div><div class="vw">hoa (flower)</div></div>
        <div class="vocabItem"><div class="ve">✂️</div><div class="vw">kéo (scissors)</div></div>
        <div class="vocabItem"><div class="ve">🍃</div><div class="vw">lá (leaf)</div></div>
        <div class="vocabItem"><div class="ve">🐱</div><div class="vw">mèo (cat)</div></div>
        <div class="vocabItem"><div class="ve">🏠</div><div class="vw">nhà (house)</div></div>
        <div class="vocabItem"><div class="ve">🍜</div><div class="vw">phở (pho)</div></div>
        <div class="vocabItem"><div class="ve">🌾</div><div class="vw">rơm (straw)</div></div>
        <div class="vocabItem"><div class="ve">📚</div><div class="vw">sách (book)</div></div>
        <div class="vocabItem"><div class="ve">✋</div><div class="vw">tay (hand)</div></div>
        <div class="vocabItem"><div class="ve">🦆</div><div class="vw">vịt (duck)</div></div>
        <div class="vocabItem"><div class="ve">🚗</div><div class="vw">xe (vehicle)</div></div>
      </div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đọc chậm: "bờ… a… ba". Ghép phụ âm với nguyên âm sẽ thành tiếng đọc được!</div>
      <div class="challengeBox"><b>Thử thách:</b> Kể tên 1 đồ vật quanh nhà bắt đầu bằng mỗi phụ âm b, c, m, t.</div>`},

  {icon:"🔠", color:"#EC4899", title:"Bài 16: Phụ âm ghép", desc:"ch, gh, kh, ng, ngh, nh, ph, qu, th, tr — hai chữ đứng chung thành một âm.",
    body:`<p><b>🎯 Mục tiêu:</b> Đọc đúng 10 phụ âm ghép (2–3 chữ nhưng chỉ đọc thành 1 âm). Bấm ví dụ để nghe! 🔊</p>
      <div class="langBox"><b>Phụ âm ghép</b> = nhiều chữ cái ghép lại thành <b>một âm</b>.<br>
      Ví dụ: <b>ch</b> trong "chó", <b>ng</b> trong "ngủ", <b>tr</b> trong "trường".</div>
      <div class="toneList">
        <div class="toneRow vio"><div class="tg">ch</div><div class="td"><b>ch</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">chó <span class="ew">dog</span></span><span class="exampleWord">chợ <span class="ew">market</span></span><span class="exampleWord">cha <span class="ew">father</span></span></div></div></div>
        <div class="toneRow pink"><div class="tg">gh</div><div class="td"><b>gh</b> — chỉ đi với e, ê, i:
          <div class="exampleWords"><span class="exampleWord">ghế <span class="ew">chair</span></span><span class="exampleWord">ghi <span class="ew">note</span></span><span class="exampleWord">ghe <span class="ew">boat</span></span></div></div></div>
        <div class="toneRow cyan"><div class="tg">kh</div><div class="td"><b>kh</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">khỉ <span class="ew">monkey</span></span><span class="exampleWord">khế <span class="ew">star fruit</span></span><span class="exampleWord">kho <span class="ew">braise</span></span></div></div></div>
        <div class="toneRow org"><div class="tg">ng</div><div class="td"><b>ng</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">ngủ <span class="ew">sleep</span></span><span class="exampleWord">ngựa <span class="ew">horse</span></span><span class="exampleWord">ngô <span class="ew">corn</span></span></div></div></div>
        <div class="toneRow lime"><div class="tg">ngh</div><div class="td"><b>ngh</b> — chỉ đi với e, ê, i:
          <div class="exampleWords"><span class="exampleWord">nghé <span class="ew">calf</span></span><span class="exampleWord">nghe <span class="ew">listen</span></span><span class="exampleWord">nghỉ <span class="ew">rest</span></span></div></div></div>
        <div class="toneRow yel"><div class="tg">nh</div><div class="td"><b>nh</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">nhà <span class="ew">house</span></span><span class="exampleWord">nhỏ <span class="ew">small</span></span><span class="exampleWord">nho <span class="ew">grape</span></span></div></div></div>
        <div class="toneRow vio"><div class="tg">ph</div><div class="td"><b>ph</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">phở <span class="ew">pho</span></span><span class="exampleWord">phà <span class="ew">ferry</span></span><span class="exampleWord">phi <span class="ew">pilot</span></span></div></div></div>
        <div class="toneRow pink"><div class="tg">qu</div><div class="td"><b>qu</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">quả <span class="ew">fruit</span></span><span class="exampleWord">quà <span class="ew">gift</span></span><span class="exampleWord">quê <span class="ew">homeland</span></span></div></div></div>
        <div class="toneRow cyan"><div class="tg">th</div><div class="td"><b>th</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">thỏ <span class="ew">rabbit</span></span><span class="exampleWord">thầy <span class="ew">teacher</span></span><span class="exampleWord">thu <span class="ew">autumn</span></span></div></div></div>
        <div class="toneRow org"><div class="tg">tr</div><div class="td"><b>tr</b> — ví dụ:
          <div class="exampleWords"><span class="exampleWord">trâu <span class="ew">buffalo</span></span><span class="exampleWord">trà <span class="ew">tea</span></span><span class="exampleWord">trò <span class="ew">game</span></span></div></div></div>
      </div>
      <div class="tipBox">💡 <b>Mẹo:</b> Nhớ 3 cặp "chỉ đi với e, ê, i": <b>gh</b>, <b>ngh</b>, và <b>k</b> (thay cho c). Học bài chính tả tiếp theo nhé!</div>`},

  {icon:"✍️", color:"#06B6D4", title:"Bài 17: Quy tắc chính tả c/k, g/gh, ng/ngh", desc:"Khi nào viết k, gh, ngh? Mẹo vàng: đứng trước e, ê, i.",
    body:`<p><b>🎯 Mục tiêu:</b> Viết đúng chính tả 3 cặp âm dễ nhầm nhất của tiếng Việt.</p>
      <div class="langBox"><b>Mẹo vàng:</b> Trước <b>e, ê, i</b> thì viết <b>k – gh – ngh</b>.<br>
      Còn lại (a, ă, â, o, ô, ơ, u, ư) thì viết <b>c – g – ng</b>.</div>
      <div class="secTitle" data-icon="🔤">Âm "cờ": c hay k?</div>
      <div class="dlg"><b>Viết k</b> trước e, ê, i: <b>kể</b>, <b>kẻ</b>, <b>kim</b>, <b>kênh</b>.<br>
      <b>Viết c</b> ở các trường hợp còn lại: <b>cá</b>, <b>cô</b>, <b>cua</b>, <b>cân</b>.</div>
      <div class="secTitle" data-icon="🔤">Âm "gờ": g hay gh?</div>
      <div class="dlg"><b>Viết gh</b> trước e, ê, i: <b>ghế</b>, <b>ghe</b>, <b>ghi</b>.<br>
      <b>Viết g</b> ở các trường hợp còn lại: <b>gà</b>, <b>gỗ</b>, <b>gấu</b>.</div>
      <div class="secTitle" data-icon="🔤">Âm "ngờ": ng hay ngh?</div>
      <div class="dlg"><b>Viết ngh</b> trước e, ê, i: <b>nghe</b>, <b>nghé</b>, <b>nghỉ</b>.<br>
      <b>Viết ng</b> ở các trường hợp còn lại: <b>ngủ</b>, <b>ngô</b>, <b>ngựa</b>.</div>
      <div class="tipBox">💡 <b>Mẹo nhớ:</b> "<b>e, ê, i</b> — đội mũ <b>k, gh, ngh</b>". Đọc câu này 5 lần là nhớ luôn!</div>
      <div class="challengeBox"><b>Thử thách:</b> Điền đúng: ...on gà (c/k?), cái ...ế (g/gh?), bé đang ...e nhạc (ng/ngh?).</div>`},

  {icon:"🧩", color:"#22C55E", title:"Bài 18: Vần thường gặp", desc:"an, ăn, ân, on, ơn, en, in, un… và các vần có ng: ang, ăng, ong…",
    body:`<p><b>🎯 Mục tiêu:</b> Đọc trơn các vần hay gặp để ghép thành tiếng. Bấm ví dụ để nghe! 🔊</p>
      <div class="langBox"><b>Vần</b> = phần đứng <b>sau</b> phụ âm đầu.<br>
      Ví dụ tiếng <b>bàn</b>: <b>b</b> (phụ âm đầu) + <b>an</b> (vần) + dấu huyền.</div>
      <div class="secTitle" data-icon="📖">Vần kết thúc bằng n</div>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🪑</div><div class="vw">bàn (table)</div></div>
        <div class="vocabItem"><div class="ve">🍽️</div><div class="vw">ăn (eat)</div></div>
        <div class="vocabItem"><div class="ve">⚖️</div><div class="vw">cân (scale)</div></div>
        <div class="vocabItem"><div class="ve">🏔️</div><div class="vw">non (young)</div></div>
        <div class="vocabItem"><div class="ve">🙏</div><div class="vw">ơn (thanks)</div></div>
        <div class="vocabItem"><div class="ve">🚪</div><div class="vw">then (latch)</div></div>
        <div class="vocabItem"><div class="ve">📰</div><div class="vw">tin (news)</div></div>
        <div class="vocabItem"><div class="ve">🎁</div><div class="vw">bún (noodle)</div></div>
      </div>
      <div class="secTitle" data-icon="📖">Vần kết thúc bằng ng</div>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🌅</div><div class="vw">sáng (morning)</div></div>
        <div class="vocabItem"><div class="ve">🌙</div><div class="vw">trăng (moon)</div></div>
        <div class="vocabItem"><div class="ve">📏</div><div class="vw">tầng (floor)</div></div>
        <div class="vocabItem"><div class="ve">🔔</div><div class="vw">chuông (bell)</div></div>
        <div class="vocabItem"><div class="ve">🌸</div><div class="vw">hồng (pink/rose)</div></div>
        <div class="vocabItem"><div class="ve">🐝</div><div class="vw">ong (bee)</div></div>
      </div>
      <div class="tipBox">💡 <b>Mẹo:</b> Đọc trơn cả vần rồi mới ghép: "an → bàn", "ang → sáng". Đừng đánh vần từng chữ một!</div>`},

  {icon:"🧍", color:"#F97316", title:"Bài 19: Từ vựng cơ thể", desc:"Đầu, mắt, mũi, tay, chân… gọi tên các bộ phận trên cơ thể.",
    body:`<p><b>🎯 Mục tiêu:</b> Gọi đúng tên 10 bộ phận cơ thể. Bấm để nghe rồi chỉ vào người mình nhé! 🔊</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🧠</div><div class="vw">Đầu (head)</div></div>
        <div class="vocabItem"><div class="ve">💇</div><div class="vw">Tóc (hair)</div></div>
        <div class="vocabItem"><div class="ve">👁️</div><div class="vw">Mắt (eyes)</div></div>
        <div class="vocabItem"><div class="ve">👂</div><div class="vw">Tai (ears)</div></div>
        <div class="vocabItem"><div class="ve">👃</div><div class="vw">Mũi (nose)</div></div>
        <div class="vocabItem"><div class="ve">👄</div><div class="vw">Miệng (mouth)</div></div>
        <div class="vocabItem"><div class="ve">🦷</div><div class="vw">Răng (teeth)</div></div>
        <div class="vocabItem"><div class="ve">✋</div><div class="vw">Tay (hands)</div></div>
        <div class="vocabItem"><div class="ve">🦶</div><div class="vw">Chân (feet)</div></div>
        <div class="vocabItem"><div class="ve">❤️</div><div class="vw">Bụng (tummy)</div></div>
      </div>
      <div class="dlg"><b>Trò chơi:</b> Người lớn nói "chỉ vào <b>mũi</b>!", bé chỉ đúng thật nhanh. Đổi vai cho vui nha!</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Vừa hát vừa chỉ: "Đầu – vai – gối – chân". Vận động giúp nhớ lâu hơn!</div>`},

  {icon:"🎒", color:"#8B5CF6", title:"Bài 20: Từ vựng trường học", desc:"Sách, vở, bút, bảng, cặp… đồ dùng học tập quen thuộc.",
    body:`<p><b>🎯 Mục tiêu:</b> Gọi tên 10 đồ dùng học tập ở trường. Bấm để nghe! 🔊</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">📚</div><div class="vw">Sách (book)</div></div>
        <div class="vocabItem"><div class="ve">📓</div><div class="vw">Vở (notebook)</div></div>
        <div class="vocabItem"><div class="ve">🖊️</div><div class="vw">Bút (pen)</div></div>
        <div class="vocabItem"><div class="ve">✏️</div><div class="vw">Bút chì (pencil)</div></div>
        <div class="vocabItem"><div class="ve">📏</div><div class="vw">Thước (ruler)</div></div>
        <div class="vocabItem"><div class="ve">🎒</div><div class="vw">Cặp sách (backpack)</div></div>
        <div class="vocabItem"><div class="ve">🧽</div><div class="vw">Cục tẩy (eraser)</div></div>
        <div class="vocabItem"><div class="ve">🖍️</div><div class="vw">Bút màu (crayon)</div></div>
        <div class="vocabItem"><div class="ve">🪑</div><div class="vw">Bàn ghế (desk)</div></div>
        <div class="vocabItem"><div class="ve">👩‍🏫</div><div class="vw">Cô giáo (teacher)</div></div>
      </div>
      <div class="dlg"><b>Ví dụ:</b> "Trong cặp của mình có <b>sách</b>, <b>vở</b> và <b>bút chì</b>."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Trước khi đi học, bé gọi tên từng món khi xếp vào cặp. Vừa gọn vừa học từ!</div>`},

  {icon:"👷", color:"#06B6D4", title:"Bài 21: Từ vựng nghề nghiệp", desc:"Bác sĩ, giáo viên, nông dân, phi công… ước mơ của em là gì?",
    body:`<p><b>🎯 Mục tiêu:</b> Gọi tên 8 nghề nghiệp quen thuộc. Bấm để nghe! 🔊</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">👨‍⚕️</div><div class="vw">Bác sĩ (doctor)</div></div>
        <div class="vocabItem"><div class="ve">👩‍🏫</div><div class="vw">Giáo viên (teacher)</div></div>
        <div class="vocabItem"><div class="ve">👨‍🌾</div><div class="vw">Nông dân (farmer)</div></div>
        <div class="vocabItem"><div class="ve">👮</div><div class="vw">Công an (police)</div></div>
        <div class="vocabItem"><div class="ve">👨‍✈️</div><div class="vw">Phi công (pilot)</div></div>
        <div class="vocabItem"><div class="ve">👨‍🍳</div><div class="vw">Đầu bếp (chef)</div></div>
        <div class="vocabItem"><div class="ve">👷</div><div class="vw">Thợ xây (builder)</div></div>
        <div class="vocabItem"><div class="ve">🎨</div><div class="vw">Họa sĩ (painter)</div></div>
      </div>
      <div class="dlg"><b>Hỏi – đáp:</b> "Lớn lên con muốn làm gì?" → "Con muốn làm <b>bác sĩ</b> để chữa bệnh cho mọi người."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Hỏi bé về ước mơ nghề nghiệp và lý do — vừa học từ vừa tập nói thành câu!</div>`},

  {icon:"🌦️", color:"#F59E0B", title:"Bài 22: Thời tiết & mùa", desc:"Nắng, mưa, gió, nóng, lạnh và 4 mùa xuân – hạ – thu – đông.",
    body:`<p><b>🎯 Mục tiêu:</b> Nói về thời tiết hôm nay và 4 mùa trong năm. Bấm để nghe! 🔊</p>
      <div class="secTitle" data-icon="🌤️">Thời tiết</div>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">☀️</div><div class="vw">Trời nắng (sunny)</div></div>
        <div class="vocabItem"><div class="ve">🌧️</div><div class="vw">Trời mưa (rainy)</div></div>
        <div class="vocabItem"><div class="ve">💨</div><div class="vw">Trời gió (windy)</div></div>
        <div class="vocabItem"><div class="ve">🥵</div><div class="vw">Nóng (hot)</div></div>
        <div class="vocabItem"><div class="ve">🥶</div><div class="vw">Lạnh (cold)</div></div>
        <div class="vocabItem"><div class="ve">🌈</div><div class="vw">Cầu vồng (rainbow)</div></div>
      </div>
      <div class="secTitle" data-icon="🍂">Bốn mùa</div>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🌸</div><div class="vw">Mùa xuân (spring)</div></div>
        <div class="vocabItem"><div class="ve">🌞</div><div class="vw">Mùa hạ (summer)</div></div>
        <div class="vocabItem"><div class="ve">🍁</div><div class="vw">Mùa thu (autumn)</div></div>
        <div class="vocabItem"><div class="ve">❄️</div><div class="vw">Mùa đông (winter)</div></div>
      </div>
      <div class="dlg"><b>Hỏi mỗi ngày:</b> "Hôm nay trời thế nào?" → "Hôm nay trời <b>nắng</b> và có <b>gió</b> mát."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Sáng nào cũng nhìn ra cửa sổ và nói 1 câu về thời tiết. Luyện đều mỗi ngày!</div>`},

  {icon:"🧱", color:"#EF4444", title:"Bài 23: Danh từ – Động từ – Tính từ", desc:"3 loại từ nền tảng: gọi tên, chỉ hành động, chỉ đặc điểm.",
    body:`<p><b>🎯 Mục tiêu:</b> Phân biệt danh từ, động từ, tính từ để đặt câu đúng.</p>
      <div class="toneList">
        <div class="toneRow cyan"><div class="tg">DT</div><div class="td"><b>Danh từ</b> — gọi tên người, vật, con vật, nơi chốn.<br>
          <div class="exampleWords"><span class="exampleWord">mẹ</span><span class="exampleWord">con mèo</span><span class="exampleWord">trường học</span><span class="exampleWord">quả táo</span></div></div></div>
        <div class="toneRow org"><div class="tg">ĐT</div><div class="td"><b>Động từ</b> — chỉ <b>hành động</b>, việc làm.<br>
          <div class="exampleWords"><span class="exampleWord">ăn</span><span class="exampleWord">chạy</span><span class="exampleWord">học</span><span class="exampleWord">ngủ</span></div></div></div>
        <div class="toneRow pink"><div class="tg">TT</div><div class="td"><b>Tính từ</b> — chỉ <b>đặc điểm</b>, tính chất.<br>
          <div class="exampleWords"><span class="exampleWord">cao</span><span class="exampleWord">đẹp</span><span class="exampleWord">vui</span><span class="exampleWord">nhanh</span></div></div></div>
      </div>
      <div class="dlg"><b>Ghép thành câu:</b> <b>Con mèo</b> (danh từ) <b>ngủ</b> (động từ) rất <b>ngoan</b> (tính từ).<br>
      → "<b>Con mèo ngủ rất ngoan.</b>"</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Danh từ đứng trước được "cái/con"; động từ trả lời "làm gì?"; tính từ trả lời "như thế nào?".</div>
      <div class="challengeBox"><b>Thử thách:</b> Tìm trong câu "Bạn Lan hát rất hay": đâu là danh từ, động từ, tính từ?</div>`},

  {icon:"❓", color:"#8B5CF6", title:"Bài 24: Đặt câu hỏi", desc:"Ai? Cái gì? Ở đâu? Khi nào? Vì sao? Thế nào? — hỏi để hiểu hơn.",
    body:`<p><b>🎯 Mục tiêu:</b> Biết dùng 6 từ để hỏi trong giao tiếp hằng ngày.</p>
      <div class="toneList">
        <div class="toneRow vio"><div class="tg">👤</div><div class="td"><b>Ai?</b> — hỏi về người. VD: "<b>Ai</b> đang nấu cơm?"</div></div>
        <div class="toneRow pink"><div class="tg">📦</div><div class="td"><b>Cái gì?</b> — hỏi về vật, việc. VD: "Bạn đang làm <b>cái gì</b>?"</div></div>
        <div class="toneRow cyan"><div class="tg">📍</div><div class="td"><b>Ở đâu?</b> — hỏi về nơi chốn. VD: "Nhà bạn <b>ở đâu</b>?"</div></div>
        <div class="toneRow org"><div class="tg">⏰</div><div class="td"><b>Khi nào?</b> — hỏi về thời gian. VD: "<b>Khi nào</b> mình đi chơi?"</div></div>
        <div class="toneRow lime"><div class="tg">💡</div><div class="td"><b>Vì sao?</b> — hỏi về lý do. VD: "<b>Vì sao</b> bạn buồn?"</div></div>
        <div class="toneRow yel"><div class="tg">🔄</div><div class="td"><b>Thế nào?</b> — hỏi về cách, trạng thái. VD: "Hôm nay bạn <b>thế nào</b>?"</div></div>
      </div>
      <div class="dlg"><b>Luyện đóng vai:</b> Một người hỏi, một người trả lời — đổi vai sau mỗi câu. VD: "Bạn học <b>ở đâu</b>?" → "Mình học <b>ở trường Kim Đồng</b>."</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Cuối câu hỏi lên giọng một chút. Nhớ dùng dấu chấm hỏi <b>?</b> khi viết!</div>`},

  {icon:"📝", color:"#FB923C", title:"Bài 25: Viết đoạn văn ngắn", desc:"Ghép 5 câu thành đoạn văn giới thiệu bản thân — bước đầu tập viết.",
    body:`<p><b>🎯 Mục tiêu:</b> Viết được một đoạn văn 5 câu giới thiệu về bản thân.</p>
      <div class="langBox"><b>Đoạn văn</b> = nhiều câu nói về <b>cùng một điều</b>. Câu đầu viết <b>lùi vào</b> một chút, cuối câu có dấu chấm.</div>
      <div class="secTitle" data-icon="🧩">5 câu gợi ý (điền vào chỗ trống)</div>
      <div class="dlg">1. Mình tên là <b>…</b>.<br>
      2. Năm nay mình <b>…</b> tuổi.<br>
      3. Mình học lớp <b>…</b>, trường <b>…</b>.<br>
      4. Mình thích <b>…</b> (môn học / trò chơi / món ăn).<br>
      5. Ước mơ của mình là trở thành <b>…</b>.</div>
      <div class="secTitle" data-icon="✅">Đoạn văn mẫu</div>
      <div class="passage">Mình tên là An. Năm nay mình chín tuổi. Mình học lớp 3, trường Tiểu học Kim Đồng. Mình thích môn Tiếng Việt và thích ăn phở. Ước mơ của mình là trở thành bác sĩ.</div>
      <div class="tipBox">💡 <b>Mẹo:</b> Viết xong đọc to lại một lần. Nếu nghe xuôi tai là câu đã đúng. Đọc cho ba mẹ nghe nhé!</div>
      <div class="challengeBox"><b>Thử thách:</b> Viết một đoạn 5 câu về gia đình em, mỗi người một câu.</div>`},

  {icon:"🤖", color:"#6366F1", title:"Bài 26: Làm quen với AI", desc:"AI là gì? AI quanh em, AI học thế nào và cách dùng AI an toàn, thông minh.",
    body:`<p><b>🎯 Mục tiêu:</b> Hiểu AI là gì, nhận ra AI quanh mình, và biết dùng AI một cách an toàn, thông minh.</p>
      <div class="langBox"><b>AI</b> = <b>Trí tuệ nhân tạo</b> (Artificial Intelligence).<br>
      Là khi con người dạy cho <b>máy tính</b> biết "học" và "suy nghĩ" để giúp việc cho mình. AI <b>không phải người thật</b>, mà là chương trình do con người tạo ra.</div>

      <div class="secTitle" data-icon="🤔">AI là gì?</div>
      <div class="dlg"><b>Ví dụ dễ hiểu:</b> Em xem một chú chó nhiều lần thì em nhận ra được con chó. Máy tính cũng vậy — cho nó xem <b>thật nhiều</b> hình con chó, dần dần nó cũng <b>đoán</b> được đâu là con chó. Đó chính là AI đang "học"!</div>

      <div class="secTitle" data-icon="🔎">AI ở quanh em</div>
      <p style="color:#64748B;font-size:14px;margin:-4px 0 10px">AI có ở rất nhiều nơi mà có khi em không để ý:</p>
      <div class="vocabGrid">
        <div class="vocabItem"><div class="ve">🗣️</div><div class="vw">Trợ lý ảo (nói là nó trả lời)</div></div>
        <div class="vocabItem"><div class="ve">📺</div><div class="vw">Gợi ý video em thích xem</div></div>
        <div class="vocabItem"><div class="ve">🗺️</div><div class="vw">Bản đồ chỉ đường</div></div>
        <div class="vocabItem"><div class="ve">📷</div><div class="vw">Nhận diện khuôn mặt</div></div>
        <div class="vocabItem"><div class="ve">💬</div><div class="vw">Chatbot trò chuyện</div></div>
        <div class="vocabItem"><div class="ve">🌐</div><div class="vw">Dịch từ tiếng này sang tiếng khác</div></div>
      </div>

      <div class="secTitle" data-icon="⚙️">AI học như thế nào?</div>
      <div class="dlg"><b>AI học từ ví dụ</b> — càng nhiều ví dụ, càng giỏi. Giống em luyện đọc: đọc <b>đi đọc lại</b> nhiều lần thì nhớ lâu.<br>
      Nhớ trò "lặp lại 5 lần" ở Bài 1 không? Việc lặp đó gọi là <b>vòng lặp (loop)</b> — máy tính cũng lặp như thế để học đó! 🔁</div>

      <div class="secTitle" data-icon="🛡️">Dùng AI an toàn & thông minh</div>
      <div class="toneList">
        <div class="toneRow lime"><div class="tg">✅</div><div class="td"><b>Nên:</b> Hỏi ba mẹ/thầy cô khi dùng AI. Coi AI như <b>người trợ giúp</b>, còn mình vẫn tự suy nghĩ.</div></div>
        <div class="toneRow yel"><div class="tg">⚠️</div><div class="td"><b>Cẩn thận:</b> AI <b>có thể trả lời sai</b>. Luôn <b>kiểm tra lại</b>, đừng tin 100%.</div></div>
        <div class="toneRow pink"><div class="tg">🚫</div><div class="td"><b>Không nên:</b> Chia sẻ <b>thông tin cá nhân</b> (tên đầy đủ, địa chỉ, số điện thoại, mật khẩu) cho AI hay người lạ.</div></div>
      </div>

      <div class="secTitle" data-icon="💜">AI không thay được em</div>
      <div class="dlg">AI tính rất nhanh, nhớ rất nhiều, nhưng <b>sự sáng tạo, tình cảm và lòng tốt</b> là điều <b>chỉ con người mới có</b>. AI là công cụ giúp em giỏi hơn, còn người quyết định vẫn là <b>em</b>! 🌟</div>

      <div class="tipBox">💡 <b>Mẹo:</b> Khi hỏi AI, hãy hỏi <b>rõ ràng</b> điều mình muốn — hỏi càng rõ, câu trả lời càng đúng ý.</div>
      <div class="challengeBox"><b>Thử thách:</b> Kể tên 3 chỗ em thấy AI trong cuộc sống hằng ngày. Theo em, AI giúp ích gì cho mình?</div>`},
];

/* =========================================================
   TRÒ CHƠI TƯƠNG TÁC DÙNG CHUNG CHO BÀI HỌC (data-driven)
   4 loại: quiz (đố nhanh) · listen (nghe & chọn) · match (nối) · sort (phân loại)
   ========================================================= */
function gameMeta(type){
  return ({
    quiz:   ["⚡", "Đố nhanh"],
    listen: ["🎧", "Nghe & chọn"],
    match:  ["🔗", "Nối hình với chữ"],
    sort:   ["🗂️", "Phân loại"],
  })[type] || ["🎮", "Trò chơi"];
}
function renderLessonGames(games){
  if(!games || !games.length) return "";
  let html = `<div class="secTitle" data-icon="🎮">Luyện tập tương tác</div>
    <p style="color:#64748B;font-size:14px;margin:-6px 0 12px">Chơi thử các trò bên dưới để nhớ bài lâu hơn nhé! 👇</p>`;
  games.forEach((g, i) => {
    const [ic, dft] = gameMeta(g.type);
    html += `<div class="lgGame"><div class="lgTitle">${ic} ${g.title || dft}</div>
      <div class="lgBody" id="lg${i}_body"></div></div>`;
  });
  return html;
}
function initLessonGames(games){
  if(!games) return;
  games.forEach((g, i) => {
    const body = document.getElementById("lg" + i + "_body");
    if(!body) return;
    if(g.type === "quiz") initQuizGame(body, g);
    else if(g.type === "listen") initListenGameG(body, g);
    else if(g.type === "match") initMatchGame(body, g);
    else if(g.type === "sort") initSortGameG(body, g);
  });
}
function lgResultHtml(score, total){
  const win = score >= Math.ceil(total*0.7);
  return `<div class="lgResult">${win ? "🏆" : "🎉"} Kết quả: <b>${score}/${total}</b> ${win ? "— giỏi quá!" : "— chơi lại thử nha!"}</div>
    <div class="center"><button class="btn small lgReplay">Chơi lại 🔄</button></div>`;
}
/* ---- Đố nhanh ---- */
function initQuizGame(body, g){
  const qs = shuffle(g.questions);
  let idx = 0, score = 0;
  const render = () => {
    if(idx >= qs.length){
      body.innerHTML = lgResultHtml(score, qs.length);
      body.querySelector(".lgReplay").addEventListener("click", () => { idx = 0; score = 0; render(); });
      if(score >= Math.ceil(qs.length*0.7)) burst(6);
      return;
    }
    const q = qs[idx];
    const opts = shuffle(q.opts.map((o, k) => [o, k === q.a]));
    let h = `<div class="lgProg">Câu ${idx+1}/${qs.length} · ⭐ ${score}</div>`;
    if(q.glyph) h += `<div class="lgGlyph">${q.glyph}</div>`;
    h += `<div class="lgQ">${q.q}</div><div class="lgOpts">`;
    opts.forEach(o => h += `<button class="lgOpt" data-ok="${o[1] ? 1 : 0}">${o[0]}</button>`);
    h += `</div>`;
    body.innerHTML = h;
    body.querySelectorAll(".lgOpt").forEach(btn => btn.addEventListener("click", () => {
      if(body.dataset.locked) return; body.dataset.locked = "1";
      const ok = btn.dataset.ok === "1";
      body.querySelectorAll(".lgOpt").forEach(b => { b.classList.add("locked"); if(b.dataset.ok === "1") b.classList.add("ok"); });
      if(ok){ score++; sfx.correct(); } else { btn.classList.add("no"); sfx.wrong(); }
      setTimeout(() => { idx++; delete body.dataset.locked; render(); }, 850);
    }));
  };
  render();
}
/* ---- Nghe & chọn ---- */
function initListenGameG(body, g){
  const items = g.items.slice();
  const nOpt = Math.min(4, items.length);
  const totalR = Math.min(10, Math.max(4, items.length));
  let round = 0, score = 0, target = null;
  const play = () => { if(target) speakVN(target); };
  const nextRound = () => {
    if(round >= totalR){
      body.innerHTML = lgResultHtml(score, totalR);
      body.querySelector(".lgReplay").addEventListener("click", () => { round = 0; score = 0; nextRound(); });
      if(score >= Math.ceil(totalR*0.7)) burst(6);
      return;
    }
    target = rand(items);
    let opts = [target];
    shuffle(items.filter(w => w !== target)).forEach(w => { if(opts.length < nOpt) opts.push(w); });
    opts = shuffle(opts);
    let h = `<div class="lgProg">Lượt ${round+1}/${totalR} · ⭐ ${score}</div>
      <div class="center"><button class="btn hearBtn lgHear">🔊 Nghe</button></div><div class="lgOpts">`;
    opts.forEach(o => h += `<button class="lgOpt" data-w="${o}">${o}</button>`);
    h += `</div>`;
    body.innerHTML = h;
    body.querySelector(".lgHear").addEventListener("click", play);
    body.querySelectorAll(".lgOpt").forEach(btn => btn.addEventListener("click", () => {
      if(body.dataset.locked) return; body.dataset.locked = "1";
      const ok = btn.dataset.w === target;
      body.querySelectorAll(".lgOpt").forEach(b => { b.classList.add("locked"); if(b.dataset.w === target) b.classList.add("ok"); });
      if(ok){ score++; sfx.correct(); } else { btn.classList.add("no"); sfx.wrong(); }
      setTimeout(() => { round++; delete body.dataset.locked; nextRound(); }, 900);
    }));
    setTimeout(play, 350);
  };
  nextRound();
}
/* ---- Nối hình với chữ ---- */
function initMatchGame(body, g){
  const pairs = g.pairs.slice();
  const build = () => {
    const lefts = shuffle(pairs.map((p, k) => ({ v: p[0], k })));
    const rights = shuffle(pairs.map((p, k) => ({ v: p[1], k })));
    let h = `<div class="lgProg lgMatchInfo">Bấm 1 hình rồi bấm chữ đúng · Đã nối 0/${pairs.length}</div><div class="lgMatch"><div class="lgCol">`;
    lefts.forEach(o => h += `<button class="lgCell" data-side="L" data-k="${o.k}">${o.v}</button>`);
    h += `</div><div class="lgCol">`;
    rights.forEach(o => h += `<button class="lgCell" data-side="R" data-k="${o.k}">${o.v}</button>`);
    h += `</div></div><div class="center"><button class="btn small lgReplay">Làm lại ↻</button></div>`;
    body.innerHTML = h;
    let selL = null, matched = 0;
    const info = body.querySelector(".lgMatchInfo");
    body.querySelectorAll(".lgCell").forEach(c => c.addEventListener("click", () => {
      if(c.classList.contains("done")) return;
      if(c.dataset.side === "L"){
        body.querySelectorAll('.lgCell[data-side="L"]').forEach(x => x.classList.remove("sel"));
        c.classList.add("sel"); selL = c;
      } else {
        if(!selL) return;
        const r = body.querySelector('.lgCell[data-side="R"].sel'); if(r) r.classList.remove("sel");
        if(selL.dataset.k === c.dataset.k){
          selL.classList.add("done"); c.classList.add("done"); selL.classList.remove("sel");
          matched++; sfx.correct();
          info.innerHTML = matched === pairs.length
            ? "🎉 Giỏi quá! Nối đúng hết rồi!"
            : `Bấm 1 hình rồi bấm chữ đúng · Đã nối ${matched}/${pairs.length}`;
          if(matched === pairs.length) burst(8);
          selL = null;
        } else {
          c.classList.add("shake"); sfx.wrong();
          setTimeout(() => c.classList.remove("shake"), 400);
        }
      }
    }));
    body.querySelector(".lgReplay").addEventListener("click", build);
  };
  build();
}
/* ---- Phân loại ---- */
function initSortGameG(body, g){
  const build = () => {
    const items = shuffle(g.items.slice());
    let h = `<div class="lgProg">${g.hint || "Bấm một từ, rồi bấm đúng ô của nó!"}</div><div class="lgSortWords">`;
    items.forEach(it => h += `<button class="wordChip" data-bin="${it[1]}">${it[0]}</button>`);
    h += `</div><div class="lgSortBins">`;
    g.bins.forEach(b => h += `<div class="lgBin" data-bin="${b}"><div class="lgBinLabel">${b}</div><div class="lgBinDrop"></div></div>`);
    h += `</div><div class="center"><button class="btn small lgReplay">Làm lại ↻</button></div>`;
    body.innerHTML = h;
    let sel = null, done = 0; const total = items.length;
    body.querySelectorAll(".wordChip").forEach(w => w.addEventListener("click", () => {
      if(w.classList.contains("used")) return;
      body.querySelectorAll(".wordChip").forEach(x => x.classList.remove("sel"));
      w.classList.add("sel"); sel = w;
    }));
    body.querySelectorAll(".lgBin").forEach(bin => bin.addEventListener("click", () => {
      if(!sel) return;
      if(sel.dataset.bin === bin.dataset.bin){
        const chip = document.createElement("span"); chip.className = "miniChip ok"; chip.textContent = sel.textContent;
        bin.querySelector(".lgBinDrop").appendChild(chip);
        sel.classList.add("used"); sel.classList.remove("sel"); sel = null; done++; sfx.correct();
        if(done === total) burst(8);
      } else {
        bin.classList.add("bad"); sfx.wrong(); setTimeout(() => bin.classList.remove("bad"), 400);
      }
    }));
    body.querySelector(".lgReplay").addEventListener("click", build);
  };
  build();
}

/* Dữ liệu trò chơi cho từng bài (index 0 = Bài 1). Bài 1 đã có trò riêng nên bỏ qua. */
const LESSON_GAMES = {
  1: [ // Bài 2: E – Ê
    {type:"listen", title:"Nghe & chọn tiếng E / Ê", items:["mẹ","xe","nghe","dê","bê","mê"]},
    {type:"sort", title:"Phân loại E và Ê", hint:"Bấm từ rồi bỏ vào đúng nhà E hoặc Ê!", bins:["Nhà E","Nhà Ê"],
      items:[["mẹ","Nhà E"],["xe","Nhà E"],["nghe","Nhà E"],["dê","Nhà Ê"],["bê","Nhà Ê"],["mê","Nhà Ê"]]},
    {type:"quiz", title:"Đố nhanh E – Ê", questions:[
      {q:"Từ nào có âm Ê?", opts:["mẹ","dê","xe","nghe"], a:1},
      {q:"«con dê» dùng chữ nào?", glyph:"🐐", opts:["E","Ê"], a:1},
      {q:"Từ nào có âm E?", opts:["bê","mê","xe","dê"], a:2},
    ]},
  ],
  2: [ // Bài 3: O – Ô – Ơ
    {type:"listen", title:"Nghe & chọn tiếng O / Ô / Ơ", items:["cho","to","bố","cô","mơ","cơ"]},
    {type:"sort", title:"Phân loại O – Ô – Ơ", hint:"Bấm từ rồi bỏ vào đúng nhà!", bins:["Nhà O","Nhà Ô","Nhà Ơ"],
      items:[["cho","Nhà O"],["to","Nhà O"],["bố","Nhà Ô"],["cô","Nhà Ô"],["mơ","Nhà Ơ"],["cơ","Nhà Ơ"]]},
    {type:"quiz", title:"Đố nhanh O – Ô – Ơ", questions:[
      {q:"Từ nào có âm Ơ?", opts:["cho","bố","mơ","to"], a:2},
      {q:"Từ nào có âm Ô?", opts:["cho","bố","mơ","to"], a:1},
      {q:"«quả mơ» dùng chữ nào?", glyph:"🍑", opts:["O","Ô","Ơ"], a:2},
    ]},
  ],
  3: [ // Bài 4: U – Ư
    {type:"listen", title:"Nghe & chọn tiếng U / Ư", items:["tủ","đủ","bù","từ","tư","vừa"]},
    {type:"sort", title:"Phân loại U và Ư", hint:"Bấm từ rồi bỏ vào đúng nhà!", bins:["Nhà U","Nhà Ư"],
      items:[["tủ","Nhà U"],["đủ","Nhà U"],["bù","Nhà U"],["từ","Nhà Ư"],["tư","Nhà Ư"],["vừa","Nhà Ư"]]},
    {type:"quiz", title:"Đố nhanh U – Ư", questions:[
      {q:"Từ nào có âm Ư?", opts:["tủ","từ","đủ","bù"], a:1},
      {q:"«cái tủ» dùng chữ nào?", glyph:"🚪", opts:["U","Ư"], a:0},
    ]},
  ],
  4: [ // Bài 5: I – Y
    {type:"quiz", title:"Đố nhanh I – Y", questions:[
      {q:"Chữ Y trong tiếng Việt thường đứng sau chữ nào?", opts:["U","A","O","E"], a:0},
      {q:"Từ nào viết ĐÚNG?", opts:["tuy","tui (thay cho tuy)","tiu","tuiy"], a:0},
      {q:"Từ nào dùng I?", opts:["tuy","huy","tin","nguy"], a:2},
    ]},
    {type:"listen", title:"Nghe & chọn", items:["tin","tim","tuy","huy","sinh"]},
  ],
  5: [ // Bài 6: 6 dấu thanh
    {type:"listen", title:"Nghe & chọn đúng dấu thanh", items:["ma","mà","má","mả","mã","mạ"]},
    {type:"quiz", title:"Đố nhanh dấu thanh", questions:[
      {q:"«đôi má» mang dấu gì?", glyph:"😊", opts:["Ngang","Huyền","Sắc","Nặng"], a:2},
      {q:"«cây mạ» mang dấu gì?", glyph:"🌱", opts:["Sắc","Hỏi","Ngã","Nặng"], a:3},
      {q:"Từ nào mang dấu huyền?", opts:["má","mà","mả","mã"], a:1},
    ]},
    {type:"sort", title:"Phân loại theo dấu", hint:"Bấm từ rồi bỏ vào đúng dấu!", bins:["Sắc","Huyền","Nặng"],
      items:[["cá","Sắc"],["bố","Sắc"],["bà","Huyền"],["dừa","Huyền"],["cạ","Nặng"],["mạ","Nặng"]]},
  ],
  6: [ // Bài 7: Từ vựng theo chủ đề
    {type:"match", title:"Nối con vật với tên", pairs:[["🐱","con mèo"],["🐶","con chó"],["🐔","con gà"],["🐟","con cá"],["🐮","con bò"]]},
    {type:"match", title:"Nối màu với tên", pairs:[["🔴","màu đỏ"],["🟢","màu lá"],["🟡","màu vàng"],["🟣","màu tím"],["⚫","màu đen"]]},
    {type:"listen", title:"Nghe & chọn từ", items:["con mèo","con cá","màu đỏ","cơm","phở","quả táo"]},
  ],
  7: [ // Bài 8: Hội thoại cơ bản
    {type:"quiz", title:"Đố nhanh giao tiếp", questions:[
      {q:"Gặp cô giáo, em nói gì?", opts:["Con chào cô ạ!","Ê!","Đi đâu đó?","Biến đi!"], a:0},
      {q:"Bạn cho em mượn bút, em nói gì?", opts:["Cảm ơn bạn nhé!","Kệ bạn.","Không cần.","Của tôi mà."], a:0},
      {q:"Em làm bạn buồn, em nói gì?", opts:["Mình xin lỗi.","Không phải mình.","Kệ đi.","Ai biết."], a:0},
    ]},
    {type:"match", title:"Nối tình huống với câu nói", pairs:[["👋 Gặp nhau","Chào bạn!"],["🙏 Được giúp","Cảm ơn bạn!"],["😅 Làm sai","Mình xin lỗi."],["🌙 Ra về","Tạm biệt nhé!"]]},
  ],
  8: [ // Bài 9: Ghép vần
    {type:"quiz", title:"Đố nhanh ghép vần", questions:[
      {q:"b + a = ?", opts:["ba","ab","bờ","aba"], a:0},
      {q:"c + á = ?", glyph:"🐟", opts:["ca","cá","ác","cà"], a:1},
      {q:"m + e = ?", opts:["em","me","mờ","meo"], a:1},
      {q:"c + ơ + m = ?", glyph:"🍚", opts:["cơm","mcơ","cmơ","ơcm"], a:0},
    ]},
    {type:"listen", title:"Nghe & chọn tiếng ghép", items:["ba","cá","me","cơm","bà","nhà"]},
  ],
  9: [ // Bài 10: Đọc hiểu
    {type:"quiz", title:"Đố nhanh đọc hiểu", questions:[
      {q:"«Bé Na có một con mèo màu đen.» Mèo màu gì?", opts:["Trắng","Đen","Vàng","Xám"], a:1},
      {q:"«Trời mưa nên An ở nhà.» Vì sao An ở nhà?", opts:["Trời nắng","Trời mưa","Đi học","Đi chơi"], a:1},
    ]},
  ],
  10: [ // Bài 11: Từ vựng gia đình
    {type:"match", title:"Nối người thân với tên gọi", pairs:[["👨","bố"],["👩","mẹ"],["👴","ông"],["👵","bà"],["👶","em bé"]]},
    {type:"listen", title:"Nghe & chọn từ gia đình", items:["bố","mẹ","ông","bà","anh trai","chị gái"]},
    {type:"quiz", title:"Đố nhanh gia đình", questions:[
      {q:"Mẹ của mẹ em gọi là gì?", glyph:"👵", opts:["Bà","Cô","Chị","Dì"], a:0},
      {q:"Con trai lớn hơn em gọi là gì?", glyph:"👦", opts:["Em","Anh trai","Chị gái","Ông"], a:1},
    ]},
  ],
  11: [ // Bài 12: Số đếm 1–20
    {type:"listen", title:"Nghe & chọn số", items:["một","hai","ba","bốn","năm","sáu","bảy","tám","chín","mười"]},
    {type:"match", title:"Nối số với chữ", pairs:[["1️⃣","một"],["3️⃣","ba"],["5️⃣","năm"],["7️⃣","bảy"],["🔟","mười"]]},
    {type:"quiz", title:"Đố nhanh số đếm", questions:[
      {q:"Số 5 đọc là gì?", glyph:"5️⃣", opts:["Năm","Lăm","Bốn","Sáu"], a:0},
      {q:"Số 8 đọc là gì?", glyph:"8️⃣", opts:["Bảy","Chín","Tám","Mười"], a:2},
    ]},
  ],
  12: [ // Bài 13: Ngày tháng
    {type:"quiz", title:"Đố nhanh ngày tháng", questions:[
      {q:"Một tuần có mấy ngày?", opts:["5 ngày","7 ngày","10 ngày","12 ngày"], a:1},
      {q:"Ngày nghỉ cuối tuần thường là?", opts:["Thứ 2","Thứ 4","Chủ nhật","Thứ 5"], a:2},
      {q:"Một năm có mấy tháng?", opts:["10 tháng","11 tháng","12 tháng","7 tháng"], a:2},
    ]},
  ],
  13: [ // Bài 14: Mô tả người
    {type:"match", title:"Nối tính từ với hình", pairs:[["📏 cao/thấp","chiều cao"],["💇 dài/ngắn","mái tóc"],["😊","vui vẻ"],["👓","đeo kính"]]},
    {type:"quiz", title:"Đố nhanh mô tả người", questions:[
      {q:"Người rất vui thì gọi là?", glyph:"😊", opts:["Buồn","Vui vẻ","Giận","Sợ"], a:1},
      {q:"Trái nghĩa với «cao» là?", opts:["To","Thấp","Dài","Béo"], a:1},
    ]},
  ],
  14: [ // Bài 15: Phụ âm đầu
    {type:"listen", title:"Nghe & chọn tiếng", items:["bát","cá","dê","gấu","hoa","kéo","mèo","tay"]},
    {type:"match", title:"Nối hình với từ", pairs:[["🐟","cá"],["🧸","gấu"],["🌸","hoa"],["✂️","kéo"],["🐱","mèo"]]},
    {type:"quiz", title:"Đố nhanh phụ âm đầu", questions:[
      {q:"«cá» bắt đầu bằng phụ âm nào?", glyph:"🐟", opts:["c","k","g","t"], a:0},
      {q:"«hoa» bắt đầu bằng phụ âm nào?", glyph:"🌸", opts:["h","k","n","l"], a:0},
    ]},
  ],
  15: [ // Bài 16: Phụ âm ghép
    {type:"listen", title:"Nghe & chọn tiếng", items:["chó","khỉ","ngủ","nhà","phở","thỏ","trâu","quả"]},
    {type:"quiz", title:"Đố nhanh phụ âm ghép", questions:[
      {q:"«thỏ» bắt đầu bằng phụ âm ghép nào?", glyph:"🐰", opts:["th","ch","nh","kh"], a:0},
      {q:"«nhà» bắt đầu bằng phụ âm ghép nào?", glyph:"🏠", opts:["nh","ng","gh","tr"], a:0},
      {q:"«trâu» bắt đầu bằng phụ âm ghép nào?", glyph:"🐃", opts:["tr","ch","th","ph"], a:0},
    ]},
    {type:"match", title:"Nối hình với từ", pairs:[["🐶","chó"],["🐒","khỉ"],["🏠","nhà"],["🍜","phở"],["🐃","trâu"]]},
  ],
  16: [ // Bài 17: Chính tả c/k, g/gh, ng/ngh
    {type:"quiz", title:"Đố nhanh chính tả", questions:[
      {q:"Trước e, ê, i viết âm «cờ» là?", opts:["c","k","q","kh"], a:1},
      {q:"Từ nào viết ĐÚNG?", opts:["cái ghế","cái gế","cái ghê","cái kế"], a:0},
      {q:"Từ nào viết ĐÚNG?", opts:["nghe nhạc","nge nhạc","nghe nhac","nge nhạc"], a:0},
      {q:"«con gà» viết bằng?", glyph:"🐔", opts:["g","gh","k","ng"], a:0},
    ]},
    {type:"sort", title:"Phân loại c / k", hint:"Bỏ từ vào đúng nhóm dùng «c» hay «k»!", bins:["Dùng c","Dùng k"],
      items:[["cá","Dùng c"],["cô","Dùng c"],["cua","Dùng c"],["kể","Dùng k"],["kim","Dùng k"],["kênh","Dùng k"]]},
  ],
  17: [ // Bài 18: Vần thường gặp
    {type:"listen", title:"Nghe & chọn tiếng có vần", items:["bàn","ăn","cân","sáng","trăng","ong"]},
    {type:"sort", title:"Phân loại vần: n hay ng", hint:"Vần kết thúc bằng «n» hay «ng»?", bins:["Kết thúc n","Kết thúc ng"],
      items:[["bàn","Kết thúc n"],["ăn","Kết thúc n"],["tin","Kết thúc n"],["sáng","Kết thúc ng"],["trăng","Kết thúc ng"],["ong","Kết thúc ng"]]},
  ],
  18: [ // Bài 19: Cơ thể
    {type:"match", title:"Nối bộ phận với tên", pairs:[["👁️","mắt"],["👂","tai"],["👃","mũi"],["👄","miệng"],["✋","tay"],["🦶","chân"]]},
    {type:"listen", title:"Nghe & chọn bộ phận", items:["mắt","tai","mũi","miệng","tay","chân","răng","tóc"]},
    {type:"quiz", title:"Đố nhanh cơ thể", questions:[
      {q:"Bộ phận nào để NHÌN?", glyph:"👁️", opts:["Tai","Mắt","Mũi","Tay"], a:1},
      {q:"Bộ phận nào để NGHE?", glyph:"👂", opts:["Mắt","Mũi","Tai","Chân"], a:2},
    ]},
  ],
  19: [ // Bài 20: Trường học
    {type:"match", title:"Nối đồ dùng với tên", pairs:[["📚","sách"],["✏️","bút chì"],["📏","thước"],["🎒","cặp sách"],["🖍️","bút màu"]]},
    {type:"listen", title:"Nghe & chọn đồ dùng", items:["sách","vở","bút","thước","cặp sách","cục tẩy"]},
    {type:"quiz", title:"Đố nhanh trường học", questions:[
      {q:"Dùng gì để ĐO cho thẳng?", glyph:"📏", opts:["Bút","Thước","Sách","Tẩy"], a:1},
      {q:"Đựng sách vở đi học bằng gì?", glyph:"🎒", opts:["Cặp sách","Cái mũ","Đôi giày","Cái ô"], a:0},
    ]},
  ],
  20: [ // Bài 21: Nghề nghiệp
    {type:"match", title:"Nối nghề với hình", pairs:[["👨‍⚕️","bác sĩ"],["👩‍🏫","giáo viên"],["👨‍🌾","nông dân"],["👨‍🍳","đầu bếp"],["👮","công an"]]},
    {type:"listen", title:"Nghe & chọn nghề", items:["bác sĩ","giáo viên","nông dân","đầu bếp","phi công","họa sĩ"]},
    {type:"quiz", title:"Đố nhanh nghề nghiệp", questions:[
      {q:"Ai khám bệnh cho em?", glyph:"👨‍⚕️", opts:["Bác sĩ","Đầu bếp","Nông dân","Họa sĩ"], a:0},
      {q:"Ai dạy em học?", glyph:"👩‍🏫", opts:["Công an","Giáo viên","Phi công","Thợ xây"], a:1},
    ]},
  ],
  21: [ // Bài 22: Thời tiết & mùa
    {type:"match", title:"Nối thời tiết với hình", pairs:[["☀️","trời nắng"],["🌧️","trời mưa"],["💨","trời gió"],["🌈","cầu vồng"],["❄️","mùa đông"]]},
    {type:"listen", title:"Nghe & chọn từ", items:["trời nắng","trời mưa","trời gió","mùa xuân","mùa hạ","mùa đông"]},
    {type:"quiz", title:"Đố nhanh thời tiết & mùa", questions:[
      {q:"Mùa nào lạnh nhất?", glyph:"❄️", opts:["Mùa hạ","Mùa xuân","Mùa đông","Mùa thu"], a:2},
      {q:"Trời có mưa thì em cần mang gì?", glyph:"🌧️", opts:["Cái ô (dù)","Cái quạt","Kính mát","Đôi dép"], a:0},
    ]},
  ],
  22: [ // Bài 23: Danh từ – Động từ – Tính từ
    {type:"sort", title:"Phân loại từ", hint:"Từ này là Danh từ, Động từ hay Tính từ?", bins:["Danh từ","Động từ","Tính từ"],
      items:[["con mèo","Danh từ"],["trường học","Danh từ"],["ăn","Động từ"],["chạy","Động từ"],["cao","Tính từ"],["đẹp","Tính từ"]]},
    {type:"quiz", title:"Đố nhanh từ loại", questions:[
      {q:"«chạy» là loại từ gì?", glyph:"🏃", opts:["Danh từ","Động từ","Tính từ"], a:1},
      {q:"«đẹp» là loại từ gì?", glyph:"🌸", opts:["Danh từ","Động từ","Tính từ"], a:2},
      {q:"«con mèo» là loại từ gì?", glyph:"🐱", opts:["Danh từ","Động từ","Tính từ"], a:0},
    ]},
  ],
  23: [ // Bài 24: Đặt câu hỏi
    {type:"match", title:"Nối từ hỏi với ý nghĩa", pairs:[["👤 Ai?","hỏi về người"],["📍 Ở đâu?","hỏi nơi chốn"],["⏰ Khi nào?","hỏi thời gian"],["💡 Vì sao?","hỏi lý do"]]},
    {type:"quiz", title:"Đố nhanh câu hỏi", questions:[
      {q:"Hỏi về NGƯỜI dùng từ nào?", opts:["Ai?","Ở đâu?","Khi nào?","Cái gì?"], a:0},
      {q:"Hỏi về NƠI CHỐN dùng từ nào?", opts:["Ai?","Ở đâu?","Vì sao?","Thế nào?"], a:1},
      {q:"Câu hỏi kết thúc bằng dấu gì?", opts:["Dấu chấm .","Dấu phẩy ,","Dấu chấm hỏi ?","Dấu chấm than !"], a:2},
    ]},
  ],
  24: [ // Bài 25: Viết đoạn văn
    {type:"quiz", title:"Đố nhanh về câu & đoạn văn", questions:[
      {q:"Cuối một câu kể, em đặt dấu gì?", opts:["Dấu chấm .","Dấu chấm hỏi ?","Dấu phẩy ,","Không cần"], a:0},
      {q:"Đầu câu, chữ cái đầu phải viết thế nào?", opts:["Viết thường","Viết HOA","Viết nghiêng","Tùy thích"], a:1},
      {q:"Đoạn văn giới thiệu bản thân nên có câu nào?", opts:["Tên của mình","Món ăn em ghét","Số nhà hàng xóm","Không câu nào"], a:0},
    ]},
  ],
  25: [ // Bài 26: Làm quen với AI
    {type:"quiz", title:"Đố nhanh về AI", questions:[
      {q:"AI là viết tắt của điều gì?", opts:["Trí tuệ nhân tạo","Ăn ít","Anh Isaac","Ánh sáng"], a:0},
      {q:"AI học giỏi hơn nhờ điều gì?", opts:["Xem thật nhiều ví dụ","Ngủ nhiều","Ăn kẹo","Không cần học"], a:0},
      {q:"Khi AI trả lời, em nên?", opts:["Kiểm tra lại, không tin 100%","Tin hết mọi thứ","Không bao giờ dùng","Giấu ba mẹ"], a:0},
      {q:"Điều nào KHÔNG nên chia sẻ cho AI hay người lạ?", opts:["Mật khẩu, địa chỉ nhà","Màu em thích","Con vật em thích","Món ăn ngon"], a:0},
      {q:"Điều gì chỉ con người mới có?", opts:["Tình cảm & sáng tạo","Tính toán nhanh","Nhớ nhiều số","Chạy điện"], a:0},
    ]},
    {type:"match", title:"Nối AI với công việc nó giúp", pairs:[["🗣️","trợ lý ảo"],["🗺️","chỉ đường"],["🌐","dịch ngôn ngữ"],["📷","nhận diện khuôn mặt"],["💬","chatbot trò chuyện"]]},
  ],
};

function renderLessons(){
  document.getElementById("lessonGrid").innerHTML = LESSONS.map((l, i) =>
    `<div class="lessonCard" style="border-top-color:${l.color}" onclick="openLesson(${i})">
       <div class="lIcon">${l.icon}</div>
       <h3>${l.title}</h3><p>${l.desc}</p>
       <span class="lGo">Xem bài học ➜</span>
     </div>`).join("");
}
function openLesson(i){
  const l = LESSONS[i];
  markLessonViewed(i);
  document.getElementById("lessonBody").innerHTML =
    `<div class="lessonHead"><div class="lh-ic">${l.icon}</div><div><h2>${l.title}</h2><p>${l.desc}</p></div></div>
     <div class="lContent">${l.body}${renderLessonGames(LESSON_GAMES[i])}</div>`;
  document.getElementById("lessonModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  sfx.pop();
}
function closeLesson(e){
  if(e && e.target && e.target.id !== "lessonModal" && e.type === "click" && e.currentTarget.id === "lessonModal") return;
  document.getElementById("lessonModal").classList.add("hidden");
  document.body.style.overflow = "";
}

/* =========================================================
   BÀI TẬP — thẻ từ vựng & chọn chủ đề luyện
   ========================================================= */
const DECK = [
  ["🐱","Con mèo"],["🐶","Con chó"],["🐟","Con cá"],["🐔","Con gà"],["🐷","Con lợn"],
  ["🐮","Con bò"],["🐘","Con voi"],["🐰","Con thỏ"],["🐴","Con ngựa"],["🐦","Con chim"],
  ["🍎","Quả táo"],["🍌","Quả chuối"],["🍉","Quả dưa hấu"],["🍊","Quả cam"],["🍇","Quả nho"],
  ["🍚","Cơm"],["🍜","Phở"],["🥛","Sữa"],["🍰","Bánh"],["🥚","Trứng"],
  ["🚗","Ô tô"],["✈️","Máy bay"],["🚲","Xe đạp"],["🚂","Tàu hỏa"],["🚌","Xe buýt"],
  ["☀️","Trời nắng"],["🌧️","Trời mưa"],["🌈","Cầu vồng"],["🌙","Mặt trăng"],["⭐","Ngôi sao"],
  ["🏫","Trường học"],["🏥","Bệnh viện"],["🏠","Ngôi nhà"],["🏪","Cửa hàng"],["🌳","Cây xanh"],
  ["👪","Gia đình"],["👨","Bố"],["👩","Mẹ"],["👴","Ông"],["👵","Bà"],
  ["🔴","Màu đỏ"],["🔵","Màu xanh"],["🟡","Màu vàng"],["🟢","Màu lá"],["🟣","Màu tím"],
  ["✋","Bàn tay"],["🦶","Bàn chân"],["👁️","Con mắt"],["👂","Cái tai"],["👃","Cái mũi"],
];
let fcIndex = 0;
function renderFlashcard(){
  const [e, w] = DECK[fcIndex];
  document.getElementById("flashcard").classList.remove("flipped");
  document.getElementById("fcFront").textContent = e;
  document.getElementById("fcBack").textContent = w;
  document.getElementById("fcCount").textContent = (fcIndex+1) + " / " + DECK.length;
}
function flipCard(){ document.getElementById("flashcard").classList.toggle("flipped"); }
function nextCard(){ fcIndex = (fcIndex+1) % DECK.length; renderFlashcard(); }
function prevCard(){ fcIndex = (fcIndex-1+DECK.length) % DECK.length; renderFlashcard(); }

const PRACTICE_CATS = ["all","tuvung","nghe","hoithoai","matchu","anhviet","dauthanh","doc"];
function renderTopicChips(){
  document.getElementById("topicChips").innerHTML = PRACTICE_CATS.map(k => {
    if(k === "all") return `<button class="topicChip" style="background:linear-gradient(135deg,#7C3AED,#EC4899)" onclick="startPractice('all')">🎲 Tất cả</button>`;
    const c = CATS[k];
    return `<button class="topicChip" style="background:${c.color}" onclick="startPractice('${k}')">${c.emoji} ${c.name}</button>`;
  }).join("");
}

/* =========================================================
   LIÊN HỆ  (⚠️ Đạt nhớ thay thông tin thật của mình vào đây)
   ========================================================= */
const CONTACT = [
  {ic:"📞", bg:"#DBEAFE", label:"Điện thoại / Zalo", val:"0797288017", link:"tel:0797288017", copy:true},
  {ic:"✉️", bg:"#EDE9FE", label:"Email", val:"nguyenthanhdat1491@gmail.com", link:"mailto:nguyenthanhdat1491@gmail.com"},
  {ic:"📘", bg:"#DBEAFE", label:"Facebook", val:"https://www.facebook.com/share/1BtMg8B7ys/?mibextid=wwXIfr", link:"https://www.facebook.com/share/1BtMg8B7ys/?mibextid=wwXIfr"},
  {ic:"⏰", bg:"#FEF3C7", label:"Giờ dạy", val:"Thứ 2 – Chủ nhật · 18h – 21h"},
];
function renderContact(){
  document.getElementById("contactInfo").innerHTML =
    `<h3 class="blockTitle">📍 Thông tin liên hệ</h3><p class="muted">Ba mẹ nhắn cho Thầy Đạt qua kênh nào cũng được nha!</p>` +
    CONTACT.map(c => {
      const content = c.copy
        ? `<a href="${c.link}" style="color:inherit;text-decoration:none;display:flex;align-items:center;gap:8px">
             <span>${c.val}</span>
             <button onclick="copyText('${c.val}', this)" style="background:#F1F5F9;border:2px solid #E2E8F0;border-radius:10px;padding:6px 10px;cursor:pointer;font-size:13px;font-weight:700" title="Sao chép">📋</button>
           </a>`
        : c.link
          ? `<a href="${c.link}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${c.val}</a>`
          : c.val;
      return `<div class="cRow"><div class="ci" style="background:${c.bg}">${c.ic}</div>
        <div class="ct"><b>${c.label}</b><span>${content}</span></div></div>`;
    }).join("");
}
function copyText(text, btn){
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "✅";
    setTimeout(() => btn.textContent = "📋", 1500);
  });
}
function sendContact(e){
  e.preventDefault();
  const form = document.getElementById("cForm");
  const btn = form.querySelector('button[type="submit"]');
  if(btn){ btn.disabled = true; btn.textContent = "Đang gửi..."; }
  const name = document.getElementById("cName").value.trim();
  const phone = document.getElementById("cPhone").value.trim();
  const msg = document.getElementById("cMsg").value.trim();
  const params = {
    from_name: name || "Khách",
    phone: phone,
    message: msg,
    to_email: "nguyenthanhdat1491@gmail.com",
  };
  if(typeof emailjs !== "undefined"){
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", params, "YOUR_PUBLIC_KEY")
      .then(() => {
        document.getElementById("formNote").textContent =
          `Cảm ơn ${name || "bạn"} đã nhắn! 💜 Thầy Đạt sẽ liên hệ lại sớm nhất nha.`;
        form.reset();
      })
      .catch(() => {
        document.getElementById("formNote").textContent =
          "Có lỗi xảy ra, vui lòng thử lại hoặc gọi trực tiếp 0797288017.";
      })
      .finally(() => {
        if(btn){ btn.disabled = false; btn.textContent = "Gửi ngay 💌"; }
      });
  } else {
    document.getElementById("formNote").textContent =
      "Hệ thống đang bảo trì, vui lòng gọi trực tiếp 0797288017.";
    if(btn){ btn.disabled = false; btn.textContent = "Gửi ngay 💌"; }
  }
  return false;
}

/* =========================================================
   TRÌNH CHƠI — dùng chung cho Kiểm tra & Luyện tập
   ========================================================= */
function enterRunner(showStars){
  document.getElementById("runner").classList.remove("hidden");
  document.getElementById("runnerTop").classList.remove("hidden");
  document.getElementById("qCard").classList.remove("hidden");
  document.getElementById("resultCard").classList.add("hidden");
  document.getElementById("starBox").classList.toggle("hidden", !showStars);
  document.body.style.overflow = "hidden";
  document.getElementById("runner").scrollTo({top:0});
}
function exitRunner(){
  document.getElementById("runner").classList.add("hidden");
  document.body.style.overflow = "";
  go(runnerReturn || "home");
}

// Xáo vị trí đáp án trắc nghiệm nhưng nhớ lại đáp án đúng
function prep(q){
  if(!q.opts) return Object.assign({}, q);
  const pairs = shuffle(q.opts.map((o,i) => [o, i === q.a]));
  return Object.assign({}, q, { opts: pairs.map(p => p[0]), a: pairs.findIndex(p => p[1]) });
}

// Bốc ngẫu nhiên 1 câu chưa dùng ở đúng mức sao; hết thì mượn mức gần nhất
function drawQuestion(){
  let lv = star;
  let pool = BANK[lv].map((_,i) => i).filter(i => !used[lv].has(i));
  if(pool.length === 0){
    const borrow = lv === 1 ? [2,3] : lv === 2 ? [1,3] : [2,1];
    for(const l of borrow){
      const p2 = BANK[l].map((_,i) => i).filter(i => !used[l].has(i));
      if(p2.length){ lv = l; pool = p2; break; }
    }
  }
  if(pool.length === 0){ used[lv] = new Set(); pool = BANK[lv].map((_,i) => i); }
  const pi = pool[Math.floor(Math.random()*pool.length)];
  used[lv].add(pi);
  return prep(Object.assign({}, BANK[lv][pi], {lv}));
}

function updateStars(pulse){
  const box = document.getElementById("starBox");
  box.innerHTML = [1,2,3].map(i => `<span class="${i <= star ? "" : "off"}">⭐</span>`).join("");
  if(pulse){ box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse"); }
}

function startQuiz(){
  mode = "test"; runnerReturn = "kiemtra"; total = 15;
  star = 1; idx = 0; score = 0; locked = false; history = [];
  used = {1:new Set(), 2:new Set(), 3:new Set()};
  enterRunner(true);
  updateStars(false);
  render();
}

function startPractice(cat){
  mode = "practice"; runnerReturn = "baitap"; practiceCat = cat;
  queue = [];
  [1,2,3].forEach(lv => BANK[lv].forEach(q => {
    if(q.opts && (cat === "all" || q.cat === cat)) queue.push(Object.assign({}, q, {lv}));
  }));
  queue = shuffle(queue).slice(0, 10);
  total = queue.length;
  idx = 0; score = 0; locked = false; history = [];
  enterRunner(false);
  render();
}

function renderOrder(){
  const ansEl = document.getElementById("ansLine");
  const poolEl = document.getElementById("pool");
  ansEl.className = "ansLine" + (orderAns.length === 0 ? " empty" : "");
  ansEl.innerHTML = orderAns.map((wi, j) => `<button class="chip inans" onclick="unpickWord(${j})">${orderPool[wi]}</button>`).join("");
  poolEl.innerHTML = orderPool.map((w, i) =>
    orderAns.includes(i)
      ? `<button class="chip ghost">${w}</button>`
      : `<button class="chip" onclick="pickWord(${i})">${w}</button>`
  ).join("");
  document.getElementById("btnCheck").disabled = (orderAns.length !== orderPool.length);
}

function pickWord(i){ if(locked || orderAns.includes(i)) return; orderAns.push(i); renderOrder(); }
function unpickWord(j){ if(locked) return; orderAns.splice(j,1); renderOrder(); }

function checkOrder(){
  if(locked) return;
  const built = orderAns.map(i => orderPool[i]).join(" ");
  const target = current.words.join(" ");
  const ansEl = document.getElementById("ansLine");
  document.querySelectorAll(".chip").forEach(c => c.classList.add("locked"));
  document.getElementById("btnCheck").classList.add("hidden");
  if(built === target){
    ansEl.classList.add("good");
    applyResult("full", built, "");
  } else {
    ansEl.classList.add("badl");
    applyResult("none", built, "Câu đúng là: \"" + target + "\"");
  }
}

function speakGrade(res, el){
  if(locked) return;
  document.querySelectorAll(".gbtn").forEach(b => b.classList.add("locked"));
  el.classList.add("chosen");
  const label = res === "full" ? "Nói tốt" : res === "half" ? "Nói được một phần" : "Chưa nói được";
  applyResult(res, label, "");
}

// res: 'full' | 'half' | 'none'
function applyResult(res, picked, extra){
  locked = true;
  history.push({q: current, picked: picked, res: res});
  const fb = document.getElementById("fb");
  const fbText = document.getElementById("fbText");
  if(res === "full") score += 1;
  else if(res === "half") score += 0.5;

  if(mode === "test"){
    if(res === "full"){
      const msg = star < 3 ? `Lên ${star+1} sao! ${"⭐".repeat(star+1)}` : "Giữ vững 3 sao! 🏆";
      star = Math.min(3, star + 1);
      fb.classList.add("show","good");
      fbText.textContent = rand(PRAISE) + " " + msg;
      burst(6);
    } else if(res === "half"){
      fb.classList.add("show","mid");
      fbText.textContent = "Được nè! 🙂 Giữ nguyên sao — lần sau nói dài thêm xíu nha!";
    } else {
      const msg = star > 1 ? `Về ${star-1} sao, gỡ lại ngay thôi! 💪` : "Vẫn 1 sao, cố lên! 💪";
      star = Math.max(1, star - 1);
      fb.classList.add("show","bad");
      fbText.textContent = (extra ? extra + " · " : "") + msg;
    }
    updateStars(true);
  } else { // ---- luyện tập: không tính sao ----
    if(res === "full"){
      fb.classList.add("show","good");
      fbText.textContent = rand(PRAISE);
      burst(5);
    } else {
      fb.classList.add("show","bad");
      fbText.textContent = (extra ? extra + " — " : "") + "Không sao, câu sau cố lên nha! 💪";
    }
  }
  document.getElementById("btnNext").classList.remove("hidden");
}

function render(){
  current = (mode === "practice") ? prep(Object.assign({}, queue[idx])) : drawQuestion();
  const q = current, cat = CATS[q.cat];
  locked = false;
  document.getElementById("counter").textContent = (idx+1) + "/" + total;
  document.getElementById("bar").style.width = (idx / total * 100) + "%";

  let inner = `<span class="catChip" style="background:${cat.chip}">${cat.emoji} ${cat.name}</span>`;
  inner += `<span class="lvChip">${"⭐".repeat(q.lv)} Câu ${q.lv} sao</span>`;

  if(q.type === "speak"){
    inner += `<div class="speakBox"><div class="mic">🎤</div><div class="prompt">${q.q}</div></div>`;
    inner += `<p class="qSub">Bé trả lời bằng lời — người lớn nghe rồi bấm chấm giúp nha! 👇</p>`;
    inner += `<div class="grade">
      <button class="gbtn full" onclick="speakGrade('full', this)">🔥 Nói tốt — trả lời rõ, đủ ý</button>
      <button class="gbtn half" onclick="speakGrade('half', this)">🙂 Nói được một phần — có ý nhưng ngắn / chêm tiếng Anh</button>
      <button class="gbtn none" onclick="speakGrade('none', this)">💭 Chưa nói được</button>
    </div>`;
  }
  else if(q.type === "order"){
    inner += `<div class="qTitle">${q.q}</div>`;
    inner += `<div class="ansLine empty" id="ansLine"></div><div class="pool" id="pool"></div>`;
    inner += `<div class="center"><button class="btn next" id="btnCheck" onclick="checkOrder()" disabled>Kiểm tra ✔</button></div>`;
  }
  else if(q.type === "read"){
    inner += `<div class="qTitle">Đọc đoạn văn rồi trả lời nha!</div>`;
    inner += `<p class="readNote">🤫 Phần này bé TỰ ĐỌC — người lớn đừng đọc giúp nha!</p>`;
    inner += `<div class="passage">${q.passage}</div>`;
    inner += `<div class="qTitle" style="font-size:18px">${q.q}</div>`;
  }
  else if(q.type === "chat"){
    inner += `<div class="qTitle">${q.q}</div><div class="chat">`;
    q.chat.forEach(([who, txt]) => {
      const face = who === "an" ? "🧢" : "🎀";
      const mystery = txt === "…?…" ? " mystery" : "";
      inner += `<div class="msg ${who}${mystery}"><div class="who">${face}</div><div class="txt">${txt === "…?…" ? "❓ ❓ ❓" : txt}</div></div>`;
    });
    inner += `</div><p class="qSub">🧢 = An &nbsp;·&nbsp; 🎀 = Bảo</p>`;
  }
  else if(q.type === "hear"){
    inner += `<div class="qTitle">${q.q || "Nghe rồi chọn đúng từ nha!"}</div>`;
    inner += `<div class="center"><button class="btn hearBtn" type="button" onclick="playHear()">🔊 Nghe lại</button></div>`;
    inner += `<p class="qSub">Bấm loa để nghe. (Máy cần có giọng Việt hoặc có mạng để đọc đúng giọng người Việt.)</p>`;
  }
  else if(q.type === "tf"){
    inner += `<div class="qTitle">Đúng hay Sai? 🤔</div>`;
    inner += `<div class="tfState">${q.q}</div>`;
  }
  else if(q.type === "emojiQ"){
    inner += `<div class="qTitle">${q.q}</div><div class="bigEmoji">${q.glyph}</div>`;
  }
  else if(q.type === "glyph"){
    inner += `<div class="qTitle">${q.q}</div><div class="bigGlyph">${q.glyph}</div>`;
  }
  else {
    inner += `<div class="qTitle">${q.q}</div>`;
  }

  // đáp án trắc nghiệm (các dạng có opts)
  if(q.opts){
    const isEmojiOpts = q.type === "emojiOpts";
    inner += `<div class="opts${q.type === "chat" ? " single" : ""}">`;
    q.opts.forEach((o, i) => {
      const cls = "opt" + (isEmojiOpts ? " emoji" : "") + (q.letterOpts ? " letter" : "");
      const key = isEmojiOpts ? "" : `<span class="key">${KEYS[i]}</span>`;
      inner += `<button class="${cls}" onclick="pick(${i}, this)">${key}<span>${o}</span></button>`;
    });
    inner += `</div>`;
  }

  inner += `<div class="feedback" id="fb"><div class="hostMini">😎</div><div class="fbBubble" id="fbText"></div></div>`;
  inner += `<div class="center"><button class="btn next hidden" id="btnNext" onclick="next()">Câu tiếp theo ➜</button></div>`;

  document.getElementById("qCard").innerHTML = inner;

  if(q.type === "order"){
    orderAns = [];
    let sh = shuffle(q.words);
    let tries = 0;
    while(sh.join(" ") === q.words.join(" ") && tries < 6){ sh = shuffle(q.words); tries++; }
    orderPool = sh;
    renderOrder();
  }
  if(q.type === "hear"){ setTimeout(() => { if(current && current.say) speakVN(current.say); }, 350); }
  document.getElementById("runner").scrollTo({top:0});
}
function playHear(){ if(current && current.say) speakVN(current.say); }

function pick(i, el){
  if(locked) return;
  const q = current;
  const opts = document.querySelectorAll(".opt");
  opts.forEach(o => o.classList.add("locked"));
  const ok = (i === q.a);
  if(ok){
    el.classList.add("correct");
    opts.forEach((o,j) => { if(j !== i) o.classList.add("dim"); });
    applyResult("full", q.opts[i], "");
    sfx.correct();
  } else {
    el.classList.add("wrong");
    opts[q.a].classList.add("correct");
    opts.forEach((o,j) => { if(j !== i && j !== q.a) o.classList.add("dim"); });
    applyResult("none", q.opts[i], "Đáp án là: " + q.opts[q.a]);
    sfx.wrong();
  }
}

function next(){
  idx++;
  if(idx < total){ render(); }
  else { showResult(); }
}

function fmtScore(s){ return Number.isInteger(s) ? s : s.toFixed(1); }

function tierOf(p){
  if(p >= 85) return "Đỉnh nóc kịch trần! 🏆";
  if(p >= 60) return "Xịn xò con bò! 😎";
  if(p >= 40) return "Sắp xịn rồi nè! 💪";
  return "Khởi động thôi! 🚀";
}

const ADVICE_CAT = {
  tuvung:  "Nạp thêm <b>từ vựng đời sống</b> qua flashcard hình ảnh và truyện tranh — mỗi ngày 5 từ là đủ.",
  hoithoai:"Luyện <b>hội thoại tình huống ngắn</b> (chào hỏi, rủ đi chơi, hỏi – đáp) ở phần Nói tự do mỗi buổi học.",
  matchu:  "Ưu tiên vào <b>Giai đoạn 2 của lộ trình: bảng chữ cái & ghép vần</b>, đi đều 2–3 chữ mỗi buổi.",
  anhviet: "Tận dụng <b>cầu nối Anh – Việt</b>: dạy từ mới luôn kèm nghĩa tiếng Anh để bé móc nối nhanh.",
  dauthanh:"Chơi trò <b>\"tai thính\" phân biệt dấu</b> (ba/bà/bá, ngựa/ngứa) 5 phút mỗi buổi trong tháng đầu.",
  noi:     "Tăng thời lượng <b>Nói tự do & đóng vai</b> — mục tiêu: bé nói liên tục 2–3 phút về một chủ đề quen.",
  viet:    "Luyện <b>ghép câu từ thẻ từ</b> (xếp – đọc to – chép lại) để quen trật tự từ tiếng Việt trước khi viết tay.",
  doc:     "Đúng trọng tâm lộ trình: <b>đọc đoạn ngắn có câu hỏi hiểu</b>, bắt đầu từ truyện tranh ít chữ, tăng dần độ dài.",
  nghe:    "Luyện <b>nghe – nhận diện từ</b>: mỗi ngày nghe 5 từ rồi nhắc lại, tăng dần lên câu ngắn để quen ngữ điệu tiếng Việt."
};

function showResult(){
  if(mode === "practice") return showPracticeResult();

  document.getElementById("bar").style.width = "100%";
  document.getElementById("qCard").classList.add("hidden");
  document.getElementById("runnerTop").classList.add("hidden");
  const p = Math.round(score / total * 100);
  const tier = tierOf(p);
  const trail = history.map(h => h.res === "full" ? "🟢" : h.res === "half" ? "🟡" : "🔴").join("");

  const catStat = {};
  history.forEach(h => {
    const c = h.q.cat;
    catStat[c] = catStat[c] || {pt:0, total:0};
    catStat[c].total++;
    catStat[c].pt += h.res === "full" ? 1 : h.res === "half" ? 0.5 : 0;
  });

  let cats = "";
  Object.keys(catStat).forEach(k => {
    const c = CATS[k], st = catStat[k];
    const pct = Math.round(st.pt/st.total*100);
    cats += `<div class="catRow"><div class="lbl"><span>${c.emoji} ${c.name}</span><span>${fmtScore(st.pt)}/${st.total}</span></div>
      <div class="catBar"><i style="width:${pct}%; background:${c.color}"></i></div></div>`;
  });

  let review = "";
  history.forEach((h, n) => {
    const c = CATS[h.q.cat];
    let label;
    if(h.q.type === "chat") label = "\"" + h.q.chat[0][1] + "\"";
    else if(h.q.type === "order") label = "Xếp câu: \"" + h.q.words.join(" ") + "\"";
    else if(h.q.type === "read") label = h.q.q + " (đoạn: " + h.q.passage.slice(0, 34) + "…)";
    else if(h.q.type === "hear") label = "Nghe từ: \"" + h.q.say + "\"";
    else if(h.q.glyph) label = h.q.q + " [" + h.q.glyph + "]";
    else label = h.q.q;

    const cls = h.res === "full" ? "ok" : h.res === "half" ? "half" : "no";
    const mark = h.res === "full" ? "✅" : h.res === "half" ? "🟡" : "❌";
    let ansLine;
    if(h.res === "full") ansLine = `Bé làm: <b class="good">${h.picked}</b>`;
    else if(h.res === "half") ansLine = `Kết quả: <b class="halfc">${h.picked}</b>`;
    else {
      const correct = h.q.type === "order" ? h.q.words.join(" ") : (h.q.opts ? h.q.opts[h.q.a] : "");
      ansLine = `Bé làm: <b class="badc">${h.picked}</b>` + (correct ? ` → Đúng: <b class="good">${correct}</b>` : "");
    }
    review += `<div class="rv ${cls}"><div class="mark">${mark}</div><div class="body">
      <div class="qq">Câu ${n+1} · ${label}</div>
      <div class="meta">${c.emoji} ${c.name} · ${"⭐".repeat(h.q.lv)}</div>
      <div class="ans">${ansLine}</div></div></div>`;
  });

  let tips = "";
  Object.keys(catStat).forEach(k => {
    const st = catStat[k];
    const lost = st.total - st.pt;
    if(lost >= Math.max(1, st.total/2)){
      tips += `<li>${CATS[k].emoji} <b>${CATS[k].name}:</b> ${ADVICE_CAT[k]}</li>`;
    }
  });
  if(!tips) tips = `<li>🎉 Không có mảng nào yếu rõ rệt — giữ nhịp học đều và tăng dần độ khó là được!</li>`;

  const lvl3 = history.filter(h => h.q.lv === 3).length;
  let placement;
  if(score >= total*0.8 && lvl3 >= Math.round(total*0.4)) placement = "Bé bám trụ tốt ở câu 3 sao — <b>vào thẳng lộ trình từ Buổi 7</b> và có thể đi nhanh 3 chữ/buổi ở phần chữ cái.";
  else if(score >= total*0.55) placement = "Nền khá ổn — với tốc độ chuẩn 2 chữ/buổi, chăm kỹ các mảng bên dưới.";
  else placement = "Nên <b>chạy 2–3 buổi đệm từ vựng (Buổi 1–6)</b> để làm ấm vốn nghe – nói trước khi vào phần chữ cái.";

  const el = document.getElementById("resultCard");
  const finalScore = Math.round(score);
  recordQuiz(finalScore, total);
  if(p >= 60) sfx.win();
  el.innerHTML = `
    <div class="hostMini" style="margin:0 auto; width:66px; height:66px; font-size:36px">😎</div>
    <h2 style="margin-top:10px">Kết quả của em nè!</h2>
    <div class="scoreRing" style="--p:${p}"><div class="inner"><span class="num">${fmtScore(score)}/${total}</span><span style="font-size:13px; color:#64748B">${p}%</span></div></div>
    <div class="tier">${tier}</div>
    <div class="trail">${trail}</div>
    <div class="trailLbl">Hành trình ${total} câu (🟢 đúng · 🟡 một phần · 🔴 sai)</div>

    <div class="secTitle">📊 Điểm theo từng mảng</div>
    <div class="cats">${cats}</div>

    <div class="secTitle">🔎 Xem lại từng câu</div>
    <div class="review">${review}</div>

    <div class="secTitle">📋 Lời khuyên cho gia sư & bố mẹ</div>
    <div class="advice"><b>Bước tiếp theo:</b> ${placement}<ul>${tips}</ul></div>
    <div class="disclaim">⚠️ Bài này chấm tự động các phần <b>nhìn – chọn – nghe – xếp câu – đọc hiểu – đúng/sai</b>. Phần 🎤 <b>Nói</b> do người lớn nghe và chấm nên mang tính tham khảo; kỹ năng <b>nghe</b> cần máy có giọng Việt hoặc có mạng, và sẽ được gia sư đánh giá kỹ hơn qua trò chuyện trong buổi gặp đầu tiên.</div>
    <div class="center">
      <button class="btn" onclick="startQuiz()">Chơi lại (bộ câu mới) 🔄</button>
      <button class="btn light" onclick="exitRunner()" style="margin-left:8px">Về trang chủ 🏠</button>
    </div>`;
  el.classList.remove("hidden");
  if(p >= 60) burst(24);
  document.getElementById("runner").scrollTo({top:0});
}

function showPracticeResult(){
  document.getElementById("bar").style.width = "100%";
  document.getElementById("qCard").classList.add("hidden");
  document.getElementById("runnerTop").classList.add("hidden");
  const correct = history.filter(h => h.res === "full").length;
  const p = total ? Math.round(correct / total * 100) : 0;
  const tier = tierOf(p);
  const catName = practiceCat === "all" ? "Tất cả chủ đề" : (CATS[practiceCat].emoji + " " + CATS[practiceCat].name);
  recordQuiz(Math.round(correct), total);
  if(p >= 60) sfx.win();

  const el = document.getElementById("resultCard");
  el.innerHTML = `
    <div class="hostMini" style="margin:0 auto; width:66px; height:66px; font-size:36px">🎉</div>
    <h2 style="margin-top:10px">Xong buổi luyện rồi!</h2>
    <p class="center muted" style="margin-top:4px">Chủ đề: <b>${catName}</b></p>
    <div class="scoreRing" style="--p:${p}"><div class="inner"><span class="num">${correct}/${total}</span><span style="font-size:13px; color:#64748B">${p}%</span></div></div>
    <div class="tier">${tier}</div>
    <div class="advice center" style="margin-top:14px">Cứ luyện đều mỗi ngày là tiến bộ nhanh lắm đó! 💪</div>
    <div class="center">
      <button class="btn" onclick="startPractice('${practiceCat}')">Luyện lại 🔄</button>
      <button class="btn light" onclick="exitRunner()" style="margin-left:8px">Về bài tập ↩️</button>
    </div>`;
  el.classList.remove("hidden");
  if(p >= 60) burst(20);
  document.getElementById("runner").scrollTo({top:0});
}

function burst(n){
  const em = ["🎉","⭐","💜","✨","🔥","🎊"];
  for(let i = 0; i < n; i++){
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = em[Math.floor(Math.random()*em.length)];
    s.style.left = Math.random()*100 + "vw";
    s.style.animationDuration = (1.6 + Math.random()*1.6) + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3500);
  }
}

/* =========================================================
   TÔ MÀU CHỮ — canvas tương tác (A, Ă, Â)
   ========================================================= */
const canvasState = {};
function initCanvas(id, letter, color){
  const canvas = document.getElementById(id);
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = 160, h = 180;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = color || "#EF4444";
  ctx.fillStyle = color || "#EF4444";

  ctx.clearRect(0, 0, w, h);
  const isUpper = letter === letter.toUpperCase();
  const font = isUpper
    ? "bold 120px 'Baloo 2', cursive"
    : "bold 130px 'Andika', 'Comic Sans MS', cursive";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#F1F5F9";
  ctx.fillText(letter, w/2, h/2 - 6);
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.strokeText(letter, w/2, h/2 - 6);
  ctx.fillStyle = "#94A3B8";
  ctx.font = "12px 'Be Vietnam Pro', sans-serif";
  ctx.fillText("Tô vào đây nhé!", w/2, h - 16);

  let drawing = false;
  let lastX = 0, lastY = 0;

  function getPos(e){
    const r = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - r.left, y: touch.clientY - r.top };
  }
  function startDraw(e){
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    lastX = p.x; lastY = p.y;
  }
  function draw(e){
    if(!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 10;
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  }
  function stopDraw(){ drawing = false; }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);
  canvas.addEventListener("touchstart", startDraw, {passive:false});
  canvas.addEventListener("touchmove", draw, {passive:false});
  canvas.addEventListener("touchend", stopDraw);

  canvasState[id] = { ctx, w, h };
}
function clearCanvas(id){
  const canvas = document.getElementById(id);
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const map = {canvasA:"A",canvasAl:"a",canvasA2:"Ă",canvasA2l:"ă",canvasA3:"Â",canvasA3l:"â"};
  const letter = map[id] || "A";
  const w = canvasState[id]?.w || 160, h = canvasState[id]?.h || 180;
  ctx.clearRect(0, 0, w, h);
  const isUpper = letter === letter.toUpperCase();
  ctx.font = isUpper ? "bold 120px 'Baloo 2', cursive" : "bold 130px 'Andika', 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#F1F5F9";
  ctx.fillText(letter, w/2, h/2 - 6);
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.strokeText(letter, w/2, h/2 - 6);
  ctx.fillStyle = "#94A3B8";
  ctx.font = "12px 'Be Vietnam Pro', sans-serif";
  ctx.fillText("Tô vào đây nhé!", w/2, h - 16);
}
function clearAllLetterCanvas(){
  ["canvasA","canvasAl","canvasA2","canvasA2l","canvasA3","canvasA3l"].forEach(clearCanvas);
}
let currentColor = "#EF4444";
function initColorPickers(){
  document.querySelectorAll(".colorDotsRow .colorDot").forEach(dot => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".colorDotsRow .colorDot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
      currentColor = dot.dataset.color;
    });
  });
}

/* ===================== TRÒ CHƠI BÀI 1: A – Ă – Â ===================== */
/* Phát âm tiếng Việt: tự chọn giọng tự nhiên nhất có trên máy (neural/natural/online) */
let _viVoices = null;
function refreshVoices(){
  try{
    const all = window.speechSynthesis.getVoices() || [];
    _viVoices = all.filter(v => /^vi/i.test(v.lang) || /viet/i.test(v.name));
  }catch(e){ _viVoices = []; }
}
if('speechSynthesis' in window){
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}
function pickVNVoice(){
  if(!_viVoices || !_viVoices.length) return null;
  const pref = _viVoices.find(v => /neural|natural|online|studio|wavenet|neural2/i.test(v.name));
  return pref || _viVoices[0];
}
/* Ưu tiên phát file ghi âm thật của người Việt (audio/...), thiếu file thì fallback Web Speech */
const SPEECH_AUDIO = {
  'a':'audio/a.mp3', 'ă':'audio/aw.mp3', 'â':'audio/aa.mp3'
};
function hasVNVoice(){
  return _viVoices && _viVoices.length > 0;
}
function synthFallback(txt){
  try{
    if(!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(txt);
    const v = pickVNVoice();
    if(v){ u.voice = v; u.lang = v.lang; }
    else { u.lang = 'vi-VN'; }
    u.rate = 0.85; u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){}
}

/* ===== TTS tiếng Việt ONLINE (dùng khi máy không có sẵn giọng Việt) =====
   Gọi Google Translate TTS để đọc đúng giọng người Việt trên mọi thiết bị.
   Google giới hạn ~200 ký tự/lần nên cắt câu dài thành từng đoạn ngắn. */
let _ttsAudio = null;
function splitForTTS(txt, max){
  const words = (txt || '').trim().split(/\s+/);
  const out = []; let cur = '';
  for(const w of words){
    if(cur && (cur + ' ' + w).length > max){ out.push(cur); cur = w; }
    else { cur = cur ? cur + ' ' + w : w; }
  }
  if(cur) out.push(cur);
  return out.length ? out : [txt];
}
function googleTTS(txt, onFail){
  try{
    const chunks = splitForTTS(txt, 190);
    let i = 0, failed = false;
    const fail = () => { if(failed) return; failed = true; if(onFail) onFail(); };
    const playNext = () => {
      if(failed || i >= chunks.length) return;
      const q = chunks[i++];
      const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=' + encodeURIComponent(q);
      const a = new Audio(url);
      _ttsAudio = a;
      a.onended = playNext;
      a.onerror = fail;
      const p = a.play();
      if(p && p.catch) p.catch(fail);
    };
    playNext();
  }catch(e){ if(onFail) onFail(); }
}

/* Quyết định cách đọc: ưu tiên giọng Việt cài sẵn (offline, tốt) →
   không có thì dùng TTS Việt online → online lỗi mới rơi về giọng máy. */
function speakVNAuto(txt){
  if(hasVNVoice()){ synthFallback(txt); return; }
  googleTTS(txt, () => synthFallback(txt));
}

function speakVN(txt){
  const key = (txt || '').trim();
  if(!key) return;
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
  try{ if(_ttsAudio){ _ttsAudio.pause(); _ttsAudio = null; } }catch(e){}
  const url = SPEECH_AUDIO[key.toLowerCase()];
  if(url){
    let fell = false;
    const fail = () => { if(fell) return; fell = true; speakVNAuto(key); };
    const a = new Audio(url);
    a.onerror = fail;
    const p = a.play();
    if(p && p.catch) p.catch(fail);
    return;
  }
  speakVNAuto(key);
}
function speakWord(el){
  const w = el.querySelector('.vi') ? el.querySelector('.vi').textContent : el.textContent;
  if(w) speakVN(w);
}

/* 1. Tai thính */
let listenState = { target:null, score:0, round:0, total:10, busy:false };
function teacherRead(){
  if(listenState.round >= listenState.total) return;
  listenState.busy = true;
  const opts = ['A','Ă','Â'];
  listenState.target = opts[Math.floor(Math.random()*opts.length)];
  const fb = document.getElementById('listenFeedback');
  fb.textContent = '🎧 Gia sư vừa đọc… bé bấm nhé!';
  fb.className = 'listenFeedback';
  speakVN(listenState.target === 'A' ? 'a' : listenState.target === 'Ă' ? 'ă' : 'â');
}
function listenAnswer(g){
  if(!listenState.busy || listenState.target == null) return;
  listenState.busy = false;
  listenState.round++;
  const fb = document.getElementById('listenFeedback');
  if(g === listenState.target){
    listenState.score++;
    fb.textContent = '✅ Đúng rồi!';
    fb.className = 'listenFeedback ok';
  } else {
    fb.textContent = '❌ Nghe lại nhé — thầy đọc ' + listenState.target;
    fb.className = 'listenFeedback no';
  }
  document.getElementById('listenScore').innerHTML = 'Điểm: <b>'+listenState.score+'</b> / <b>'+listenState.total+'</b>';
  if(listenState.round >= listenState.total){
    const tt = listenState.score >= 8 ? '🏆 Giỏi quá!' : 'Cố lên, luyện thêm nhé!';
    fb.textContent = tt + ' (' + listenState.score + '/' + listenState.total + ')';
    listenState.target = null;
    return;
  }
  setTimeout(teacherRead, 700);
}
function revealListen(){
  const fb = document.getElementById('listenFeedback');
  fb.textContent = '🤫 Đáp án: ' + (listenState.target || '— (bấm Gia sư đọc trước)');
  fb.className = 'listenFeedback';
}

/* 2. Máy ghép âm */
function blendSound(){
  const i = document.getElementById('blendInit').value;
  const v = document.getElementById('blendVowel').value;
  const word = i + v;
  const box = document.getElementById('blendResult');
  box.textContent = word;
  box.style.animation = 'none'; void box.offsetWidth; box.style.animation = 'popIn .35s ease';
  speakVN(word);
}

/* 3. Phân loại 3 nhà */
let selectedSort = null;
function sortWord(btn, correct){
  if(btn.classList.contains('done')) return;
  document.querySelectorAll('.wordChip').forEach(c => c.classList.remove('sel'));
  btn.classList.add('sel');
  selectedSort = { el: btn, correct: correct };
}
function dropInto(col){
  if(!selectedSort) return;
  const { el, correct } = selectedSort;
  const drop = document.querySelector('.sortDrop[data-col="'+col+'"]');
  const colEl = drop.closest('.sortCol');
  if(col === correct){
    colEl.classList.add('flash');
    setTimeout(()=>colEl.classList.remove('flash'), 400);
    const mini = document.createElement('div');
    mini.className = 'miniChip ok';
    mini.textContent = el.textContent;
    drop.appendChild(mini);
    el.classList.add('done');
    el.classList.remove('sel');
    selectedSort = null;
    checkSortDone();
  } else {
    colEl.classList.add('bad');
    el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
    setTimeout(()=>colEl.classList.remove('bad'), 400);
    el.classList.remove('sel');
    selectedSort = null;
  }
}
function checkSortDone(){
  const total = document.querySelectorAll('.wordChip').length;
  const done = document.querySelectorAll('.wordChip.done').length;
  if(done === total){
    const old = document.getElementById('sortDoneMsg');
    if(old) old.remove();
    const fb = document.createElement('div');
    fb.id = 'sortDoneMsg';
    fb.style.cssText = 'text-align:center;font-weight:800;color:var(--ok);margin-top:8px;width:100%';
    fb.textContent = '🎉 Xếp xong 3 nhà rồi!';
    document.getElementById('sortGame').appendChild(fb);
  }
}
function resetSort(){
  selectedSort = null;
  const game = document.getElementById('sortGame');
  if(!game) return;
  game.querySelectorAll('.sortDrop').forEach(d => d.innerHTML = '');
  game.querySelectorAll('.wordChip').forEach(c => c.classList.remove('done','sel'));
  const old = document.getElementById('sortDoneMsg');
  if(old) old.remove();
}

/* 4. Thám tử săn chữ */
const A_FAMILY = ['a','à','á','ả','ã','ạ','ă','ằ','ắ','ẳ','ẵ','ặ','â','ầ','ấ','ẩ','ẫ','ậ'];
const DET_SENTENCES = [
  'Bà cho Bíp ăn cá. Bíp bận lắm.',
  'An mở cửa nhà đất.',
  'Em cầm bút tân.',
  'Mẹ mát tay bế cá.',
  'Cha cắt bánh mát.',
  'Cô bán cá tươi.'
];
let detState = { total:0, found:0 };
function newDetective(){
  const s = DET_SENTENCES[Math.floor(Math.random()*DET_SENTENCES.length)];
  const wrap = document.getElementById('detectiveSentence');
  if(!wrap) return;
  wrap.innerHTML = '';
  detState.total = 0; detState.found = 0;
  [...s].forEach(ch => {
    if(A_FAMILY.includes(ch)){
      const span = document.createElement('span');
      span.className = 'ltr';
      span.textContent = ch;
      span.onclick = () => {
        if(span.classList.contains('found')) return;
        span.classList.add('found');
        detState.found++;
        updateDetScore();
      };
      wrap.appendChild(span);
      detState.total++;
    } else if(ch === ' '){
      const sp = document.createElement('span');
      sp.className = 'ltr space';
      sp.textContent = ' ';
      wrap.appendChild(sp);
    } else {
      wrap.appendChild(document.createTextNode(ch));
    }
  });
  updateDetScore();
}
function updateDetScore(){
  const el = document.getElementById('detectiveScore');
  if(!el) return;
  el.innerHTML = 'Đã bắt: <b>'+detState.found+'</b> / <b>'+detState.total+'</b>' +
    (detState.total && detState.found === detState.total ? ' 🎉' : '');
}

/* 5. Chọn từ đúng theo hình */
const CW_PAIRS = [
  {emoji:'👁️', correct:'mắt', opts:['mat','mắt','mât']},
  {emoji:'👃', correct:'mũi', opts:['mui','mũi','muti']},
  {emoji:'👂', correct:'tai', opts:['tai','tay','tây']},
  {emoji:'🐟', correct:'cá', opts:['cá','ca','cà']},
  {emoji:'👵', correct:'bà', opts:['ba','bà','bâ']},
  {emoji:'🌍', correct:'đất', opts:['dat','đất','đat']}
];
function newChooseWord(){
  const img = document.getElementById('cwImage');
  const choices = document.getElementById('cwChoices');
  if(!img || !choices) return;
  const p = CW_PAIRS[Math.floor(Math.random()*CW_PAIRS.length)];
  img.textContent = p.emoji;
  choices.innerHTML = '';
  const shuffled = shuffle(p.opts.slice());
  shuffled.forEach(o => {
    const b = document.createElement('button');
    b.className = 'btn small';
    b.textContent = o;
    b.onclick = () => {
      if(o === p.correct){
        b.style.background = 'linear-gradient(135deg,var(--ok),#22C55E)';
        b.style.color = '#fff';
        const msg = document.createElement('div');
        msg.style.cssText = 'text-align:center;font-weight:800;color:var(--ok);width:100%;margin-top:8px';
        msg.textContent = '✅ Đúng: ' + p.correct;
        choices.appendChild(msg);
        setTimeout(newChooseWord, 1100);
      } else {
        b.style.background = '#FEE2E2';
        b.style.color = '#B91C1C';
        b.disabled = true;
      }
    };
    choices.appendChild(b);
  });
}

/* 6. Flash tốc độ */
let flashState = { idx:0, total:10, score:0, current:null, running:false };
function startFlashSpeed(){
  flashState = { idx:0, total:10, score:0, current:null, running:true };
  const card = document.getElementById('fsCard');
  const choices = document.getElementById('fsChoices');
  const sc = document.getElementById('fsScore');
  if(!card || !choices || !sc) return;
  sc.innerHTML = 'Điểm: <b>0</b> / <b>10</b>';
  choices.innerHTML = '';
  nextFlash();
}
function nextFlash(){
  if(flashState.idx >= flashState.total){
    const card = document.getElementById('fsCard');
    card.textContent = '🏁';
    card.classList.remove('hidden');
    const sc = document.getElementById('fsScore');
    sc.innerHTML = (flashState.score >= 8 ? '🏆 ' : '') + 'Kết quả: <b>'+flashState.score+'</b> / <b>10</b>';
    flashState.running = false;
    return;
  }
  const opts = ['A','Ă','Â'];
  const cur = opts[Math.floor(Math.random()*opts.length)];
  flashState.current = cur;
  const card = document.getElementById('fsCard');
  card.textContent = cur;
  card.classList.remove('hidden');
  const choices = document.getElementById('fsChoices');
  choices.innerHTML = '';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'btn small';
    b.textContent = o;
    b.onclick = () => flashAnswer(o, b);
    choices.appendChild(b);
  });
  setTimeout(() => {
    if(!flashState.running) return;
    card.classList.add('hidden');
  }, 1000);
}
function flashAnswer(o, btn){
  if(!flashState.running) return;
  flashState.idx++;
  if(o === flashState.current){
    flashState.score++;
    btn.style.background = 'linear-gradient(135deg,var(--ok),#22C55E)';
    btn.style.color = '#fff';
  } else {
    btn.style.background = '#FEE2E2';
    btn.style.color = '#B91C1C';
  }
  document.getElementById('fsScore').innerHTML = 'Điểm: <b>'+flashState.score+'</b> / <b>'+flashState.total+'</b>';
  speakVN(o === 'A' ? 'a' : o === 'Ă' ? 'ă' : 'â');
  setTimeout(nextFlash, 600);
}

/* Khởi tạo trò chơi khi mở Bài 1 */
function initLesson1Games(){
  listenState = { target:null, score:0, round:0, total:10, busy:false };
  const ls = document.getElementById('listenScore'); if(ls) ls.innerHTML = 'Điểm: <b>0</b> / <b>10</b>';
  const lf = document.getElementById('listenFeedback'); if(lf) lf.textContent = '';
  const br = document.getElementById('blendResult'); if(br) br.textContent = '';
  flashState = { idx:0, total:10, score:0, current:null, running:false };
  const fc = document.getElementById('fsCard'); if(fc){ fc.textContent=''; fc.classList.remove('hidden'); }
  const fch = document.getElementById('fsChoices'); if(fch) fch.innerHTML = '';
  const fsc = document.getElementById('fsScore'); if(fsc) fsc.innerHTML = 'Điểm: <b>0</b> / <b>10</b>';
  resetSort();
  newDetective();
  newChooseWord();
  const lg = document.getElementById('listenGame');
  if(lg && !hasVNVoice()){
    let note = lg.querySelector('.voiceNote');
    if(!note){
      note = document.createElement('div');
      note.className = 'voiceNote';
      note.style.cssText = 'font-size:12.5px;color:#B45309;background:#FEF3C7;border:1px dashed #F59E0B;border-radius:10px;padding:6px 10px;margin-bottom:8px';
      lg.insertBefore(note, lg.firstChild);
    }
    note.textContent = '⚠️ Máy chưa cài giọng tiếng Việt nên đang dùng giọng khác (nghe sai). Cách khắc phục: (1) thả file ghi âm người Việt vào thư mục audio/ (a.mp3, aw.mp3, aa.mp3…), hoặc (2) cài giọng Việt trong cài đặt hệ điều hành / dùng Chrome trên Android.';
  }
  document.querySelectorAll('.letterExample').forEach(el => {
    if(el.dataset.spk) return;
    el.dataset.spk = '1';
    el.style.cursor = 'pointer';
    el.title = 'Bấm để nghe phát âm 🔊';
    el.addEventListener('click', () => speakWord(el));
  });
}

/* Lấy phần chữ tiếng Việt "sạch" (bỏ nghĩa tiếng Anh trong ngoặc / thẻ .ew .en / emoji) để đọc */
function lessonSpeakText(el){
  let node = el;
  if(el.querySelector && el.querySelector('.vi')) node = el.querySelector('.vi');
  else if(el.querySelector && el.querySelector('.vw')) node = el.querySelector('.vw');
  const clone = node.cloneNode(true);
  if(clone.querySelectorAll) clone.querySelectorAll('.ew,.en,small').forEach(n => n.remove());
  let t = clone.textContent || '';
  t = t.replace(/\(.*?\)/g, '');                          // bỏ (dad), (fish)...
  t = t.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');   // bỏ emoji ngoài BMP
  t = t.replace(/[←-⇿⌀-➿⬀-⯿☀-⛿️]/g, ''); // bỏ ký hiệu/emoji BMP
  return t.trim();
}
/* Gắn "bấm để nghe" cho từ vựng & ví dụ trong MỌI bài học */
function wireLessonSpeak(){
  document.querySelectorAll('#lessonBody .letterExample, #lessonBody .vocabItem, #lessonBody .exampleWord').forEach(el => {
    if(el.dataset.spk) return;
    el.dataset.spk = '1';
    el.style.cursor = 'pointer';
    el.title = 'Bấm để nghe phát âm 🔊';
    el.addEventListener('click', () => { const t = lessonSpeakText(el); if(t) speakVN(t); });
  });
}

/* Khởi động canvas khi modal mở */
const origOpenLesson = openLesson;
openLesson = function(i){
  origOpenLesson(i);
  setTimeout(() => {
    wireLessonSpeak();
    initLessonGames(LESSON_GAMES[i]);
    initColorPickers();
    if(i === 0) initLesson1Games();
    document.fonts.ready.then(() => {
      if(i === 0){
        initCanvas("canvasA", "A", "#EF4444");
        initCanvas("canvasAl", "a", "#EF4444");
        initCanvas("canvasA2", "Ă", "#EC4899");
        initCanvas("canvasA2l", "ă", "#EC4899");
        initCanvas("canvasA3", "Â", "#06B6D4");
        initCanvas("canvasA3l", "â", "#06B6D4");
      }
    });
  }, 200);
};
document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderLessons();
  renderTopicChips();
  renderContact();
  renderFlashcard();
  go((location.hash || "#home").slice(1));
  // Chắc chắn về đầu trang khi load/F5 (kể cả khi trình duyệt cố nhảy tới #hash)
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
});
