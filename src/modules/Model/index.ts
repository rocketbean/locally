import { v4 } from "uuid"
import Operations from "./Operations";
import Storage from "../Storage/Storage";
import Encryptor from "../Encryptor";
import path from "path"
import { dataTypes } from "./typeMatch"
export type modelProperty = {
  [key: string]: {
    /**
     * property datatype 
     */
    type: any,
    /**
     * defaults to false;
     * model will throw a missing
     * required field error
     * if property is missing
     * in the data when enabled.
     */
    required?: Boolean

    /**
     * defaults to false;
     * model will throw a 
     * duplicate data error
     * if property exists.
     */
    unique?: Boolean
  }
}

export type meta = {
  /** storage
   * models location 
   */
  storage: object,

  /** encryption
   * models encryption
   * method 
   */
  encryption: object,

  /** Object 
   * app instance 
   * public information;
   */
  app: object

  status: Number
}

export default class Model extends Operations {

  private defaultProperty = {
    __id: {
      type: String,
    },
  };

  properties: modelProperty = {};
  private store: Storage;
  private encryptor: Encryptor;

  public meta: any = {
    app: {},
    storage: {},
    encryption: {},
    status: 0,
  };

  constructor(
    public name,
    private _properties,
    private options = {},
    meta: any
  ) {
    super()
    this.setup()
    this.initialize(meta)
    this.loadProps(Object.assign(this.defaultProperty, this._properties))
  }

  loadProps(props) {
    Object.keys(props).map(key => {
      let type = props[key].type?.name || props[key].type;
      this.properties[key] = props[key]
      this.properties[key].type = dataTypes[type].label
    })
  }

  initialize(config) {
    let storagePath = config.storage.path.includes("models")
      ? config.storage.path : path.join(config.storage.path, "models");
    this.meta.storage = {
      ...config.storage,
      path: storagePath
    }
    this.meta.app = config.app;
    this.meta.encryption = config.encryption;
    this.store = new Storage(this.meta.storage)
    this.encryptor = new Encryptor(this.meta.encryption)
  }

  async save() {
    let content = {
      name: this.name,
      ...this.document
    }
    await this.store.writeRaw({
      filename: `${this.name}.ldb`,
      path: this.meta.storage.path
    }, JSON.stringify(this.encryptor.encrypt(content), null, 2))
  }

  static async load(modelName, meta) {
    let encryptor = new Encryptor(meta.encryption)
    let storage = new Storage(meta.storage)
    let content = JSON.parse(await storage.readRaw({
      filename: `${modelName}.ldb`,
      path: meta.storage.path
    }))
    let model = new Model(content.name, content.properties, {}, meta)
    model.loadData(content.data)
    return model;
  }

}

