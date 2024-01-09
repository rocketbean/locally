import { AppInterface, LocallyConfig, AppInformation } from "./locally";
import { v4 } from "uuid";
import Model from "./modules/Model";
import Handler from "./Handler"

export default class Locally implements AppInterface {
  private id;

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
  public status: "initiated" | "connected" | "destroyed" | "disconnected" = "disconnected";
  private _models = {};
  private documents = {};
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
    this.id = v4();
    this.config = Object.assign(this._defaults, this.config);
  }

  get meta() {
    return {
      id: this.id,
      name: this.config.name
    }
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

  async createModel(name, schema = {}, options = {}) {
    this.validateModels(name, schema);
    let model = new Model(name, schema, options, {
      storage: this.handler.current.storage,
      encryption: this.handler.current.hash,
      app: this.meta
    });
    this.models[name] = model;
    this.documents[name] = model.meta;
    await this.handler.saveConfig();
    await model.save()
    return model;
  }

  bindProperties(data) {
    if (data?.id) {
      this.id = data.id
    }
    if (data?.documents) this.documents = data.documents
  }

  getAppInfo() {
    return {
      id: this.id,
      documents: this.documents,
    }
  }

  async initialize() {
    this.handler = new Handler(this.config, {
      setter: this.bindProperties.bind(this),
      getter: this.getAppInfo.bind(this)
    });
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
      await this.handler.connect();
      this.status = "connected";
    await this.loadDocumentModels()
      return {
        message: this.status
      }
  }

  async loadDocumentModels() {
    let models = await Promise.all(Object.keys(this.documents).map(async doc => {
      this.models[doc] = await Model.load(doc, this.documents[doc]);
    }))

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
    this._models = {}
    this.documents = {}
    return;
  }
}
