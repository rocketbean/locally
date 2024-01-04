import Encryptor from "./modules/Encryptor";
import Storage from "./modules/Storage/Storage";

export default class Orchestrator {
  private confFile: string = "main";
  private extension: string = "shred";
  private configuration;
  private capture: any = {
    doesConfigExist: false
  }


  constructor(private encryptor: Encryptor, private storage: Storage) {
  }

  get configFile() {
    return `${this.confFile}.${this.extension}`;
  }

  validateStrKey(str1, str2) {
    return str1 === str2;
  }

  async currentConfig() {
    return await this.storage.read({ name: this.configFile });
  }

  isValidJson(str: string) {
    try {
      this.encryptor.JsonParser(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  save(data: any) {
    console.log("saving from orch.")
  }

  async loadConfig() {
    try {
      this.configuration = await this.currentConfig()
      if (!this.configuration) throw new Error("ConfigError::missing config file")
      if (!this.isValidJson(this.configuration)) {
        this.configuration = this.encryptor.decrypt(this.configuration);
      }
      return this.configuration;
    } catch (e: any) {
      if (e.message.includes("Malformed")) {
        throw new Error("AuthErr:: Invalid key / shakeCounts provided")
      }
    }
  }
}
