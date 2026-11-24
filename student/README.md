# NAT IELTS Student Writing Hub - GitHub Pages (100% static)

Website hoc sinh light theme: 11 PDF, 14 de luyen, luu nhap, bam gio, dem tu, phan tich IELTS Writing Task 1/Task 2 theo tung cau va tung tu, tao bai mau AI.

- Chi co HTML, CSS, JavaScript va tai lieu PDF/hinh. Khong co Vercel, Worker, backend, API server rieng.
- File `config.js` chua key do chu website yeu cau; **key se cong khai khi push len GitHub Pages**. Nguoi truy cap co the doc, sao chep va dung han muc/chi phi API. Hoan toan khong the che giau key bang JavaScript.
- Model: `gemini-3-flash-preview`. Trinh duyet goi truc tiep toi Google `generateContent` REST API (neu `provider: google`).
- Chu y: API key co dang `sk-` thong thuong khong phai khoa Google AI Studio. Neu key do nha cung cap trung gian cap, chu website phai biet endpoint va sua `config.js` thanh `provider: 'gemini-gateway'` hoac `'openai-compatible'`, khai bao `apiUrl` HTTPS. Khong the tu suy ra endpoint tu ma key.
- Hoat dong that su cua AI chua duoc xac thuc bang API key duoc cung cap. Xem KET NOI AI -> Kiem tra. Khong goi thanh cong thi doc PDF, viet bai, luu nhap va xem demo van hoat dong.
- Ban phan tich va so diem chi la uoc luong hoc tap; khong phai IELTS examiner chinh thuc.

## Cai vao repository GitHub Pages da co

Giai nen ZIP va chep nguyen `student/` vao `~/Downloads/NAT_IELTS_Writing_Studio/`. Khong thay `index.html` o thu muc goc.

```bash
cd ~/Downloads/NAT_IELTS_Writing_Studio
git add student/
git commit -m "feat: student hub direct Gemini browser mode"
git pull --rebase origin main
git push origin main
```

Truy cap `https://jafirst-win.github.io/NAT_IELTS_Writing_Studio/student/`.

## Luu y an toan va chi phi

Key ban da chia se qua chat nen thu hoi (revoke) va thay bang key moi. Neu van muon de key cong khai, nen dat gioi han quota/canh bao chi phi va rang buoc HTTP referrer neu dich vu ho tro. Ràng buộc theo referrer không bảo đảm chống mọi hình thức lạm dụng. Không lưu bài viết có thông tin nhạy cảm của học sinh.
