/* =========================================================
   v15: NỘI DUNG TRÒ CHƠI NHỎ – mỗi task một câu đố hợp với việc của task đó
   Muốn thêm câu đố: thêm một mục vào đúng loại (bug, order, type, match) với số task tương ứng.
   Mã viết ngắn, tên biến tiếng Việt không dấu cho dễ đọc với người mới.
   ========================================================= */
// Task → trò chơi
const MG_FOR_TASK = { 101:'order', 102:'bug', 103:'match', 104:'bug', 105:'order', 106:'bug', 107:'match', 108:'match', 109:'bug', 110:'type', 111:'order', 112:'bug' };

const MG_DATA = {
  /* 🐞 Bắt bug: lines là các dòng code, bad là vị trí các dòng sai (đếm từ 0), hint là gợi ý khi “làm kỹ” */
  bug: {
    102: { lines:['function laEmail(s) {', '  if (s.length > 0) return true;', '  const at = s.indexOf("@");', '  const cham = s.lastIndexOf(".");', '  return at > 0 && cham > at + 1;', '}'],
           bad:[1], hint:'Có một dòng cho qua mọi chuỗi không rỗng.' },
    104: { lines:['const gio = donHang.thoiGian;', 'const ngay = new Date(gio);', 'ngay.setHours(ngay.getHours() - 7);', 'const vn = ngay.toLocaleString("vi-VN",', '  { timeZone: "Asia/Bangkok" });', 'inRa(vn);'],
           bad:[2], hint:'Đã đổi múi giờ rồi thì đừng tự cộng trừ giờ nữa.' },
    106: { lines:['{', '  "nut_mua": "Mua ngay",', '  "nut_tra": "Thánh toán",', '  "gio_hang": "Giỏ hàng",', '  "dang_xuat": "Đăng xuât",', '  "tim_kiem": "Tìm kiếm"', '}'],
           bad:[2, 4], hint:'Đọc chậm từng chữ, nhìn kỹ dấu.' },
    109: { lines:['const anh = "C:/Users/Minh/Desktop/logo.png";', 'const khoa = process.env.KHOA_API;', 'if (!khoa) dungLai("Thiếu khóa API");', 'const cauHinh = docFile("./cau-hinh.json");', 'taiAnh(anh);', 'chay(cauHinh);'],
           bad:[0], hint:'Dòng nào chỉ đúng trên máy của bạn?' },
    112: { lines:['function dangXuat() {', '  xoaPhien();', '  luuPhien(nguoiDung);', '  xoaBoNhoTam();', '  chuyenTrang("/dang-nhap");', '}'],
           bad:[2], hint:'Vừa xóa phiên xong lại…' },
  },
  /* 🧩 Xếp code: lines theo ĐÚNG thứ tự; trò chơi sẽ xáo trộn */
  order: {
    101: { lines:['Mở trang Đăng ký', 'Bật công cụ kiểm tra (F12)', 'Chọn nút “Đăng ký”', 'Thấy dòng margin-left: 3px', 'Xóa dòng margin-left', 'Tải lại trang, kiểm tra lại'] },
    105: { lines:['const ds = await layDanhSachSanPham();', 'const anhNho = ds.map(taoAnhThuNho);', 'hienThi(ds, anhNho);', 'taiAnhLonKhiCuonToi(ds);', 'ghiLaiThoiGianTai();'] },
    111: { lines:['git checkout -b doi-mau-nut', 'Sửa màu #2F6FD1 → #1E5BC6', 'git add nut.css', 'git commit -m "Nút xanh hơn"', 'git push', 'Gửi chị thiết kế xem lại'] },
  },
  /* ⌨️ Gõ lệnh: cmds gõ lần lượt, đúng từng ký tự */
  type: {
    110: { cmds:['npm outdated', 'npm update', 'npm test', 'git commit -am "nang cap"'] },
  },
  /* 🔌 Nối dây API: mỗi cặp [bên trái, bên phải] */
  match: {
    103: { pairs:[['API', 'Cổng để hai phần mềm nói chuyện'], ['Bug', 'Lỗi trong chương trình'], ['Deploy', 'Đưa bản mới đến người dùng'], ['Commit', 'Lưu một lần thay đổi code'], ['Test', 'Kiểm tra code chạy đúng']] },
    107: { pairs:[['layNhietDo()', '26°C'], ['troiMua()', 'true'], ['goiY(15°C)', 'Trà sữa nóng'], ['goiY(33°C)', 'Trà đá chanh'], ['doAm()', '78%']] },
    108: { pairs:[['phiShip(0 km)', '0đ'], ['phiShip(3 km)', '15.000đ'], ['phiShip(10 km)', '30.000đ'], ['phiShip(−2 km)', 'Báo lỗi'], ['phiShip(3 km, freeship)', '0đ (miễn phí)']] },
  },
};
