# Hướng dẫn kích hoạt Email Verification

## 📧 Tính năng đã hoàn thành

✅ Form đăng ký yêu cầu email hợp lệ (@gmail.com, @stu.upt.edu.vn, etc.)  
✅ Gửi mã xác minh 6 số qua email thật  
✅ Modal nhập mã với nút "Gửi lại" có countdown  
✅ API endpoint với Nodemailer + Gmail SMTP  

## 🚀 Cách kích hoạt (3 phút)

### Bước 1: Setup Gmail App Password

1. Vào: https://myaccount.google.com/apppasswords
2. Đăng nhập Gmail của bạn
3. Chọn app: "Mail", device: "Windows Computer"
4. Click **Generate** → Copy mã 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)

### Bước 2: Cài đặt API

```powershell
# Vào thư mục api
cd api

# Cài dependencies
npm install

# Tạo file .env từ template
copy .env.example .env

# Mở file .env và điền thông tin
notepad .env
```

Trong file `.env`, điền:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
API_PORT=3001
NODE_ENV=development
```

### Bước 3: Chạy API Server

```powershell
npm run dev
```

Bạn sẽ thấy:
```
✅ API server running at http://localhost:3001
📧 Email: your-email@gmail.com
```

### Bước 4: Test ngay

Giữ API server chạy, mở terminal mới và chạy app:

```powershell
cd ..
npx expo start
```

Trong app:
1. Điền email hợp lệ (ví dụ: `test@gmail.com`)
2. Nhấn **"Gửi mã xác minh"**
3. Kiểm tra email → Copy mã 6 số
4. Nhập mã và nhấn **"Xác nhận"**
5. Điền form còn lại và **"Tạo tài khoản"**

## 🌐 Deploy lên Internet (Optional)

Nếu muốn API chạy 24/7 miễn phí, deploy lên **Vercel**:

```powershell
# Cài Vercel CLI
npm i -g vercel

# Deploy
cd api
vercel

# Thêm secrets
vercel env add EMAIL_USER
# Nhập: your-email@gmail.com

vercel env add EMAIL_PASSWORD  
# Nhập: your-app-password

# Deploy production
vercel --prod
```

Vercel sẽ cho URL như: `https://medicine-api-xyz.vercel.app`

Cập nhật trong `constants/config.ts`:
```typescript
BASE_URL: __DEV__ 
  ? 'http://localhost:3001'
  : 'https://medicine-api-xyz.vercel.app',
```

## 📝 Files đã tạo

```
api/
├── send-verification.js  # API endpoint gửi email
├── server-local.js       # Server local cho dev
├── package.json          # Dependencies
├── .env.example          # Template config
├── .env                  # Config thật (tạo từ .env.example)
└── README.md             # Hướng dẫn chi tiết

constants/
└── config.ts             # Thêm API_CONFIG

app/
└── register.tsx          # Cập nhật: gọi API, modal nhập mã
```

## 🐛 Troubleshooting

**Lỗi: "Invalid login"**
→ Kiểm tra EMAIL_PASSWORD phải là **App Password** (16 ký tự), không phải mật khẩu Gmail thường

**Lỗi: "Network request failed"**
→ Đảm bảo API server đang chạy: `cd api && npm run dev`

**Email không nhận được:**
→ Kiểm tra thư mục **Spam/Junk**  
→ Đợi 30-60 giây  
→ Thử "Gửi lại"

**Web/iOS/Android không kết nối được localhost:**
→ Deploy lên Vercel hoặc dùng IP máy:
```typescript
BASE_URL: __DEV__
  ? 'http://192.168.1.x:3001'  // Thay bằng IP máy bạn
  : '...'
```

## 💡 Lưu ý

- **Gmail giới hạn:** ~500 email/ngày (miễn phí)
- **Bảo mật:** File `.env` đã được add vào `.gitignore` (không đẩy lên Git)
- **Production:** Nếu cần gửi nhiều email, dùng SendGrid/Resend (miễn phí 100-3000 email/ngày)

## ✅ Done!

Bây giờ khi người dùng đăng ký:
1. Nhập email hợp lệ (@gmail.com, @yahoo.com, @stu.upt.edu.vn...)
2. Nhấn "Gửi mã xác minh" → Email gửi thật đến hộp thư
3. Nhập mã 6 số → Xác minh → Tạo tài khoản

Happy coding! 🎉
