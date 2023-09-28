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
    let result = ''
    if (typeof str !== "string") {
      str = JSON.stringify(str, null, 2)
    }
    for (let index = 0; index < this.config.shakeCount; index++) {
      result = this.process(str, "encrypt")
    }
    return result.toString() ?? result;
  }


  decrypt(str: any) {
    let result;
    for (let index = 0; index < this.config.shakeCount; index++) {
      result = this.process(str, "decrypt")
    }
    return result.toString(crypto.enc.Utf8);
  }

  process(str, method) {
    return crypto[this.config.alg][method](str, this.config.key)
  }

}