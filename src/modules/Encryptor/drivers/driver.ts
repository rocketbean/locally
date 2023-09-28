
import CryptoJs from "./crypto"

export interface DriverInterface {
  encrypt(data?)
  decrypt(data?)
}

export type DriverConfig = {
  options: {
    alg?: string
  }
}

export const _drivers = {
  CryptoJs
}