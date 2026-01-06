import { Field } from "./field-parser";
import { FieldType } from "./enums";

export class FirmwareVersion {
  @Field(FieldType.Uint8) releaseType!: number;
  @Field(FieldType.Uint8) major!: number;
  @Field(FieldType.Uint8) minor!: number;
  @Field(FieldType.Uint8) patch!: number;
}

export class FirmwareLicense {
  @Field(FirmwareVersion) firmwareVersion!: FirmwareVersion;

  /** Serial key components (3 x 32-bit values). */
  @Field(FieldType.Uint32, 3) serialKey!: number[];

  /** Device ID components (3 x 32-bit values). */
  @Field(FieldType.Uint32, 3) deviceId!: number[];

  /** Registration status (0 = unregistered, 1 = registered). */
  @Field(FieldType.Uint8) isRegistered!: number;
}

export class EffectSettings {
  @Field(FieldType.Uint16) motionRange!: number;
  @Field(FieldType.Uint16) staticDampeningStrength!: number;
  @Field(FieldType.Uint16) softStopDampeningStrength!: number;
  @Field(FieldType.Uint8) totalEffectStrength!: number;
  @Field(FieldType.Uint8) integratedSpringStrength!: number;
  @Field(FieldType.Uint8) softStopRange!: number;
  @Field(FieldType.Uint8) softStopStrength!: number;

  /** DirectX constant force direction (-1 or 1). */
  @Field(FieldType.Int8) directXConstantDirection!: number;
  @Field(FieldType.Uint8) directXSpringStrength!: number;
  @Field(FieldType.Uint8) directXConstantStrength!: number;
  @Field(FieldType.Uint8) directXPeriodicStrength!: number;
}

export class HardwareSettings {
  @Field(FieldType.Uint16) encoderCPR!: number;
  @Field(FieldType.Uint16) integralGain!: number;
  @Field(FieldType.Uint8) proportionalGain!: number;

  /** Force feedback enabled (0 = disabled, 1 = enabled). */
  @Field(FieldType.Uint8) forceEnabled!: number;

  /** Debug torque output enabled (0 = disabled, 1 = enabled). */
  @Field(FieldType.Uint8) debugTorque!: number;
  @Field(FieldType.Uint8) amplifierGain!: number;
  @Field(FieldType.Uint8) calibrationMagnitude!: number;
  @Field(FieldType.Uint8) calibrationSpeed!: number;
  @Field(FieldType.Uint8) powerLimit!: number;
  @Field(FieldType.Uint8) brakingLimit!: number;
  @Field(FieldType.Uint8) positionSmoothing!: number;
  @Field(FieldType.Uint8) speedBufferSize!: number;

  /** Encoder direction multiplier (-1 or 1). */
  @Field(FieldType.Int8) encoderDirection!: number;

  /** Force direction multiplier (-1 or 1). */
  @Field(FieldType.Int8) forceDirection!: number;
  @Field(FieldType.Uint8) polePairs!: number;
}

export class AdcSettings {
  @Field(FieldType.Uint16, 3) rAxisMin!: number[];
  @Field(FieldType.Uint16, 3) rAxisMax!: number[];
  @Field(FieldType.Uint8, 3) rAxisSmoothing!: number[];
  @Field(FieldType.Uint8, 3) rAxisToButtonLow!: number[];
  @Field(FieldType.Uint8, 3) rAxisToButtonHigh!: number[];
  @Field(FieldType.Uint8, 3) rAxisInvert!: number[];
}

export class GpioSettings {
  /** Extension mode.  @see {@link ExtensionMode} */
  @Field(FieldType.Uint8) extensionMode!: number;

  /** Pin mode configuration for 10 pins. @see {@link PinMode} */
  @Field(FieldType.Uint8, 10) pinMode!: number[];

  /** Button mode configuration for 32 buttons. @see {@link ButtonMode} */
  @Field(FieldType.Uint8, 32) buttonMode!: number[];

  /** SPI communication mode. @see {@link SpiMode} */
  @Field(FieldType.Uint8) spiMode!: number;

  /** SPI latch mode. @see {@link SpiLatchMode} */
  @Field(FieldType.Uint8) spiLatchMode!: number;
  @Field(FieldType.Uint8) spiLatchDelay!: number;
  @Field(FieldType.Uint8) spiClkPulseLength!: number;
}

export class DirectControl {
  @Field(FieldType.Int16) springForce!: number;
  @Field(FieldType.Int16) constantForce!: number;
  @Field(FieldType.Int16) periodicForce!: number;
  @Field(FieldType.Uint8) forceDrop!: number;
}

/**
 * Real-time device state received from the wheel controller.
 *
 * @remarks
 * This class includes helper properties `positionDegrees` and `torqueNormalized`
 * that are not present in the original C/C++ API.
 */
export class DeviceState {
  @Field(FirmwareVersion) firmwareVersion!: FirmwareVersion;

  /** Registration status (0 = unregistered, 1 = registered). */
  @Field(FieldType.Uint8) isRegistered!: number;

  /** Raw wheel position value. */
  @Field(FieldType.Int16) position!: number;

  /** Raw torque value. */
  @Field(FieldType.Int16) torque!: number;

  /**
   * Wheel position converted to degrees.
   * @remarks Helper property not present in the original C/C++ API.
   */
  positionDegrees!: number; // position in degrees

  /**
   * Torque normalized to [-100, 100] range.
   * @remarks Helper property not present in the original C/C++ API.
   */
  torqueNormalized!: number; // torque as -100 to 100
}

/** Event handler signatures for {@link WheelApi} events. */
export interface WheelEvents {
  /**
   * Emitted when a device is successfully connected.
   * @param device - The connected HID device.
   */
  deviceConnected: (device: HIDDevice) => void;

  /**
   * Emitted when the device is disconnected.
   * @param device - The disconnected HID device.
   */
  deviceDisconnected: (device: HIDDevice) => void;

  /**
   * Emitted when new device state is received.
   * @param state - The current device state.
   */
  stateReceived: (state: DeviceState) => void;

  /**
   * Emitted when an error occurs.
   * @param error - The error that occurred.
   */
  error: (error: Error) => void;
}
