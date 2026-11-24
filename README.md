# NAT IELTS Writing Studio · Task 1 + Task 2

Website giảng dạy tương tác HTML/CSS/JS thuần, dành cho giáo viên NAT IELTS.

Có thể mở trực tiếp **PDF giáo án Task 1 / Task 2** từ nút trên trang chủ khi dùng bản ZIP đã giải nén hoặc website GitHub Pages.

Có thể mở trực tiếp **PDF giáo án Task 1 / Task 2** từ nút trên trang chủ khi dùng bản ZIP đã giải nén hoặc website GitHub Pages.

**V2 – bổ sung Writing Task 2:** 5 buổi/70 màn, 7 bài mẫu nguyên bản trên 250 từ, bài tập và lời thoại giáo viên. Phần Task 1 cũ (6 buổi/73 màn) được giữ lại. Tổng cộng **11 buổi / 143 màn**.

## Cách mở

Mở `index.html` bằng trình duyệt Safari/Chrome, chọn tab **Task 1** hoặc **Task 2**. Không cần Internet, API key, build server hay npm.

Khi giảng: mũi tên trái/phải để chuyển slide; `P` mở lời thoại, `A` bật bút, `T` mở đồng hồ, `F` toàn màn hình, `G` mục lục. Bài nháp lưu trong localStorage của trình duyệt; không gửi lên máy chủ.

## Tải lên GitHub Pages

Giữ `index.html`, `app.js`, `lessons.js`, `lessons2.js`, `styles.css`, `assets/` cùng cấp trong **root**. Trong VS Code, thay các tệp của repo cũ bằng bản này, commit, **Sync Changes**; GitHub Pages `main / (root)` sẽ triển khai lại. Nếu đang dùng thư mục website cũ, hãy **chép đè toàn bộ** nội dung của ZIP để không xóa những file Task 1 hiện có. Có thể loại thư mục `source/` trước khi upload nếu không muốn xuất bản PDF gốc; nút “Tài liệu gốc” khi đó sẽ không mở được.

## Lưu ý chuyên môn

Bố cục 2–5–5–1, quy tắc ví dụ trong đoạn, đồng ý một phần và thứ tự Body trong tài liệu được diễn giải là **chiến lược giảng dạy**, không phải tiêu chí thi bắt buộc. Bài mẫu là ví dụ mới được biên soạn và chỉ hướng tới Band 8+; **không phải bài đã được giám khảo IELTS chấm**.

Nguồn đối chiếu: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing , https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf
# NAT IELTS Writing Task 1 — Teaching Studio

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
