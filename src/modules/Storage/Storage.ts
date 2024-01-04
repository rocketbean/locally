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

  async writeRaw(connection, data: any) {
    await this.writer.write(connection, data)
  }

  async read(connection) {
    let newPath = path.join(this.config.basePath, this.config.path, connection.name)
    return await this.writer.read(newPath);
  }

  async readRaw(connection: any) {
    return await this.writer.read(connection);

  }

  async remove(connection) {
    return await this.writer.remove(connection);

  }

  async isExist(connection) {
    try {
      return await this.writer.isExist(connection)
    } catch (e) {
      return false;
    }
  }
}