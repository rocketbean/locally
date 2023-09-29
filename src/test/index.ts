import assert from "assert";
import { describe, test } from "node:test";
import { LocallyConfig } from "../locally.js";
import Locally from "../index.js";
console.clear();

async function assertThrowsAsync(fn, err) {
  let f = () => {};
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
  } finally {
    assert.throws(f, err);
  }
}
describe("initiating locally class", async () => {
  const conf: LocallyConfig = {
    loadConfig: true,
    force: false,
    storage: {
      driver: "file",
      path: "./test",
    },
    hash: {
      key: "string",
      shakeCount: 1,
      enabled: false,
    },
  };
  let app;
  it("must instantiate app correctly", async () => {
    app = await Locally.init(conf);
    assert.equal(app.config.enabled, true);
  });

  it("must not throw an error if loadConfig/force is enabled", async () => {
    conf.force = true;
    app = await Locally.init(conf);
    console.log(app);
  });

  it("must throw an error if loadConfig is not equal to the main config", async () => {
    conf.loadConfig = true;
    conf.force = false;
    conf.hash.key = "test-string";
    conf.hash.enabled = true;
    await assertThrowsAsync(
      async () => await Locally.init(conf),
      new Error("invalid key provided"),
    );
  });
});
