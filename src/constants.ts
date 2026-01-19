/** USB Vendor ID for FFBeast devices.  */
export const VID = 1115;

/** USB Product ID for FFBeast wheel controllers. */
export const PID = 22999;

/** Size of HID reports in bytes. */
export const REPORT_SIZE = 64;

/** HID usage page for interface 0. */
export const INTERFACE_0_USAGE_PAGE = 0xff72;

/** HID usage for interface 0. */
export const INTERFACE_0_USAGE = 0xa1;

/**
 * Maximum raw position value from the device.
 * @remarks Used for converting raw position to degrees.
 */
export const RAW_POSITION_MAX = 10000;

/**
 * Maximum raw torque value from the device.
 * @remarks Used for normalizing torque to [-100, 100] range.
 */
export const RAW_TORQUE_MAX = 10000;
