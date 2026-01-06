import {
  INTERFACE_0_USAGE,
  INTERFACE_0_USAGE_PAGE,
  PID,
  RAW_POSITION_MAX,
  RAW_TORQUE_MAX,
  VID,
} from "./constants";

/**
 * Converts raw position value to degrees.
 *
 * @param rawPosition - The raw position value from the device.
 * @param motionRange - The configured motion range in degrees.
 * @returns The position in degrees.
 */
export function convertPositionToDegrees(
  rawPosition: number,
  motionRange = 900
): number {
  return (rawPosition * motionRange) / (2 * RAW_POSITION_MAX);
}

/**
 * Normalizes raw torque value to a [-100, 100] range.
 *
 * @param rawTorque - The raw torque value from the device.
 * @returns The normalized torque value between -100 and 100.
 */
export function normalizeTorque(rawTorque: number): number {
  return (rawTorque * 100) / RAW_TORQUE_MAX;
}

export function isTargetDevice(device: HIDDevice): boolean {
  return (
    device.vendorId === VID &&
    device.productId === PID &&
    device.collections.some(
      (c) =>
        c.usagePage === INTERFACE_0_USAGE_PAGE && c.usage === INTERFACE_0_USAGE
    )
  );
}
