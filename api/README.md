# Email Verification API

API đơn giản để gửi mã xác minh qua email.

## 🚀 Cài đặt nhanh

### 1. Cài đặt dependencies

```bash
cd api
npm install
```

### 2. Cấu hình Gmail

**Bước 1:** Tạo App Password cho Gmail
1. Truy cập: https://myaccount.google.com/apppasswords
2. Đăng nhập Gmail của bạn
3. Chọn "Mail" và "Windows Computer" (hoặc tùy chọn)
4. Nhấn "Generate" → Gmail sẽ tạo mã 16 ký tự
5. Copy mã này (dạng: `xxxx xxxx xxxx xxxx`)

**Bước 2:** Tạo file `.env`
```bash
cp .env.example .env
```

**Bước 3:** Sửa file `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
API_PORT=3001
```

### 3. Chạy API local (để test)

```bash
npm run dev
```

API sẽ chạy tại: http://localhost:3001

### 4. Test API

```bash
curl -X POST http://localhost:3001/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","code":"123456"}'
```

## 📦 Deploy lên Vercel (FREE)

### Bước 1: Cài Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Deploy
```bash
cd api
vercel
```

### Bước 3: Thêm environment variables
```bash
vercel env add EMAIL_USER
# Nhập: your-email@gmail.com

vercel env add EMAIL_PASSWORD
# Nhập: your-app-password
```

### Bước 4: Deploy lại
```bash
vercel --prod
```

Vercel sẽ cho bạn URL dạng: `https://your-project.vercel.app`

## 🔧 Cập nhật app

Trong file `constants/config.ts`, thêm:
```typescript
export const API_URL = __DEV__ 
  ? 'http://localhost:3001'
  : 'https://your-project.vercel.app';
```

## 📝 API Endpoints

### POST /api/send-verification
Gửi mã xác minh qua email

**Request:**
```json
{
  "email": "user@gmail.com",
  "code": "123456"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

**Response (error):**
```json
{
  "error": "Failed to send email"
}
```

## ⚠️ Lưu ý

1. **Gmail giới hạn:** ~500 email/ngày với tài khoản miễn phí
2. **Bảo mật:** Không commit file `.env` lên Git
3. **Production:** Nên dùng dịch vụ email chuyên dụng:
   - SendGrid (100 email/ngày miễn phí)
   - Resend (3000 email/tháng miễn phí)
   - AWS SES (62,000 email/tháng miễn phí)

## 🐛 Troubleshooting

**Lỗi: "Invalid login"**
- Kiểm tra EMAIL_USER có đúng không
- Kiểm tra EMAIL_PASSWORD là App Password (16 ký tự), không phải mật khẩu Gmail

**Lỗi: "Connection timeout"**
- Kiểm tra internet
- Thử bật "Less secure app access" (không khuyến khích)
- Dùng App Password thay vì mật khẩu thường

**Email không nhận được:**
- Kiểm tra thư mục Spam
- Đợi 1-2 phút (có thể bị delay)
- Thử gửi lại
