import { StorageInterface } from "../Storage"
import * as fs from 'fs';
export default class File implements StorageInterface {
  constructor() { }

  async initiate() { }


  async write(path: string, data: any) {
    return new Promise(async (res, rej) => {
      await fs.writeFile(path, data, (err) => {
        if (err) rej(1)
      })
      res(1)
    })
  }

  async isExist(path: string) {
    return new Promise((res, rej) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        if (err) rej(false)
        res(true)
      })
    })
  }

  async read(path: string) {
    return new Promise((res, rej) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) rej(err);
        res(data);
      })
    })
  }
}   