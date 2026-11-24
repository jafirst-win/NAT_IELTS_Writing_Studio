# NAT IELTS Writing Task 1 — Teaching Studio

Website giáo án trình chiếu hoàn chỉnh bằng **HTML + CSS + JavaScript thuần**, không cần cài Node.js, tài khoản hay server.

## Cách mở

1. Giải nén `NAT_IELTS_Writing_Studio_Web.zip`.
2. Mở `index.html` bằng Chrome, Edge, Safari hoặc Firefox.
3. Chọn 1 trong 6 buổi học và bấm **Vào bài**.
4. Nhấn `F` để mở toàn màn hình nếu trình duyệt hỗ trợ.

**Không di chuyển riêng file `index.html` khỏi các thư mục** `assets/`, `source/` và các file `styles.css`, `lessons.js`, `app.js`.

## Sáu buổi

| Buổi | Chủ đề | Số màn | Thời lượng theo kịch bản |
|---|---|---:|---:|
| 01 | Introduction, Overview & Expressions | 12 | 81 phút |
| 02 | Line Graph & Bar Chart | 14 | 105 phút |
| 03 | Pie Chart | 11 | 77 phút |
| 04 | Table & Mixed Chart | 12 | 86 phút |
| 05 | Process | 12 | 93 phút |
| 06 | Map | 12 | 89 phút |

Tổng cộng **73 màn · 531 phút**. Thời lượng là đề xuất, có thể thay đổi tùy trình độ lớp.

## Thao tác

- `←` / `→` / `Space`: chuyển slide
- `P`: xem lời thoại giáo viên và ghi chú hiệu đính chuyên môn
- `A`: bật/tắt bút đỏ trên slide
- `C`: xóa chú thích slide hiện tại
- `T`: đồng hồ đếm ngược
- `G`: mục lục và chuyển buổi
- `F`: toàn màn hình
- `Esc`: đóng cửa sổ nổi

## Hoạt động tương tác

- Trắc nghiệm 3 lựa chọn với giải thích sau khi kiểm tra.
- Ô viết bài tự lưu tại `localStorage` trên máy người dùng; mở gợi ý/đáp án đúng thời điểm.
- Sắp xếp lại các bước của một quy trình và kiểm tra.
- Bảng có thể chọn hàng để theo dõi số liệu.
- Hình minh họa có thể phóng to, gạch/chú thích ngay trên màn chiếu.
- Đồng hồ 1/2/3/5/10 phút cho các hoạt động lớp.

## Bảo mật và giới hạn

- Hoạt động cục bộ. Không dùng API, CDN, cookie hay tài khoản.
- Nội dung nhập trong ô viết chỉ lưu **trên trình duyệt đang sử dụng**, không đồng bộ giữa thiết bị.
- Website không chấm tự động câu trả lời tự luận và không tự gán band IELTS.
- PDF gốc nằm trong thư mục `source` để giảng viên đối chiếu.
- Các nội dung hiệu đính do người biên soạn bổ sung được ghi rõ trong phần **Lời giảng > Lưu ý chuyên môn**.

## Cấu trúc

- `index.html`: điểm vào ứng dụng
- `styles.css`: giao diện và hiệu ứng
- `app.js`: tương tác, điều khiển, lưu bài nháp, timer, annotation
- `lessons.js`: kịch bản 73 slide của 6 buổi
- `assets/figures/`: logo và các biểu đồ/hình trong tài liệu gốc
- `source/`: bản PDF gốc do người dùng cung cấp
