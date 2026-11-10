// Tieng Viet - Cam bien chat luong nuoc
Blockly.Msg.WQ_CAT_NAME = 'CHẤT LƯỢNG NƯỚC';

Blockly.Msg.WQ_READ = 'chất lượng nước: đọc %1';
Blockly.Msg.WQ_KIND_PH = 'pH';
Blockly.Msg.WQ_KIND_EC = 'độ dẫn điện EC (µS/cm)';
Blockly.Msg.WQ_KIND_TDS = 'TDS (ppm)';
Blockly.Msg.WQ_KIND_DO = 'oxy hòa tan DO (mg/L)';
Blockly.Msg.WQ_KIND_DO_PCT = 'oxy hòa tan DO (%)';
Blockly.Msg.WQ_KIND_TEMP = 'nhiệt độ nước (°C)';

Blockly.Msg.WQ_SET_PROBE = 'chất lượng nước: đo độ dẫn điện bằng %1';
Blockly.Msg.WQ_PROBE_SEL_EC = 'đầu dò EC';
Blockly.Msg.WQ_PROBE_SEL_TDS = 'đầu dò TDS';

Blockly.Msg.WQ_CAL_PH = 'hiệu chỉnh pH: thêm điểm với pH chuẩn %1';
Blockly.Msg.WQ_CAL_EC = 'hiệu chỉnh EC với dung dịch chuẩn %1 µS/cm';
Blockly.Msg.WQ_CAL_DO = 'hiệu chỉnh DO: %1';
Blockly.Msg.WQ_CAL_DO_AIR = '100 % (đầu dò trong không khí ẩm)';
Blockly.Msg.WQ_CAL_DO_ZERO = 'điểm 0 (dung dịch khử oxy)';

Blockly.Msg.WQ_RESET = 'xóa hiệu chỉnh %1';
Blockly.Msg.WQ_RESET_PH = 'pH';
Blockly.Msg.WQ_RESET_EC = 'EC / TDS';
Blockly.Msg.WQ_RESET_DO = 'DO';
Blockly.Msg.WQ_RESET_ALL = 'tất cả';

Blockly.Msg.WQ_READ_RAW = 'chất lượng nước: giá trị thô %1';
Blockly.Msg.WQ_RAW_PH_MV = 'điện áp điện cực pH (mV)';
Blockly.Msg.WQ_RAW_R_CELL = 'điện trở đầu dò EC (Ω)';
Blockly.Msg.WQ_RAW_DO_NA = 'dòng đầu dò DO (nA)';
Blockly.Msg.WQ_RAW_TEMP_USED = 'nhiệt độ dùng để bù (°C)';

Blockly.Msg.WQ_DESCRIBE = 'in thông tin cảm biến chất lượng nước ra Serial';

Blockly.Msg.WQ_TIP_READ = 'Đọc giá trị đã bù nhiệt và đã hiệu chỉnh. Trả về 0 khi chưa cắm đầu dò hoặc kênh đo bị lỗi';
Blockly.Msg.WQ_TIP_SET_PROBE = 'Đầu dò EC và đầu dò TDS dùng chung một mạch đo, mỗi lúc chỉ đo một cái. Mặc định là đầu dò EC';
Blockly.Msg.WQ_TIP_CAL_PH = 'Nhúng điện cực vào dung dịch đệm, chờ số ổn định rồi chạy khối này. Tối đa 3 điểm (ví dụ 4.00, 6.86, 9.18). Điểm hiệu chỉnh được lưu trong cảm biến';
Blockly.Msg.WQ_TIP_CAL_EC = 'Nhúng đầu dò vào dung dịch chuẩn (ví dụ 1413 µS/cm), chờ số ổn định rồi chạy khối này. Dùng chung cho cả EC và TDS';
Blockly.Msg.WQ_TIP_CAL_DO = '100 %: để đầu dò trong không khí ẩm 10–15 phút cho dòng ổn định rồi chạy khối này. Kênh DO chỉ cho số đo sau khi đã hiệu chỉnh 100 %';
Blockly.Msg.WQ_TIP_RESET = 'Xóa điểm hiệu chỉnh đã lưu trong cảm biến và quay về giá trị mặc định';
Blockly.Msg.WQ_TIP_READ_RAW = 'Giá trị trước khi quy đổi, dùng để kiểm tra đầu dò và mạch';
Blockly.Msg.WQ_TIP_DESCRIBE = 'In mọi giá trị đo, trạng thái từng đầu dò và thông tin hiệu chỉnh ra Serial';
