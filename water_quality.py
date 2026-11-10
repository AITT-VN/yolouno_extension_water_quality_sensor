# ============================================================
#  THU VIEN CAM BIEN CHAT LUONG NUOC - Yolo:Uno (ESP32-S3, MicroPython)
# ============================================================
#  Dung cho extension "Cam bien chat luong nuoc" (khoi lenh keo-tha).
#  Mach: OhStem Water Quality Sensor rev A (pH + EC/TDS + DO + nhiet do),
#  noi qua cong I2C (Grove). Dia chi 0x16, han tat JP1 thi la 0x17.
#
#  Khac voi cam bien pH analog: moi phep do, bu nhiet va hieu chinh deu do
#  vi dieu khien TREN MACH lam. Thu vien nay chi doc bang thanh ghi va gui
#  lenh. Diem hieu chinh duoc luu trong flash CUA MACH CAM BIEN (khong phai
#  cua Yolo:Uno), nen doi board dieu khien van giu nguyen hieu chinh.
#
#  Bang thanh ghi: firmware/src/host/regs.h cua mach (fw 0.1).
# ============================================================

import time
from machine import Pin, I2C, SoftI2C

WQ_SDA_DEFAULT = 11           # cong I2C cua Yolo:Uno
WQ_SCL_DEFAULT = 12
WQ_ADDR_DEFAULT = 0x16
WQ_ADDR_ALT = 0x17            # JP1 han tat
WQ_WHO_AM_I = 0x51

INVALID = 0                   # gia tri tra ve khi kenh do khong co so dung duoc
                              # (chua cam dau do, loi). Ham is_ready() phan biet voi so 0 that (khong co khoi lenh).

# --- thanh ghi ---
_REG_WHO = 0x00
_REG_STATUS = 0x02            # bat dau khoi du lieu doc mot lan
_REG_PROBE = 0x28
_REG_TDS_FACTOR = 0x29
_REG_CAL_ARG = 0x30
_REG_CMD = 0x34
_REG_CAL_STATUS = 0x35
_BLOCK_LEN = 0x40 - _REG_STATUS

# --- bit trang thai tung kenh (CH_PH, CH_EC, CH_DO, CH_TEMP) ---
_CH_PRESENT = 0x01
_CH_VALID = 0x02
_CH_BUS_ERROR = 0x04
_CH_OPEN = 0x08
_CH_SAT = 0x10
_CH_CALIBRATED = 0x20

# --- lenh ---
_CMD_CAL_PH = 0x10
_CMD_CAL_PH_CLEAR = 0x11
_CMD_CAL_EC = 0x12
_CMD_CAL_EC_CLEAR = 0x13
_CMD_CAL_DO_AIR = 0x14
_CMD_CAL_DO_ZERO = 0x15
_CMD_CAL_DO_CLEAR = 0x16
_CMD_SAVE = 0x20
_CMD_FACTORY = 0x22

_CS_OK = 0x01
_CS_BUSY = 0x02
_CS_TEXT = {
    0x80: "so do khong hop ly",
    0x81: "chua cam dau do",
    0x82: "loi ghi flash",
    0x83: "da du 3 diem pH (xoa hieu chinh pH truoc)",
    0x84: "khoi do khong tra loi",
}

# vi tri cac kenh trong khoi du lieu (tinh tu _REG_STATUS)
_CH_INDEX = {"ph": 1, "ec": 2, "tds": 2, "do": 3, "temp": 4}


def _u16(b, reg):
    i = reg - _REG_STATUS
    return b[i] | (b[i + 1] << 8)


def _i16(b, reg):
    v = _u16(b, reg)
    return v - 65536 if v & 0x8000 else v


def _u32(b, reg):
    i = reg - _REG_STATUS
    return b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)


