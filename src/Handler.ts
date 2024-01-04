import { AppInterface, LocallyConfig } from "./locally";
import Storage from "./modules/Storage/Storage";
import Encryptor from "./modules/Encryptor/index";
import Authenticator from "./modules/Authenticator";

export default class Handler {
  public orchestrator;
  private _config: any = {
    input: {},
    current: {},
    prev: {}
  }
  public count = 0;
  private confExtName: string = ".shred";
  private authenticator: Authenticator;
  private hash: Encryptor;
  private storage: Storage;
  status: string = "initiated";
  errors: []
  constructor(config: LocallyConfig) {
    this._config.input = config;
    this.configure()
  }

  get configFileName() {
    return this.setConfigFileName("current");
  }

  get current() {
    return this._config.current;
  }

  get input() {
    return this._config.input;
  }

  get prev() {
    return this._config.prev
  }

  setConfigFileName(settings: "prev" | "input" | "current") {
    return this._config[settings].name + this.confExtName
  }

  configure() {
    this.hash = new Encryptor(this.input.hash);
    this.storage = new Storage(this.input.storage);
    this.authenticator = new Authenticator(this.input)
  }

  validateConfig(config) {
    let status = true;
    if (!config.name) status = false;
    if (!config.storage.path) status = false;
    if (!status) {
      throw new Error("CNFGERR::invalid configuration")
    }
  }

  async loadPrevConfiguration() {
    let curr = await this.serializeFromStorage({ path: this.current.storage.path, filename: this.configFileName })
    if (typeof curr !== "object")
      throw new Error("config cannot be parsed")
    this.authenticator.authenticate(curr.hash)
  }

  async saveConfig() {
    let serData = this.serializeData(this.current)
    await this.storage.writeRaw({
      path: this.current.storage.path,
      filename: this.configFileName
    }, this.serializeData(this.current))
  }

  serializeData(data: any) {
    if (this.current.hash?.enabled) {
      return this.hash.encrypt(data);
    }
    return JSON.stringify(data);
  }


  parsebleData(data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      return false;
    }
  }

  async create() {
    this._config.current = this._config.input
    if (await this.isExisted({
      path: this.current.storage.path,
      filename: this.configFileName
    }))
      throw new Error("CONERR::connection already exist")
    await this.saveConfig()
  }

  async connect() {
    this._config.current = this._config.input
    await this.loadPrevConfiguration()
  }

  async update(config: any) {
    if (typeof this._config.current !== "string")
      this._config.input = Object.assign(this._config.current, config)
    this.configure()
    await this.saveConfig()
  }

  async destroy() {
    try {
      await this.storage.remove({
        path: this.current.storage.path,
        filename: this.configFileName
      })
    } catch (e) {
      throw e;
    }
  }

  async isExisted(connection) {
    if (await this.storage.isExist(connection)) return true
    else return false;
  }

  async serializeFromStorage(connection: any, decrypt = true) {
    try {
      let data = await this.storage.readRaw(connection)
      if (this.hash.decrypt(data)) data = this.hash.decrypt(data)
      if (this.parsebleData(data)) data = this.parsebleData(data)
      return data;
    } catch (e: any) {
      if (e.errno == -2) throw new Error("CONERR::connection does not exist")
    }
  }

}