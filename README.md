# Cảm biến chất lượng nước — Extension cho Yolo:Uno

Mục mở rộng (khối lệnh kéo–thả) cho mạch **OhStem Water Quality Sensor rev A**: đo **pH, độ dẫn điện EC / TDS,
oxy hòa tan DO và nhiệt độ nước** qua một cổng I2C.

> **Chưa thử trên Yolo:Uno thật.** Thư viện mới chạy với bảng thanh ghi giả lập trên máy tính, các khối mới được
> kiểm bằng cách sinh mã. Cần firmware của mạch từ bản có ghi kết quả lệnh vào thanh ghi `CAL_STATUS` (0x35);
> với bản cũ hơn, mọi khối hiệu chỉnh sẽ báo "mạch không trả lời lệnh".

## 1. Kết nối

Cắm cáp Grove từ cổng I2C của Yolo:Uno (SDA = IO11, SCL = IO12) vào cổng J1 của mạch. Địa chỉ I2C là `0x16`;
hàn tắt JP1 thì là `0x17`. Thư viện tự dò cả hai.

| Đầu dò | Cổng trên mạch |
| --- | --- |
| Điện cực pH | BNC J4 |
| Đầu dò EC | BNC J5 |
| Đầu dò TDS (2 chân) | J6 |
| Đầu dò DO | J7 |
| DS18B20 (nhiệt độ) | J3 |

## 2. Bộ khối lệnh (8 khối)

Không có khối khởi tạo: kéo khối nào ra thì cảm biến tự được khởi tạo một lần ở đầu chương trình.

| Khối | Kiểu | Chức năng |
| --- | --- | --- |
| `chất lượng nước: đọc [pH / EC / TDS / DO mg/L / DO % / nhiệt độ]` | số | Giá trị đã bù nhiệt và hiệu chỉnh. **Trả về 0** khi kênh đó chưa có số dùng được |
| `chất lượng nước: đo độ dẫn điện bằng [đầu dò EC / đầu dò TDS]` | lệnh | EC và TDS dùng chung một mạch đo, mỗi lúc chỉ đo một đầu dò. Mặc định: EC |
| `hiệu chỉnh pH: thêm điểm với pH chuẩn [6.86]` | lệnh | Thêm 1 điểm (tối đa 3) |
| `hiệu chỉnh EC với dung dịch chuẩn [1413] µS/cm` | lệnh | Hiệu chỉnh 1 điểm, giải ra hằng số K của đầu dò |
| `hiệu chỉnh DO: [100 % / điểm 0]` | lệnh | 100 %: đầu dò trong không khí ẩm |
| `xóa hiệu chỉnh [pH / EC-TDS / DO / tất cả]` | lệnh | Về giá trị mặc định |
| `chất lượng nước: giá trị thô [...]` | số | mV điện cực pH, Ω đầu dò EC, nA đầu dò DO, nhiệt độ đang dùng để bù |
| `in thông tin cảm biến chất lượng nước ra Serial` | lệnh | Mọi giá trị, trạng thái từng đầu dò, thông tin hiệu chỉnh |

## 3. Cách hoạt động

- Mạch tự đo khoảng **1,8 giây một lần** và tự bù nhiệt. Thư viện chỉ đọc bảng thanh ghi, nên đọc nhanh hơn chu kỳ
  đó sẽ nhận lại cùng một số.
- Nhiều khối đọc đặt cạnh nhau dùng chung một lần đọc I2C (trong 300 ms), nên các giá trị trong cùng một vòng lặp
  luôn thuộc cùng một chu kỳ đo.
- **Điểm hiệu chỉnh lưu trong flash của mạch cảm biến**, không phải của Yolo:Uno: đổi board điều khiển vẫn giữ nguyên.
- Nhiệt độ: lấy từ DS18B20; không cắm thì lấy nhiệt điện trở bên trong đầu dò DO; không có cả hai thì mạch bù theo 25 °C.
- **Kênh DO chỉ cho số đo sau khi đã hiệu chỉnh 100 %.** Trước đó khối đọc DO trả về 0.

## 4. Hiệu chỉnh

Mỗi khối hiệu chỉnh mất tới vài giây (mạch chỉ nhận lệnh giữa hai chu kỳ đo) và in kết quả ra Serial:
`Hieu chinh pH: OK, da luu vao cam bien` hoặc lý do thất bại (chưa cắm đầu dò, số đo không hợp lý, đã đủ 3 điểm pH…).

| Kênh | Cách làm |
| --- | --- |
| pH | Nhúng vào dung dịch đệm 6,86 → chờ ổn định → chạy khối với 6.86. Rửa điện cực, làm tiếp với 4.00 và 9.18. Muốn làm lại từ đầu: `xóa hiệu chỉnh pH` trước |
| EC / TDS | Nhúng vào dung dịch chuẩn 1413 µS/cm → chờ ổn định → chạy khối với 1413 |
| DO | Để đầu dò trong không khí ẩm 10–15 phút → chạy khối `100 %`. Điểm 0 (tùy chọn): dung dịch Na₂SO₃ |

Nên gắn mỗi khối hiệu chỉnh vào một nút nhấn, đừng đặt trong `lặp lại mãi`.

## 5. Ví dụ

```
lặp lại mãi:
    hiển thị  ⟵  ghép chuỗi "pH = " với (chất lượng nước: đọc pH)
    đợi 2 giây
```

## 6. Cài đặt

Nén cả thư mục này thành `.zip` (hoặc trỏ tới URL repo Git), rồi trong trình soạn thảo Yolo:Uno chọn
**Mở rộng → Nhập extension**.
