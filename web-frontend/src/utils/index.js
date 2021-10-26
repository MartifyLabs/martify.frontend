export const fromAscii = (hex) => Buffer.from(hex).toString("hex");

export const fromHex = (hex) => Buffer.from(hex, "hex");

export const toHex = (bytes) => Buffer.from(bytes).toString("hex");
