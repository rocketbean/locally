import { StorageInterface } from "../Storage"
import * as fs from 'fs';
import _path from "path";
import { Buffer } from "buffer";
export default class File implements StorageInterface {

  _basePath: string = process.cwd()
  constructor() { }

  async initiate() { }


  async write(connection: any, data: any) {
    let path = _path.join(process.cwd(), connection.path);
    await this.ensurePathExist(path);
    path = _path.join(path, connection.filename)
    let buffer = Buffer.from(data)
    return new Promise(async (res, rej) => {
      await fs.open(path, "w", async (err, fd) => {
        if (!err)
          await fs.write(fd, buffer, (err) => {
            if (err) {
              rej(err)
            }
            res(1)
          })
      })
    })
  }

  async ensurePathExist(path: string) {
    return new Promise(async (res, rej) => {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      res(1)
    })
  }

  async remove(connection) {
    let path = _path.join(process.cwd(), connection.path, connection.filename);
    return new Promise(async (res, rej) => {
      fs.stat(path, async (err, stat) => {

        if (err) rej(err);
        await fs.unlink(path, (err) => {
          if (err) rej(err)
          res(1)
        })
      })
    });
  }

  async isExist(connection: any) {
    let path = _path.join(process.cwd(), connection.path, connection.filename);
    return new Promise((res, rej) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        if (err) rej(false)
        res(true)
      })
    })
  }

  async read(connection: any) {
    let path = _path.join(process.cwd(), connection.path, connection.filename);
    return new Promise((res, rej) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) rej(err);
        res(data);
      })
    })
  }
}   