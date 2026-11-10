// ============================================================
//  KHOI LENH: Cam bien chat luong nuoc (pH + EC/TDS + DO + nhiet do)
//  OhStem Water Quality Sensor rev A - Yolo:Uno, cong I2C
// ------------------------------------------------------------
//  - Blockly.Blocks[...] dat o cap cao nhat (khong boc IIFE).
//  - Ho tro ca Blockly cu (Blockly.Python) lan moi (pythonGenerator).
//  - Chuoi hien thi lay tu vi.js / en.js, luon co ban du phong tieng Viet.
//  - Khong co khoi "khoi tao": moi khoi tu day dong khoi tao vao
//    definitions_ (dict theo khoa nen chi sinh ra dung mot lan).
// ============================================================

var WQPythonGen =
  typeof pythonGenerator !== "undefined"
    ? pythonGenerator
    : typeof Blockly !== "undefined" && Blockly.Python
      ? Blockly.Python
      : {};

var WQColorBlock = "#0097a7";

function wqMsg(key, fallback) {
  var v = typeof Blockly !== "undefined" && Blockly.Msg ? Blockly.Msg[key] : null;
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function wqOrder(name, fallback) {
  return typeof WQPythonGen[name] === "number" ? WQPythonGen[name] : fallback;
}

function wqSetup() {
  if (!WQPythonGen.definitions_) return;
  WQPythonGen.definitions_["import_wq_sensor"] =
    "from water_quality import WaterQualitySensor";
  WQPythonGen.definitions_["init_wq_sensor"] = "wq_sensor = WaterQualitySensor()";
}

function wqValue(block, name, fallback) {
  var code = WQPythonGen.valueToCode
    ? WQPythonGen.valueToCode(block, name, wqOrder("ORDER_NONE", 99))
    : "";
  return code || fallback;
}

var wqDevVars = function () {
  return ["wq_sensor"];
};

// -----------------------------------------------------------
// 1) DOC mot dai luong do (so). Tra ve 0 khi kenh chua co so dung duoc.
// -----------------------------------------------------------
Blockly.Blocks["wq_read"] = {
  init: function () {
    this.jsonInit({
      type: "wq_read",
      message0: wqMsg("WQ_READ", "chất lượng nước: đọc %1"),
      args0: [
        {
          type: "field_dropdown",
          name: "KIND",
          options: [
            [wqMsg("WQ_KIND_PH", "pH"), "ph"],
            [wqMsg("WQ_KIND_EC", "độ dẫn điện EC (µS/cm)"), "ec"],
            [wqMsg("WQ_KIND_TDS", "TDS (ppm)"), "tds"],
            [wqMsg("WQ_KIND_DO", "oxy hòa tan DO (mg/L)"), "do"],
            [wqMsg("WQ_KIND_DO_PCT", "oxy hòa tan DO (%)"), "do_pct"],
            [wqMsg("WQ_KIND_TEMP", "nhiệt độ nước (°C)"), "temp"],
          ],
        },
      ],
      output: "Number",
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_READ",
        "Đọc giá trị đã bù nhiệt và đã hiệu chỉnh. Trả về 0 khi chưa cắm đầu dò hoặc kênh đo bị lỗi"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_read"] = function (block) {
  wqSetup();
  return [
    "wq_sensor.read('" + block.getFieldValue("KIND") + "')",
    wqOrder("ORDER_FUNCTION_CALL", 2),
  ];
};

// -----------------------------------------------------------
// 3) CHON dau do dan dien: EC (BNC) hay TDS (2 chan)
// -----------------------------------------------------------
Blockly.Blocks["wq_set_probe"] = {
  init: function () {
    this.jsonInit({
      type: "wq_set_probe",
      message0: wqMsg("WQ_SET_PROBE", "chất lượng nước: đo độ dẫn điện bằng%1"),
      args0: [
        {
          type: "field_dropdown",
          name: "PROBE",
          options: [
            [wqMsg("WQ_PROBE_SEL_EC", "đầu dò EC"), "0"],
            [wqMsg("WQ_PROBE_SEL_TDS", "đầu dò TDS"), "1"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_SET_PROBE",
        "Đầu dò EC và đầu dò TDS dùng chung một mạch đo, mỗi lúc chỉ đo một cái. Mặc định là đầu dò EC"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_set_probe"] = function (block) {
  wqSetup();
  return "wq_sensor.set_probe(" + block.getFieldValue("PROBE") + ")\n";
};

// -----------------------------------------------------------
// 4) HIEU CHINH pH: them 1 diem voi dung dich dem
// -----------------------------------------------------------
Blockly.Blocks["wq_cal_ph"] = {
  init: function () {
    this.jsonInit({
      type: "wq_cal_ph",
      message0: wqMsg("WQ_CAL_PH", "hiệu chỉnh pH: thêm điểm với pH chuẩn %1"),
      args0: [{ type: "input_value", name: "PH", check: "Number" }],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_CAL_PH",
        "Nhúng điện cực vào dung dịch đệm, chờ số ổn định rồi chạy khối này. Tối đa 3 điểm (ví dụ 4.00, 6.86, 9.18). Điểm hiệu chỉnh được lưu trong cảm biến"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_cal_ph"] = function (block) {
  wqSetup();
  return "wq_sensor.calibrate_ph(" + wqValue(block, "PH", "6.86") + ")\n";
};

// -----------------------------------------------------------
// 5) HIEU CHINH EC: 1 diem voi dung dich chuan
// -----------------------------------------------------------
Blockly.Blocks["wq_cal_ec"] = {
  init: function () {
    this.jsonInit({
      type: "wq_cal_ec",
      message0: wqMsg("WQ_CAL_EC", "hiệu chỉnh EC với dung dịch chuẩn %1 µS/cm"),
      args0: [{ type: "input_value", name: "EC", check: "Number" }],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_CAL_EC",
        "Nhúng đầu dò vào dung dịch chuẩn (ví dụ 1413 µS/cm), chờ số ổn định rồi chạy khối này. Dùng chung cho cả EC và TDS"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_cal_ec"] = function (block) {
  wqSetup();
  return "wq_sensor.calibrate_ec(" + wqValue(block, "EC", "1413") + ")\n";
};

// -----------------------------------------------------------
// 6) HIEU CHINH DO: 100 % trong khong khi, hoac diem 0
// -----------------------------------------------------------
Blockly.Blocks["wq_cal_do"] = {
  init: function () {
    this.jsonInit({
      type: "wq_cal_do",
      message0: wqMsg("WQ_CAL_DO", "hiệu chỉnh DO: %1"),
      args0: [
        {
          type: "field_dropdown",
          name: "POINT",
          options: [
            [wqMsg("WQ_CAL_DO_AIR", "100 % (đầu dò trong không khí ẩm)"), "air"],
            [wqMsg("WQ_CAL_DO_ZERO", "điểm 0 (dung dịch khử oxy)"), "zero"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_CAL_DO",
        "100 %: để đầu dò trong không khí ẩm 10–15 phút cho dòng ổn định rồi chạy khối này. Kênh DO chỉ cho số đo sau khi đã hiệu chỉnh 100 %"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_cal_do"] = function (block) {
  wqSetup();
  return block.getFieldValue("POINT") === "zero"
    ? "wq_sensor.calibrate_do_zero()\n"
    : "wq_sensor.calibrate_do_air()\n";
};

// -----------------------------------------------------------
// 7) XOA hieu chinh
// -----------------------------------------------------------
Blockly.Blocks["wq_reset_calib"] = {
  init: function () {
    this.jsonInit({
      type: "wq_reset_calib",
      message0: wqMsg("WQ_RESET", "xóa hiệu chỉnh %1"),
      args0: [
        {
          type: "field_dropdown",
          name: "KIND",
          options: [
            [wqMsg("WQ_RESET_PH", "pH"), "ph"],
            [wqMsg("WQ_RESET_EC", "EC / TDS"), "ec"],
            [wqMsg("WQ_RESET_DO", "DO"), "do"],
            [wqMsg("WQ_RESET_ALL", "tất cả"), "all"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_RESET",
        "Xóa điểm hiệu chỉnh đã lưu trong cảm biến và quay về giá trị mặc định"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_reset_calib"] = function (block) {
  wqSetup();
  return "wq_sensor.reset_calib('" + block.getFieldValue("KIND") + "')\n";
};

// -----------------------------------------------------------
// 8) DOC gia tri tho - de kiem tra / debug
// -----------------------------------------------------------
Blockly.Blocks["wq_read_raw"] = {
  init: function () {
    this.jsonInit({
      type: "wq_read_raw",
      message0: wqMsg("WQ_READ_RAW", "chất lượng nước: giá trị thô %1"),
      args0: [
        {
          type: "field_dropdown",
          name: "KIND",
          options: [
            [wqMsg("WQ_RAW_PH_MV", "điện áp điện cực pH (mV)"), "ph_mv"],
            [wqMsg("WQ_RAW_R_CELL", "điện trở đầu dò EC (Ω)"), "r_cell"],
            [wqMsg("WQ_RAW_DO_NA", "dòng đầu dò DO (nA)"), "do_na"],
            [wqMsg("WQ_RAW_TEMP_USED", "nhiệt độ dùng để bù (°C)"), "temp_used"],
          ],
        },
      ],
      output: "Number",
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_READ_RAW",
        "Giá trị trước khi quy đổi, dùng để kiểm tra đầu dò và mạch"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_read_raw"] = function (block) {
  wqSetup();
  return [
    "wq_sensor.read_raw('" + block.getFieldValue("KIND") + "')",
    wqOrder("ORDER_FUNCTION_CALL", 2),
  ];
};

// -----------------------------------------------------------
// 9) IN thong tin cam bien ra Serial
// -----------------------------------------------------------
Blockly.Blocks["wq_describe"] = {
  init: function () {
    this.jsonInit({
      type: "wq_describe",
      message0: wqMsg("WQ_DESCRIBE", "in thông tin cảm biến chất lượng nước ra Serial"),
      previousStatement: null,
      nextStatement: null,
      colour: WQColorBlock,
      tooltip: wqMsg(
        "WQ_TIP_DESCRIBE",
        "In mọi giá trị đo, trạng thái từng đầu dò và thông tin hiệu chỉnh ra Serial"
      ),
      helpUrl: "",
    });
  },
  getDeveloperVars: wqDevVars,
};

WQPythonGen["wq_describe"] = function (block) {
  wqSetup();
  return "wq_sensor.describe()\n";
};
