import { DriverInterface } from "./driver";
import crypto from "crypto-js"

export type CryptoJSDriver = {
  enabled?: boolean,
  alg?: 'AES' | 'sha256' | 'hmacSHA512' | 'Base64' | 'HmacSHA1',
  key: string,
  shakeCount: number

}

export default class CryptoJs implements DriverInterface {

  private _defaults = {
    enabled: true,
    alg: 'AES',
    shakeCount: 1
  }

  constructor(public config: CryptoJSDriver) {
    this.config = Object.assign(this._defaults, this.config)
    this.validateConfiguration()
  }

  validateConfiguration() {
    if (!crypto[this.config.alg]) {
      throw new Error("InvalidValue::Not a valid algorithm value!")
    }
  }

  encrypt(str: string | object = '') {
    if (typeof str !== "string") {
      str = JSON.stringify(str, null, 2)
    }
    for (let index = 0; index < this.config.shakeCount; index++) {
      str = this.process(str, "encrypt");
      str = str.toString();
    }

    return str;
  }

  decrypt(str: any) {
    for (let index = 0; index < this.config.shakeCount; index++) {
      str = this.process(str, "decrypt")
      str = str.toString(crypto.enc.Utf8);
    }
    return str;
  }

  process(str, method) {
    return crypto[this.config.alg][method](str, this.config.key)
  }

}