class WaterQualitySensor:
    """Doc & hieu chinh mach cam bien chat luong nuoc qua I2C."""

    def __init__(self, sda=WQ_SDA_DEFAULT, scl=WQ_SCL_DEFAULT, address=None,
                 freq=100000, cache_ms=300):
        # Mach tu do moi ~1.8 giay mot lan. Nhieu khoi doc dat canh nhau se
        # dung chung mot lan doc I2C trong 'cache_ms', nen cac gia tri trong
        # cung mot vong lap luon thuoc cung mot chu ky do.
        self.cache_ms = cache_ms
        self._buf = None
        self._t_read = 0
        self.last_error = ""

        # --- Mo bus I2C: uu tien I2C phan cung, khong duoc thi dung SoftI2C ---
        try:
            self.i2c = I2C(0, sda=Pin(sda), scl=Pin(scl), freq=freq)
        except Exception:
            self.i2c = SoftI2C(sda=Pin(sda), scl=Pin(scl), freq=freq)

        # --- Tim mach: 0x16, khong co thi thu 0x17 ---
        self.address = None
        for a in ([address] if address is not None else [WQ_ADDR_DEFAULT, WQ_ADDR_ALT]):
            try:
                if self.i2c.readfrom_mem(a, _REG_WHO, 1)[0] == WQ_WHO_AM_I:
                    self.address = a
                    break
            except OSError:
                pass
        if self.address is None:
            print("!! Khong tim thay cam bien chat luong nuoc (I2C 0x16 / 0x17)")

    # ------------------------------------------------------------
    #  DOC BANG THANH GHI
    # ------------------------------------------------------------
    def connected(self):
        return self.address is not None

    def _block(self, force=False):
        """Doc ca khoi 0x02..0x3F trong MOT lan doc (mach chup lai bang thanh
        ghi luc nhan dia chi, nen moi gia tri deu cung mot chu ky do)."""
        if self.address is None:
            return None
        now = time.ticks_ms()
        if (not force and self._buf is not None
                and time.ticks_diff(now, self._t_read) < self.cache_ms):
            return self._buf
        try:
            self._buf = self.i2c.readfrom_mem(self.address, _REG_STATUS, _BLOCK_LEN)
            self._t_read = now
        except OSError:
            self._buf = None
        return self._buf

    def _valid(self, b, kind):
        return b is not None and (b[_CH_INDEX[kind]] & _CH_VALID) != 0

    # ------------------------------------------------------------
    #  GIA TRI DO (tra ve INVALID = 0 khi kenh khong co so dung duoc)
    # ------------------------------------------------------------
    def read_ph(self):
        """pH, 2 chu so thap phan. Da bu nhiet va ap dung hieu chinh."""
        b = self._block()
        return _i16(b, 0x08) / 100 if self._valid(b, "ph") else INVALID

    def read_ec(self):
        """Do dan dien, uS/cm, da quy ve 25 do C."""
        b = self._block()
        return _u32(b, 0x0C) if self._valid(b, "ec") else INVALID

    def read_tds(self):
        """Tong chat ran hoa tan, ppm (= EC x he so TDS, mac dinh 0.5)."""
        b = self._block()
        return _u32(b, 0x10) if self._valid(b, "tds") else INVALID

    def read_do(self):
        """Oxy hoa tan, mg/L, 2 chu so thap phan. CAN hieu chinh truoc."""
        b = self._block()
        return round(_u32(b, 0x18) / 1000, 2) if self._valid(b, "do") else INVALID

    def read_do_percent(self):
        """Oxy hoa tan, % bao hoa."""
        b = self._block()
        return _u16(b, 0x1C) / 10 if self._valid(b, "do") else INVALID

    def read_temperature(self):
        """Nhiet do nuoc (do C): dau do DS18B20; khong cam thi lay nhiet dien
        tro ben trong dau do DO."""
        b = self._block()
        if not self._valid(b, "temp"):
            return INVALID
        if b[_CH_INDEX["temp"]] & _CH_PRESENT:
            return _i16(b, 0x20) / 100          # DS18B20
        return _i16(b, 0x22) / 100              # NTC cua dau do DO

    def read(self, kind):
        """Doc theo ten: 'ph', 'ec', 'tds', 'do', 'do_pct', 'temp'."""
        if kind == "ph":
            return self.read_ph()
        if kind == "ec":
            return self.read_ec()
        if kind == "tds":
            return self.read_tds()
        if kind == "do":
            return self.read_do()
        if kind == "do_pct":
            return self.read_do_percent()
        if kind == "temp":
            return self.read_temperature()
        return INVALID

    def is_ready(self, kind):
        """True khi kenh do dang co so dung duoc (dau do da cam, khong loi)."""
        if kind == "do_pct":
            kind = "do"
        return self._valid(self._block(), kind)

    # ------------------------------------------------------------
    #  GIA TRI THO - de kiem tra / debug
    # ------------------------------------------------------------
    def read_raw(self, kind):
        """'ph_mv': dien ap dien cuc pH (mV); 'r_cell': dien tro giua 2 cuc
        dau do EC (ohm, -1 = ho mach); 'do_na': dong dau do DO (nA);
        'temp_used': nhiet do mach dang dung de bu (do C)."""
        b = self._block()
        if b is None:
            return INVALID
        if kind == "ph_mv":
            return _i16(b, 0x0A)
        if kind == "r_cell":
            r = _u32(b, 0x14)
            return -1 if r == 0xFFFFFFFF else r
        if kind == "do_na":
            return _i16(b, 0x1E)
        if kind == "temp_used":
            return _i16(b, 0x24) / 100
        return INVALID

    # ------------------------------------------------------------
    #  CAI DAT
    # ------------------------------------------------------------
    def _write(self, reg, data):
        if self.address is None:
            return False
        try:
            self.i2c.writeto_mem(self.address, reg, data)
            return True
        except OSError:
            return False

    def set_probe(self, probe):
        """Chon dau do dan dien: 0 = dau do EC (cong BNC), 1 = dau do TDS (2 chan).
        Hai dau do dung chung mot mach do, moi luc chi do mot cai."""
        self._buf = None
        return self._write(_REG_PROBE, bytes([1 if probe else 0]))

    def set_tds_factor(self, factor):
        """He so doi EC -> TDS, 0.40 .. 1.00 (mac dinh 0.50)."""
        f = int(round(factor * 100))
        f = 1 if f < 1 else 255 if f > 255 else f
        self._buf = None
        return self._write(_REG_TDS_FACTOR, bytes([f]))

    # ------------------------------------------------------------
    #  HIEU CHINH (CALIB) - mach tu tinh va tu luu vao flash cua no
    # ------------------------------------------------------------
    def _command(self, cmd, arg=None, timeout_ms=5000):
        """Gui 1 lenh, cho mach xu ly xong. Tra ve True neu thanh cong;
        that bai thi ly do nam trong self.last_error."""
        self.last_error = ""
        if self.address is None:
            self.last_error = "khong tim thay cam bien"
            return False
        if arg is not None:
            a = int(arg) & 0xFFFFFFFF
            if not self._write(_REG_CAL_ARG, bytes([a & 0xFF, (a >> 8) & 0xFF,
                                                    (a >> 16) & 0xFF, (a >> 24) & 0xFF])):
                self.last_error = "loi I2C"
                return False
        if not self._write(_REG_CMD, bytes([cmd])):
            self.last_error = "loi I2C"
            return False
        # Mach chi nhan lenh giua hai chu ky do (moi chu ky ~1.8 giay).
        t0 = time.ticks_ms()
        st = _CS_BUSY
        while time.ticks_diff(time.ticks_ms(), t0) < timeout_ms:
            time.sleep_ms(100)
            try:
                st = self.i2c.readfrom_mem(self.address, _REG_CAL_STATUS, 1)[0]
            except OSError:
                continue
            if st != _CS_BUSY and st != 0:
                break
        self._buf = None
        if st == _CS_OK:
            return True
        self.last_error = _CS_TEXT.get(st, "mach khong tra loi lenh")
        return False

    def _calibrate(self, name, cmd, arg=None):
        ok = self._command(cmd, arg) and self._command(_CMD_SAVE)
        if ok:
            print("Hieu chinh {}: OK, da luu vao cam bien".format(name))
        else:
            print("!! Hieu chinh {} that bai: {}".format(name, self.last_error))
        return ok

    def calibrate_ph(self, ph):
        """Them 1 diem hieu chinh pH (toi da 3 diem). Nhung dien cuc vao dung
        dich dem 'ph', cho so on dinh roi goi ham nay."""
        return self._calibrate("pH", _CMD_CAL_PH, round(ph * 100))

    def calibrate_ec(self, us_cm):
        """Hieu chinh EC 1 diem: dau do dang nhung trong dung dich chuan
        'us_cm' (uS/cm o 25 do C, vd 1413)."""
        return self._calibrate("EC", _CMD_CAL_EC, round(us_cm))

    def calibrate_do_air(self):
        """Hieu chinh DO 100 %: dau do de trong khong khi am 10-15 phut."""
        return self._calibrate("DO 100%", _CMD_CAL_DO_AIR)

    def calibrate_do_zero(self):
        """Hieu chinh DO diem 0: dau do trong dung dich khu oxy (Na2SO3)."""
        return self._calibrate("DO diem 0", _CMD_CAL_DO_ZERO)

    def reset_calib(self, kind="all"):
        """Xoa hieu chinh: 'ph', 'ec', 'do' hoac 'all'."""
        if kind == "ph":
            return self._calibrate("xoa pH", _CMD_CAL_PH_CLEAR)
        if kind == "ec":
            return self._calibrate("xoa EC", _CMD_CAL_EC_CLEAR)
        if kind == "do":
            return self._calibrate("xoa DO", _CMD_CAL_DO_CLEAR)
        ok = self._command(_CMD_FACTORY)
        print("Xoa toan bo hieu chinh: " + ("OK" if ok else "that bai: " + self.last_error))
        return ok

    # ------------------------------------------------------------
    #  IN THONG TIN ra Serial (de kiem tra / debug)
    # ------------------------------------------------------------
    def describe(self):
        print("--- CAM BIEN CHAT LUONG NUOC ---")
        b = self._block(force=True)
        if b is None:
            print("  Khong doc duoc cam bien (kiem tra day I2C)")
            print("--------------------------------")
            return
        print("  Dia chi I2C 0x{:02x}, STATUS 0x{:02x}, DIAG 0x{:02x}".format(
            self.address, b[0], b[5]))

        def state(ch):
            if ch & _CH_BUS_ERROR:
                return "LOI khoi do"
            if ch & _CH_VALID:
                return "OK" + (", da hieu chinh" if ch & _CH_CALIBRATED else ", CHUA hieu chinh")
            if ch & _CH_OPEN:
                return "chua cam dau do"
            if ch & _CH_SAT:
                return "ngoai dai do"
            return "khong co so do"

        print("  pH       : {} ({} mV) - {}".format(self.read_ph(), _i16(b, 0x0A), state(b[1])))
        print("  EC       : {} uS/cm, TDS {} ppm - {}".format(self.read_ec(), self.read_tds(), state(b[2])))
        print("  DO       : {} mg/L, {} % ({} nA) - {}".format(
            self.read_do(), self.read_do_percent(), _i16(b, 0x1E), state(b[3])))
        t = self.read_temperature()
        print("  Nhiet do : {} C (dang bu theo {} C)".format(
            t if self.is_ready("temp") else "chua cam DS18B20", _i16(b, 0x24) / 100))
        print("  Hieu chinh: pH {} diem, do doc {} uV/pH, K = {:.3f}, DO 100% = {} nA".format(
            b[0x36 - _REG_STATUS], _u16(b, 0x38), _u16(b, 0x3A) / 1000, _u16(b, 0x3C)))
        print("--------------------------------")
