export enum ExtensionMode {
  None = 0,
  Custom = 1,
}

export enum PinMode {
  None = 0,
  Gpio = 1,
  Analog = 2,
  SpiCs = 3,
  SpiSck = 4,
  SpiMiso = 5,
  EnableEffects = 6,
  CenterReset = 7,
  BrakingPwm = 8,
  EffectLed = 9,
  Reboot = 10,
}

export enum ButtonMode {
  None = 0,
  Normal = 1,
  Inverted = 2,
  Pulse = 3,
  PulseInverted = 4,
}

export enum AmplifierGain {
  Gain80 = 0,
  Gain40 = 1,
  Gain20 = 2,
  Gain10 = 3,
}

export enum SpiMode {
  Mode0 = 0,
  Mode1 = 1,
  Mode2 = 2,
  Mode3 = 3,
}

export enum SpiLatchMode {
  LatchUp = 0,
  LatchDown = 1,
}

export enum ReportData {
  CommandReboot = 0x01,
  CommandSaveSettings = 0x02,
  CommandDfuMode = 0x03,
  DataOverrideData = 0x10,
  DataFirmwareActivationData = 0x13,
  DataSettingsFieldData = 0x14,
  CommandResetCenter = 0x04,
}

/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum ReportType {
  JoystickInput = 0x01,
  CreateNewEffect = 0x11,
  PIDBlockLoad = 0x12,
  PIDPool = 0x13,
  SetEffect = 0x11,
  SetEnvelope = 0x12,
  SetCondition = 0x13,
  SetPeriodic = 0x14,
  SetConstantForce = 0x15,
  SetRampForce = 0x16,
  EffectOperation = 0x1a,
  PIDState = 0x12,
  PIDBlockFree = 0x1b,
  PIDDeviceControl = 0x1c,
  DeviceGain = 0x1d,
  HardwareSettingsFeature = 0x21,
  EffectSettingsFeature = 0x22,
  FirmwareLicenseFeature = 0x25,
  GpioSettingsFeature = 0xa1,
  AdcSettingsFeature = 0xa2,
  GenericInputOutput = 0xa3,
}
/* eslint-enable */

export enum SettingField {
  DirectXConstantDirection = 0,
  DirectXSpringStrength = 1,
  DirectXConstantStrength = 2,
  DirectXPeriodicStrength = 3,

  TotalEffectStrength = 4,
  MotionRange = 5,
  SoftStopStrength = 6,
  SoftStopRange = 7,
  StaticDampeningStrength = 8,
  SoftStopDampeningStrength = 9,

  ForceEnabled = 11,
  DebugTorque = 12,
  AmplifierGain = 13,

  CalibrationMagnitude = 15,
  CalibrationSpeed = 16,

  PowerLimit = 17,
  BrakingLimit = 18,
  PositionSmoothing = 19,
  SpeedBufferSize = 20,

  EncoderDirection = 21,
  ForceDirection = 22,
  PolePairs = 23,
  EncoderCPR = 24,

  PGain = 25,
  IGain = 26,

  ExtensionMode = 27,
  PinMode = 28,
  ButtonMode = 29,

  SpiMode = 30,
  SpiLatchMode = 31,
  SpiLatchDelay = 32,
  SpiClkPulseLength = 33,

  AdcMinDeadZone = 34,
  AdcMaxDeadZone = 35,
  AdcToButtonLow = 36,
  AdcToButtonHigh = 37,
  AdcSmoothing = 38,
  AdcInvert = 39,

  ResetCenterOnZ0 = 41,
  IntegratedSpringStrength = 43,
}

/**
 * Binary field type identifiers for parsing HID reports.
 * @internal
 */
export enum FieldType {
  Int8,
  Uint8,
  Int16,
  Uint16,
  Int32,
  Uint32,
  Float32,
}

/**
 * Maps {@link SettingField} values to their corresponding {@link FieldType}.
 *
 * @remarks
 * This mapping is based on the struct definitions in the original C++ `wheel_api.h`.
 *
 * @internal
 */
export const FIELD_TYPE_MAP: Readonly<Record<SettingField, FieldType>> = {
  // EffectSettings
  [SettingField.MotionRange]: FieldType.Uint16,
  [SettingField.StaticDampeningStrength]: FieldType.Uint16,
  [SettingField.SoftStopDampeningStrength]: FieldType.Uint16,
  [SettingField.TotalEffectStrength]: FieldType.Uint8,
  [SettingField.IntegratedSpringStrength]: FieldType.Uint8,
  [SettingField.SoftStopRange]: FieldType.Uint8,
  [SettingField.SoftStopStrength]: FieldType.Uint8,
  [SettingField.DirectXConstantDirection]: FieldType.Int8,
  [SettingField.DirectXSpringStrength]: FieldType.Uint8,
  [SettingField.DirectXConstantStrength]: FieldType.Uint8,
  [SettingField.DirectXPeriodicStrength]: FieldType.Uint8,

  // HardwareSettings
  [SettingField.EncoderCPR]: FieldType.Uint16,
  [SettingField.IGain]: FieldType.Uint16,
  [SettingField.PGain]: FieldType.Uint8,
  [SettingField.ForceEnabled]: FieldType.Uint8,
  [SettingField.DebugTorque]: FieldType.Uint8,
  [SettingField.AmplifierGain]: FieldType.Uint8,
  [SettingField.CalibrationMagnitude]: FieldType.Uint8,
  [SettingField.CalibrationSpeed]: FieldType.Uint8,
  [SettingField.PowerLimit]: FieldType.Uint8,
  [SettingField.BrakingLimit]: FieldType.Uint8,
  [SettingField.PositionSmoothing]: FieldType.Uint8,
  [SettingField.SpeedBufferSize]: FieldType.Uint8,
  [SettingField.EncoderDirection]: FieldType.Int8,
  [SettingField.ForceDirection]: FieldType.Int8,
  [SettingField.PolePairs]: FieldType.Uint8,

  // GpioExtensionSettings
  [SettingField.ExtensionMode]: FieldType.Uint8,
  [SettingField.PinMode]: FieldType.Uint8,
  [SettingField.ButtonMode]: FieldType.Uint8,
  [SettingField.SpiMode]: FieldType.Uint8,
  [SettingField.SpiLatchMode]: FieldType.Uint8,
  [SettingField.SpiLatchDelay]: FieldType.Uint8,
  [SettingField.SpiClkPulseLength]: FieldType.Uint8,

  // AdcExtensionSettings
  [SettingField.AdcSmoothing]: FieldType.Uint8,
  [SettingField.AdcToButtonLow]: FieldType.Uint8,
  [SettingField.AdcToButtonHigh]: FieldType.Uint8,
  [SettingField.AdcInvert]: FieldType.Uint8,
  [SettingField.AdcMinDeadZone]: FieldType.Uint16,
  [SettingField.AdcMaxDeadZone]: FieldType.Uint16,

  [SettingField.ResetCenterOnZ0]: FieldType.Uint8,
};
