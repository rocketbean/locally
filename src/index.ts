import { AppInterface, LocallyConfig } from "./locally";
import { v4 } from "uuid";
import Model from "./modules/Model";
import Handler from "./Handler"

export default class Locally implements AppInterface {
  public id;
  public status: "initiated" | "connected" | "destroyed" | "disconnected" = "disconnected";
  /** app status
   *  - Initiated
   * modules are loaded, 
   * configs are validated
   * and ready to connect/update the connection
   *  - Connected
   * ready to perform model actions,
   * configured,
   * ready to make updates in config
   * - Disconnected
   * no actions will be allowed.
   */
  private storage;
  private hash;
  private _models = {};
  private _defaults = {
    enabled: true,
    storage: {
      driver: "file",
      path: "./locally",
      basePath: `../${__dirname}`,
    },
  };
  private initiated: boolean = false;
  private handler: Handler;

  constructor(public config: LocallyConfig) {
    this.config = Object.assign(this._defaults, this.config);
    this.id = v4();
  }

  get meta() {
    return {}
  }

  get publicData() {
    return {
      id: this.id,
      config: { ...this.config },
    };
  }

  getModel(modelname) {
    return this._models[modelname];
  }

  get models() {
    return this._models;
  }

  validateModels(name, options) {
    if (this.models[name]) throw new Error(`model [${name}] already exists`);
  }

  createModel(name, schema = {}, options = {}) {
    this.validateModels(name, schema);
    let model = new Model(name, this.config, schema, options);
    this.synchModel(model)
    this._models[name] = model;
    return model;
  }

  synchModel(model) {
    model.appSynch(this)
  }

  async initialize() {
    this.handler = new Handler(this.config);
    this.status = "initiated";
  }


  static async init(config: LocallyConfig) {
    let app = new Locally(config);
    await app.initialize();
    return app;
  }

  async create() {
    await this.handler.create();
    await this.handler.connect();
    this.status = "connected";
  }

  async connect() {
    try {
      await this.handler.connect();
      this.status = "connected";
      return {
        message: this.status
      }
    } catch (e) {
      throw e;
    }
  }

  async disconnect() {
  }

  async destroy() {
    if (this.status !== "connected")
      throw new Error(`OperationError::invalid status(${this.status}) connection.`)
    await this.handler.destroy();
    this.status = "destroyed";
    return {
      message: this.status
    }
  }

  async isValid() {
    return await this.handler.isExisted({
      path: this.handler.input.storage.path,
      filename: this.handler.setConfigFileName("input")
    })
  }

  async update(config: any) {
    if (this.status !== "connected") throw new Error("CONERR::app is not connected")
    await this.handler.update(config)
  }

  async reset() {
    return;
  }
}
