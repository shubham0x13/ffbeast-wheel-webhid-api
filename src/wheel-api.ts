import { EventEmitter } from "eventemitter3";
import {
  AdcSettings,
  DeviceState,
  DirectControl,
  EffectSettings,
  FirmwareLicense,
  GpioSettings,
  HardwareSettings,
  type WheelEvents,
} from "./types";
import {
  INTERFACE_0_USAGE,
  INTERFACE_0_USAGE_PAGE,
  PID,
  REPORT_SIZE,
  VID,
} from "./constants";
import {
  FIELD_TYPE_MAP,
  FieldType,
  ReportData,
  ReportType,
  SettingField,
} from "./enums";
import {
  convertPositionToDegrees,
  isTargetDevice,
  normalizeTorque,
} from "./utils";
import { parse } from "./field-parser";

/**
 * WebHID-based API for communicating with the wheel controller.
 *
 * @example
 * ```ts
 * import { WheelApi } from "@shubham0x13/ffbeast-wheel-webhid-api";
 *
 * const wheel = new WheelApi();
 *
 * wheel.on("stateReceived", (state) => {
 *   console. log("Position:", state.position);
 * });
 *
 * await wheel.connect();
 *
 * // ... later
 *
 * await wheel.disconnect();
 * wheel.destroy();
 * ```
 */
export class WheelApi extends EventEmitter<WheelEvents> {
  /**
   * Last received device state.
   * @returns Device state, or `null` if no state received yet.
   */
  public get lastState(): Readonly<DeviceState> | null {
    return this._lastState ? { ...this._lastState } : null;
  }

  /**
   * Current wheel position in degrees.
   * @returns Position in degrees, or `null` if not connected.
   */
  public get positionDegrees(): number | null {
    if (!this.lastState || this.cachedMotionRange === null) return null;
    return convertPositionToDegrees(
      this.lastState.position,
      this.cachedMotionRange
    );
  }

  /**
   * Current torque normalized to [-100, 100] range.
   * @returns Normalized torque, or `null` if not connected.
   */
  public get torqueNormalized(): number | null {
    if (!this.lastState) return null;
    return normalizeTorque(this.lastState.torque);
  }

  /**
   * Current firmware version string.
   * @returns Version string (e.g., "1.2.3"), or `null` if not connected.
   */
  public get firmwareVersion(): string | null {
    if (!this.lastState) return null;
    const v = this.lastState.firmwareVersion;
    return `${v.major}.${v.minor}.${v.patch}`;
  }

  /**
   * Current firmware release type.
   * @returns Release type number, or `null` if not connected.
   */
  public get firmwareReleaseType(): number | null {
    if (!this.lastState) return null;
    return this.lastState.firmwareVersion.releaseType;
  }

  /**
   * Device connection status.
   * @returns `true` if connected and opened.
   */
  public get isConnected(): boolean {
    return this.device?.opened ?? false;
  }

  private device: HIDDevice | null = null;
  private _lastState: DeviceState | null = null;
  private cachedMotionRange: number | null = null;

  constructor() {
    super();

    if (!WheelApi.isSupported())
      throw new Error("WebHID is not supported in this browser.");

    navigator.hid.addEventListener("connect", this.handleConnect);
    navigator.hid.addEventListener("disconnect", this.handleDisconnect);
  }

  /**
   * Checks if WebHID is supported in the current browser.
   * @returns `true` if supported (Chrome/Edge/Opera).
   */
  public static isSupported(): boolean {
    return "hid" in navigator;
  }

