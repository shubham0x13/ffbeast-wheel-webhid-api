/**
 * Binary field parser for HID report deserialization.
 *
 * @remarks
 * Provides decorators and utilities for parsing binary HID reports
 * into TypeScript class instances based on field metadata.
 *
 * @internal
 * @packageDocumentation
 */

import { FieldType } from "./enums.js";

const FIELDS_METADATA = Symbol("FIELDS_METADATA");

interface FieldInfo {
  key: string;
  type: FieldType | (new () => any);
  length: number;
}

const SIZES: Record<FieldType, number> = {
  [FieldType.Uint8]: 1,
  [FieldType.Int8]: 1,
  [FieldType.Uint16]: 2,
  [FieldType.Int16]: 2,
  [FieldType.Uint32]: 4,
  [FieldType.Int32]: 4,
};

const READERS: Record<FieldType, (view: DataView, offset: number) => number> = {
  [FieldType.Uint8]: (v, o) => v.getUint8(o),
  [FieldType.Int8]: (v, o) => v.getInt8(o),
  [FieldType.Uint16]: (v, o) => v.getUint16(o, true),
  [FieldType.Int16]: (v, o) => v.getInt16(o, true),
  [FieldType.Uint32]: (v, o) => v.getUint32(o, true),
  [FieldType.Int32]: (v, o) => v.getInt32(o, true),
};

function isFieldType(type: any): type is FieldType {
  return typeof type === "number" && type in SIZES;
}

export function Field(type: FieldType | (new () => any), length = 1) {
  return (target: any, key: string): void => {
    const constructor = target.constructor;

    // Copy parent fields if this is the first field on this class
    if (!Object.prototype.hasOwnProperty.call(constructor, FIELDS_METADATA)) {
      const parentFields = constructor[FIELDS_METADATA] || [];
      constructor[FIELDS_METADATA] = [...parentFields];
    }

    constructor[FIELDS_METADATA].push({ key, type, length });
  };
}

export function parse<T>(view: DataView, Class: new () => T): T {
  const instance: any = new Class();
  const fields: FieldInfo[] = (Class as any)[FIELDS_METADATA] || [];
  let offset = 0;

  for (const field of fields) {
    // Check if it's a nested class
    if (!isFieldType(field.type)) {
      const nestedClass = field.type;
      const nestedSize = getSchemaSize(nestedClass);

      if (offset + nestedSize > view.byteLength) {
        throw new RangeError(
          `Buffer overflow at nested field "${field.key}":  needs ${nestedSize} bytes at offset ${offset}, but buffer has ${view.byteLength} bytes total. `
        );
      }

      const nestedView = new DataView(
        view.buffer,
        view.byteOffset + offset,
        nestedSize
      );
      instance[field.key] = parse(nestedView, nestedClass);
      offset += nestedSize;
      continue;
    }

    // Handle regular field
    const size = SIZES[field.type];
    const read = READERS[field.type];
    const totalSize = size * field.length;

    if (offset + totalSize > view.byteLength)
      throw new RangeError(
        `Buffer overflow at field "${field.key}":  needs ${totalSize} bytes at offset ${offset}, but buffer has ${view.byteLength} bytes total. `
      );

    if (field.length > 1) {
      const array: number[] = [];
      for (let i = 0; i < field.length; i++)
        array.push(read(view, offset + i * size));
      instance[field.key] = array;
    } else {
      instance[field.key] = read(view, offset);
    }

    offset += totalSize;
  }

  return instance;
}

export function getSchemaSize<T>(Class: new () => T): number {
  const fields: FieldInfo[] = (Class as any)[FIELDS_METADATA] || [];

  return fields.reduce((total, field) => {
    if (!isFieldType(field.type)) {
      return total + getSchemaSize(field.type);
    }
    return total + SIZES[field.type] * field.length;
  }, 0);
}
