
import { DriverConfig, _drivers } from "./drivers/driver"
export type EncryptorConfig = {
  enabled?: boolean,
  driver?: string,
  key: string,
  shakeCount: number
  driverOptions?: DriverConfig
}

export default class Encryptor {
  private _defaults = {
    driver: 'CryptoJs',
    enabled: true,
    driverOptions: {
      alg: 'AES'
    }
  }

  public driver;
  constructor(public config: EncryptorConfig) {
    this.config = Object.assign(this._defaults, config)
    this.setDriver()
  }

  encrypt(data: any = '') {
    if (this.config.enabled) 
      return this.driver.encrypt(data)
    else return data;
  }

  decrypt(data: any) {
    try {
      return this.driver.decrypt(data)
    } catch (e) {
      return false
    }
  }

  JsonParser(str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      throw new Error("DecErr::decryption error")
    }
  }

  setDriver() {
    this.driver = new _drivers[this.config.driver]({
      ...this.config.driverOptions,
      enabled: this.config.enabled,
      key: this.config.key,
      shakeCount: this.config.shakeCount
    })
  }
}