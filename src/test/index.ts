import assert from 'assert';
import { describe, test } from "node:test";
import { LocallyConfig } from '../locally.js';
import util from "util"
import Locally from "../index.js";
console.clear()
describe('initiating locally class', async () => {
  const conf: LocallyConfig = {
    loadConfig: true,
    force: false,
    storage: {
      driver: 'file',
      path: './test',
    },
    hash: {
      key: "string",
      shakeCount: 1,
      enabled: false
    }
  }
  let app;
    it("must instantiate app correctly", async () => {
    app = await Locally.init(conf)
    assert.equal(app.config.enabled, true)
  })

  it("must not throw an error if force is enabled", async () => {
    conf.force = true
    app = await Locally.init(conf)
  })

  it("must throw an error if loadConfig is not equal to the main config", async () => {
    conf.loadConfig = true
    conf.force = false
    conf.hash.key = "test-string"
    // console.log(await Locally.init(conf), "@s")

    assert.throws(async () => {
      await Locally.init(conf)
    }, "Error: invalid key provided")
  })
})