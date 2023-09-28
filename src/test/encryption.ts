import assert from 'assert';
import { describe, test } from "node:test";
import { driverConfig, encryptorConfig } from "./mocks/encryptor"
import Encryptor from '../modules/Encryptor';
console.clear()
describe('initiating encryptor class', () => {
  let config = encryptorConfig;
  config.driverOptions = { options: "test" }
  let encryptor = new Encryptor(config)
  let encStr = ''
  const testdata = { test: "testdata" };
  it(`must have a driver`, () => {
    assert.equal(encryptor.driver.config.options, "test")
  })

  it(`must encrypt data`, () => {
    encStr = encryptor.encrypt(testdata)
    assert.notEqual(encStr, undefined)
    assert.notEqual(encStr, null)
  })

  it(`must decrypt data correctly`, () => {
    assert.deepEqual(encryptor.decrypt(encStr), testdata)
  })

  it(`must initiate class properly`, () => {
    delete config.driverOptions
    let encryptor = new Encryptor(config)
    assert.equal(encryptor.config.driver, "CryptoJs")
  })
})