  /**
   * Opens the browser's device picker to connect to a wheel.
   * @returns `true` if connection was successful.
   */
  public async connect(): Promise<boolean> {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [
          {
            vendorId: VID,
            productId: PID,
            usagePage: INTERFACE_0_USAGE_PAGE,
            usage: INTERFACE_0_USAGE,
          },
        ],
      });

      if (devices.length === 0) return false;

      return await this.openDevice(devices[0]!);
    } catch (error) {
      console.warn("User cancelled connection or request failed:", error);
      throw error;
    }
  }

  /**
   * Attempts to reconnect to a previously authorized device.
   * @returns `true` if a device was found and connected.
   */
  public async tryAutoConnect(): Promise<boolean> {
    const devices = await navigator.hid.getDevices();
    const validDevice = devices.find((d) => isTargetDevice(d));
    if (validDevice) return await this.openDevice(validDevice);
    return false;
  }

  /**
   * Disconnects from the current device.
   */
  public async disconnect(): Promise<void> {
    if (!this.device) return;

    const deviceToDisconnect = this.device;

    try {
      this.device.removeEventListener("inputreport", this.handleInputReport);
      await this.device.close();
    } catch (error) {
      console.warn("Error closing device:", error);
    } finally {
      this.device = null;
      this._lastState = null;
      this.cachedMotionRange = null;
      this.emit("deviceDisconnected", deviceToDisconnect);
    }
  }

  /**
   * Cleans up all resources and event listeners.
   * Must be called when the API instance is no longer needed.
   */
  public async destroy(): Promise<void> {
    await this.disconnect();
    navigator.hid.removeEventListener("connect", this.handleConnect);
    navigator.hid.removeEventListener("disconnect", this.handleDisconnect);
    this.removeAllListeners();
  }

  /**
   * Reads the current effect settings from the device.
   * @returns Effect settings object.
   */
  public async readEffectSettings(): Promise<EffectSettings> {
    const view = await this.getFeatureReport(ReportType.EffectSettingsFeature);
    return parse<EffectSettings>(view, EffectSettings);
  }

  /**
   * Reads the current hardware settings from the device.
   * @returns Hardware settings object.
   */
  public async readHardwareSettings(): Promise<HardwareSettings> {
    const view = await this.getFeatureReport(
      ReportType.HardwareSettingsFeature
    );
    return parse<HardwareSettings>(view, HardwareSettings);
  }

  /**
   * Reads the current GPIO extension settings from the device.
   * @returns GPIO settings object.
   */
  public async readGpioExtensionSettings(): Promise<GpioSettings> {
    const view = await this.getFeatureReport(ReportType.GpioSettingsFeature);
    return parse<GpioSettings>(view, GpioSettings);
  }

  /**
   * Reads the current ADC extension settings from the device.
   * @returns ADC settings object.
   */
  public async readAdcExtensionSettings(): Promise<AdcSettings> {
    const view = await this.getFeatureReport(ReportType.AdcSettingsFeature);
    return parse<AdcSettings>(view, AdcSettings);
  }

  /**
   * Reads the firmware license information from the device.
   * @returns Firmware license object.
   */
  public async readFirmwareLicense(): Promise<FirmwareLicense> {
    const view = await this.getFeatureReport(ReportType.FirmwareLicenseFeature);
    return parse<FirmwareLicense>(view, FirmwareLicense);
  }

  /**
   * Reads all settings from the device sequentially.
   * @returns Object containing all settings groups.
   */
  public async readAllSettings(): Promise<{
    effects: EffectSettings;
    hardware: HardwareSettings;
    gpio: GpioSettings;
    adc: AdcSettings;
  }> {
    const effects = await this.readEffectSettings();
    const hardware = await this.readHardwareSettings();
    const gpio = await this.readGpioExtensionSettings();
    const adc = await this.readAdcExtensionSettings();

    return {
      effects,
      hardware,
      gpio,
      adc,
    };
  }

  /**
   * Writes a single setting value to the device.
   * @param field - The setting field to write.
   * @param index - Sub-index for array-based settings.
   * @param value - The value to write.
   */
  public async sendSetting(
    field: SettingField,
    index: number,
    value: number | boolean
  ): Promise<void> {
    if (!this.device?.opened) throw new Error("Device is not connected");

    // Convert boolean to number (1/0)
    const numValue = typeof value === "boolean" ? Number(value) : value;

    const type = FIELD_TYPE_MAP[field];
    if (type === undefined)
      throw new Error(`Unsupported field type for SettingsField ${field}`);

    const buffer = new ArrayBuffer(REPORT_SIZE);
    const view = new DataView(buffer);

    // Header
    view.setUint8(0, ReportData.DataSettingsFieldData);
    view.setUint8(1, field);
    view.setUint8(2, index);

    // Value Wrapper starts at offset 3
    const VAL_OFFSET = 3;

    switch (type) {
      case FieldType.Int8:
        view.setInt8(VAL_OFFSET, numValue);
        break;
      case FieldType.Uint8:
        view.setUint8(VAL_OFFSET, numValue);
        break;
      case FieldType.Int16:
        view.setInt16(VAL_OFFSET, numValue, true);
        break;
      case FieldType.Uint16:
        view.setUint16(VAL_OFFSET, numValue, true);
        break;
    }

    await this.device.sendReport(
      ReportType.GenericInputOutput,
      new Uint8Array(buffer)
    );

    // Update cached values if necessary
    if (field === SettingField.MotionRange) {
      this.cachedMotionRange = numValue;
    }
  }

  /**
   * Sends direct force feedback control to the device.
   * @param control - Force feedback control values.
   */
  public async sendDirectControl(control: DirectControl): Promise<void> {
    if (!this.device?.opened) throw new Error("Device is not connected");

    const buffer = new ArrayBuffer(REPORT_SIZE);
    const view = new DataView(buffer);

    view.setUint8(0, ReportData.DataOverrideData);
    // DirectControlTypeDef starts at offset 1
    view.setInt16(1, control.springForce, true);
    view.setInt16(3, control.constantForce, true);
    view.setInt16(5, control.periodicForce, true);
    view.setUint8(7, control.forceDrop);

    await this.device.sendReport(
      ReportType.GenericInputOutput,
      new Uint8Array(buffer)
    );
  }

  /**
   * Sends the firmware activation license key to the device.
   * Expected format: "XXXXXXXX-XXXXXXXX-XXXXXXXX" (Hex strings)
   * @param licenseStr - The license key string.
   * @returns `true` if the format was valid and sent, `false` otherwise.
   */
  public async sendFirmwareActivation(license: string): Promise<boolean> {
    if (!this.device?.opened) throw new Error("Device is not connected");

    const chunks = license.trim().split("-");

    if (chunks.length !== 3) {
      console.warn("Invalid license format: Incorrect number of segments.");
      return false;
    }

    const buffer = new ArrayBuffer(REPORT_SIZE);
    const view = new DataView(buffer);

    view.setUint8(0, ReportData.DataFirmwareActivationData);

    for (let i = 0; i < 3; i++) {
      const chunk = chunks[i]!;

      // Each segment must be exactly 8 hex characters
      if (!/^[0-9A-Fa-f]{8}$/.test(chunk)) {
        console.warn(
          `Invalid license format: Segment ${
            i + 1
          } ("${chunk}") must be exactly 8 hexadecimal characters.`
        );
        return false;
      }

      const value = parseInt(chunk, 16);

      // Write 32-bit integer (Little Endian)
      // Offset starts at 1 (after command byte), then increments by 4 bytes per chunk
      // Chunk 0: byte 1, Chunk 1: byte 5, Chunk 2: byte 9
      view.setUint32(1 + i * 4, value, true);
    }

    await this.device.sendReport(
      ReportType.GenericInputOutput,
      new Uint8Array(buffer)
    );
    return true;
  }

  /**
   * Saves current settings to flash and reboots the controller.
   */
  public async saveAndReboot(): Promise<void> {
    await this.sendGenericCommand(ReportData.CommandSaveSettings);
  }

  /**
   * Reboots the controller without saving settings.
   */
  public async rebootController(): Promise<void> {
    await this.sendGenericCommand(ReportData.CommandReboot);
  }

  /**
   * Switches the device to DFU mode for firmware updates.
   */
  public async switchToDfu(): Promise<void> {
    await this.sendGenericCommand(ReportData.CommandDfuMode);
  }

  /**
   * Sets the current wheel position as center.
   */
  public async resetWheelCenter(): Promise<void> {
    await this.sendGenericCommand(ReportData.CommandResetCenter);
  }

  // ------------------------------------------------------------------------
  // Event Handlers
  // ------------------------------------------------------------------------

  private handleConnect = async (event: HIDConnectionEvent) => {
    if (this.device?.opened) return;
    if (isTargetDevice(event.device)) {
      const success = await this.openDevice(event.device);
      if (!success) {
        this.emit("error", new Error("Failed to auto-connect to device"));
      }
    }
  };

  private handleDisconnect = async (event: HIDConnectionEvent) => {
    if (event.device === this.device) await this.disconnect();
  };

  private handleInputReport = (event: HIDInputReportEvent) => {
    try {
      if (event.reportId != ReportType.GenericInputOutput) return;

      if (!this.cachedMotionRange) {
        console.warn("Received device state before motion range was cached");
        return;
      }

      const data = event.data;

      const newState: DeviceState = parse<DeviceState>(data, DeviceState);
      newState.positionDegrees = convertPositionToDegrees(
        newState.position,
        this.cachedMotionRange
      );
      newState.torqueNormalized = normalizeTorque(newState.torque);

      this._lastState = newState;
      this.emit("stateReceived", newState);
    } catch (error) {
      console.error("Error handling input report:", error);
      this.emit("error", error as Error);
    }
  };

  // ------------------------------------------------------------------------
  // Private Helpers
  // ------------------------------------------------------------------------

  private async openDevice(device: HIDDevice): Promise<boolean> {
    try {
      this.device = device;
      if (!this.device.opened) await this.device.open();

      // Cache motion range from effect settings
      const setting = await this.readEffectSettings();
      this.cachedMotionRange = setting.motionRange;

      this.device.addEventListener("inputreport", this.handleInputReport);

      this.emit("deviceConnected", this.device);
      return true;
    } catch (error) {
      console.error("Failed to open device:", error);

      if (this.device?.opened) {
        try {
          await this.device.close();
        } catch (closeError) {
          console.warn("Error closing device after failed open:", closeError);
        }
      }
      this.device = null;
      this.cachedMotionRange = null;

      return false;
    }
  }

  private async sendGenericCommand(reportData: ReportData): Promise<void> {
    if (!this.device?.opened) throw new Error("Device is not connected");

    const data = new Uint8Array(REPORT_SIZE);
    data[0] = reportData;
    await this.device.sendReport(ReportType.GenericInputOutput, data);
  }

  private async getFeatureReport(reportId: number): Promise<DataView> {
    if (!this.device?.opened) throw new Error("Device is not connected");

    const view = await this.device.receiveFeatureReport(reportId);
    // Skip report ID byte (index 0)
    return new DataView(view.buffer, view.byteOffset + 1, view.byteLength - 1);
  }
}
