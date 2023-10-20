import file from "./File"
import path from "path"
import fs from "fs"
export interface StorageInterface {
  /**
   * write()
   * writing content to
   * be stored
   */
  write(config, data?)

  /**
   * read()
   * fetching storage content
   */
  read(path: string)
}

export type connection = {
  path: string | object,
  name: string,
}

export type StorageConfig = {
  driver?: "file" | "s3" | "gcloud",
  path?: string,
  basePath?: string
}

export default class Storage {
  private writers = {
    file
  }
  private buffer = {};
  private _defaults = {
    driver: 'file',
    path: "./",
    basePath: process.cwd()
  }
  private writer;
  constructor(public config: StorageConfig) {
    this.config = Object.assign(this._defaults, this.config)
    this.writer = new this.writers[this.config.driver]
  }

  async write(connection, data: any) {
    let newPath = path.join(this.config.basePath, this.config.path)
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }
    await this.writer.write(path.join(newPath, connection.name), data)
  }

  async read(connection) {
    let newPath = path.join(this.config.basePath, this.config.path, connection.name)
    return await this.writer.read(newPath);
  }

  async remove(connection) {
    if(this.isExist(connection.name)) {
      let newPath = path.join(this.config.basePath, this.config.path, connection.name)
      return await this.writer.remove(newPath);
    }
  }

  async isExist(filepath) {
    try {
      let newPath = path.join(this.config.basePath, this.config.path)
      return await this.writer.isExist(path.join(newPath, filepath))
    } catch (e) {
      return false;
    }
  }
}