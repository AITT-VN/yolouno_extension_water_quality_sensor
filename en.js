// English - Water quality sensor
Blockly.Msg.WQ_CAT_NAME = 'WATER QUALITY';

Blockly.Msg.WQ_READ = 'water quality: read %1';
Blockly.Msg.WQ_KIND_PH = 'pH';
Blockly.Msg.WQ_KIND_EC = 'conductivity EC (µS/cm)';
Blockly.Msg.WQ_KIND_TDS = 'TDS (ppm)';
Blockly.Msg.WQ_KIND_DO = 'dissolved oxygen DO (mg/L)';
Blockly.Msg.WQ_KIND_DO_PCT = 'dissolved oxygen DO (%)';
Blockly.Msg.WQ_KIND_TEMP = 'water temperature (°C)';

Blockly.Msg.WQ_SET_PROBE = 'water quality: measure conductivity with %1';
Blockly.Msg.WQ_PROBE_SEL_EC = 'the EC probe';
Blockly.Msg.WQ_PROBE_SEL_TDS = 'the TDS probe';

Blockly.Msg.WQ_CAL_PH = 'calibrate pH: add a point at buffer pH %1';
Blockly.Msg.WQ_CAL_EC = 'calibrate EC with the %1 µS/cm standard';
Blockly.Msg.WQ_CAL_DO = 'calibrate DO: %1';
Blockly.Msg.WQ_CAL_DO_AIR = '100 % (probe in moist air)';
Blockly.Msg.WQ_CAL_DO_ZERO = 'zero point (oxygen-free solution)';

Blockly.Msg.WQ_RESET = 'clear the %1 calibration';
Blockly.Msg.WQ_RESET_PH = 'pH';
Blockly.Msg.WQ_RESET_EC = 'EC / TDS';
Blockly.Msg.WQ_RESET_DO = 'DO';
Blockly.Msg.WQ_RESET_ALL = 'whole';

Blockly.Msg.WQ_READ_RAW = 'water quality: raw value %1';
Blockly.Msg.WQ_RAW_PH_MV = 'pH electrode voltage (mV)';
Blockly.Msg.WQ_RAW_R_CELL = 'EC probe resistance (Ω)';
Blockly.Msg.WQ_RAW_DO_NA = 'DO probe current (nA)';
Blockly.Msg.WQ_RAW_TEMP_USED = 'temperature used for compensation (°C)';

Blockly.Msg.WQ_DESCRIBE = 'print the water quality sensor report to Serial';

Blockly.Msg.WQ_TIP_READ = 'Reads the temperature-compensated, calibrated value. Returns 0 when the probe is not plugged in or the channel has a fault';
Blockly.Msg.WQ_TIP_SET_PROBE = 'The EC probe and the TDS probe share one measuring circuit, so only one is measured at a time. The EC probe is the default';
Blockly.Msg.WQ_TIP_CAL_PH = 'Put the electrode in the buffer, wait for the reading to settle, then run this block. Up to 3 points (for example 4.00, 6.86, 9.18). The points are stored in the sensor';
Blockly.Msg.WQ_TIP_CAL_EC = 'Put the probe in the standard solution (for example 1413 µS/cm), wait for the reading to settle, then run this block. Used for both EC and TDS';
Blockly.Msg.WQ_TIP_CAL_DO = '100 %: leave the probe in moist air for 10–15 minutes until the current settles, then run this block. The DO channel only gives readings after the 100 % calibration';
Blockly.Msg.WQ_TIP_RESET = 'Clears the calibration stored in the sensor and goes back to the defaults';
Blockly.Msg.WQ_TIP_READ_RAW = 'The value before conversion, for checking the probe and the board';
Blockly.Msg.WQ_TIP_DESCRIBE = 'Prints every reading, the state of each probe and the calibration to Serial';
