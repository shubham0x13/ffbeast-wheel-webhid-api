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
  @Field(FieldType.Uint32, 3) serialKey!: number[];
  @Field(FieldType.Uint32, 3) deviceId!: number[];
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
  @Field(FieldType.Int8) directXConstantDirection!: number;
  @Field(FieldType.Uint8) directXSpringStrength!: number;
  @Field(FieldType.Uint8) directXConstantStrength!: number;
  @Field(FieldType.Uint8) directXPeriodicStrength!: number;
}

export class HardwareSettings {
  @Field(FieldType.Uint16) encoderCPR!: number;
  @Field(FieldType.Uint16) integralGain!: number;
  @Field(FieldType.Uint8) proportionalGain!: number;
  @Field(FieldType.Uint8) forceEnabled!: number;
  @Field(FieldType.Uint8) debugTorque!: number;
  @Field(FieldType.Uint8) amplifierGain!: number;
  @Field(FieldType.Uint8) calibrationMagnitude!: number;
  @Field(FieldType.Uint8) calibrationSpeed!: number;
  @Field(FieldType.Uint8) powerLimit!: number;
  @Field(FieldType.Uint8) brakingLimit!: number;
  @Field(FieldType.Uint8) positionSmoothing!: number;
  @Field(FieldType.Uint8) speedBufferSize!: number;
  @Field(FieldType.Int8) encoderDirection!: number;
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
  @Field(FieldType.Uint8) extensionMode!: number; // ExtensionModeEnum
  @Field(FieldType.Uint8, 10) pinMode!: number[]; // PinModeEnum
  @Field(FieldType.Uint8, 32) buttonMode!: number[]; // ButtonModeEnum
  @Field(FieldType.Uint8) spiMode!: number;
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

export class DeviceState {
  @Field(FirmwareVersion) firmwareVersion!: FirmwareVersion;
  @Field(FieldType.Uint8) isRegistered!: number;
  @Field(FieldType.Int16) position!: number;
  @Field(FieldType.Int16) torque!: number;

  // Helper properties
  positionDegrees!: number; // position in degrees
  torqueNormalized!: number; // torque as -100 to 100
}

export interface WheelEvents {
  deviceConnected: (device: HIDDevice) => void;
  deviceDisconnected: (device: HIDDevice) => void;
  stateReceived: (state: DeviceState) => void;
  error: (error: Error) => void;
}
