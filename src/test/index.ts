import assert from "assert";
import { describe, test } from "node:test";
import { LocallyConfig } from "../locally.js";
import { assertThrowsAsync } from "./helper.js"
import { LocallyConfigMock } from "./mocks/app.js"
import Locally from "../index.js";
import { RequirementError, MismatchError } from "../modules/Model/Error.js";
console.clear();


describe("initiating locally class", async () => {
  const conf: LocallyConfig = <LocallyConfig>LocallyConfigMock();
  let app: Locally;
  before(async () => {
    app = await Locally.init(conf);
    await app.reset()
  })
  it("must instantiate app correctly", async () => {
    app = await Locally.init(conf);
    assert.equal(app.config.enabled, true);
  });

  it("must not throw an error if loadConfig/force is enabled", async () => {
    conf.loadConfig = true;
    conf.force = true;
    conf.hash.enabled = true;
    conf.hash.key = "test-string"
    app = await Locally.init(conf);
    assert.equal(app.status, "ok")
  });

  it("must throw an error if loadConfig is not equal to the main config", async () => {
    conf.loadConfig = true;
    conf.force = false;
    conf.hash.key = "test-string2";
    conf.hash.enabled = true;
    await assertThrowsAsync(
      async () => await Locally.init(conf),
      new Error("invalid key provided"),
    );
  });
});


describe("initiating locally models", async () => {
  const conf: LocallyConfig = <LocallyConfig>LocallyConfigMock({ storage: { path: "./test/mods" } });
  let app: Locally;
  let modelName = "test-model"
  let propKey = "testKey"
  before(async () => {
    app = await Locally.init(conf);
    await app.reset()
  })

  it("must instantiate app correctly", async () => {
    app = await Locally.init(conf);
    assert.equal(app.config.enabled, true);
  });

  it("must create and store model", async () => {
    app.createModel(modelName, {
      [propKey]: {
        type: String,
        required: true
      },
      propInt: {
        type: Number
      }
    });

    assert(modelName in app.models)
  })

  it("must throw a type mismatch/missing error", async () => {
    let data = {
      [propKey]: 123
    }
    await assertThrowsAsync(
      async () => await app.models[modelName].create(data),
      new RequirementError(propKey),
    );
    delete data[propKey]
    await assertThrowsAsync(
      async () => await app.models[modelName].create(data),
      new MismatchError(propKey),
    );
  })

  it("must be able to store data", async () => {
    app.models[modelName].create([{
      [propKey]: "data",
      propInt: 2
    },
    {
      [propKey]: "testdata",
      propInt: 3
    },
    {
      [propKey]: "deletethis",
      propInt: 4
    },
    {
      [propKey]: "updatethis",
      propInt: 5
    },
    ])
    let fetchData = await app.models[modelName].find({ [propKey]: "data" })
    let beNull = await app.models[modelName].find({ [propKey]: "data2" })
    assert.equal(fetchData[propKey], "data")
    assert.equal(beNull, null)
  });

  it(`must be able to fetch data`, async () => {
    let data = await app.models[modelName].find({
      propInt: {
        value: 3,
        operation: (value, index) => {
          return value >= index && value < 5;
        }
      }
    });
    assert.equal(data.length, 2);
    assert.deepEqual(data,
      [
        { testKey: 'testdata', propInt: 3 },
        { testKey: 'deletethis', propInt: 4 }
      ])
  });

  it(`must be able to delete data`, async () => {
    await app.models[modelName].delete({
      [propKey]: {
        operation: (value, index) => {
          return value.includes("deletethis");
        }
      }
    });

    assert.deepEqual(app.models[modelName].storage, [
      { testKey: 'data', propInt: 2 },
      { testKey: 'testdata', propInt: 3 },
      { testKey: 'updatethis', propInt: 5 }
    ]);

  })

  it(`must be able to updata data`, async () => {
    await app.models[modelName].update({
      [propKey]: "updatethis"
    }, {
      testKey: "updated",
      propInt: 7
    });
    assert.deepEqual(app.models[modelName].storage, [
      { testKey: 'data', propInt: 2 },
      { testKey: 'testdata', propInt: 3 },
      { testKey: 'updated', propInt: 7 }
    ]);
  })

});