import { modelProperty } from ".";
import { MismatchError, RequirementError } from "./Error"

const __priv = ["defaultProperty", "appConfig", "_properties", "properties", "data"];
export default class Operations {
  private data = [];
  properties: modelProperty = {};
  private keys = []

  get metadata() {
    return this.data;
  }

  setup() {
    __priv.map(prop => {
      Reflect.defineProperty(this, prop, {
        enumerable: false
      })
    })
  }

  get storage() {
    return JSON.parse(JSON.stringify(this.data));
  }

  set storage(data: any) {
    this.data = data;
  }

  validate(data) {
    Object.keys(this.properties).forEach(key => {
      if (this.properties[key]?.required) {
        if (!data[key]) throw new MismatchError(key)
      }
      if (data[key]) {
        if (!this.typeMatch(this.properties[key].type, data[key])) {
          throw new RequirementError(key)
        }
      }
    })
    return data;
  }

  typeMatch(propKey, dataKey) {
    return propKey.name.toLowerCase() == (typeof dataKey).toLowerCase()
  }

  async create(data: Object | Array<Object>): Promise<void> {
    if (Array.isArray(data)) {
      Promise.all(data.map(async (d) => await this.pushData(d)))
    }
    else await this.pushData(data)
  }

  async pushData(data: Object) {
    let storage = this.storage;
    storage.push(this.validate(data));
    this.storage = storage
    await this.save()
  }

  async delete(finder: any) {
    try {
      let data = await this.find(finder, true)
      if (Array.isArray(data)) {
        Promise.all(data.map(async (d) => await this.removeData(d)))
      }
      else await this.removeData(data)
      return true
    } catch (e) {
      throw e
    }
  }

  async removeData(data) {
    let storage = this.storage
    storage.splice(data?.__index__, 1);
    this.storage = storage;
    await this.save()
  }

  async update(finder: any, newProperty: object) {
    try {
      let data = await this.find(finder, true)
      if (Array.isArray(data)) {
        Promise.all(data.map(async (d) => await this.updateData(d, newProperty)))
      }
      else await this.updateData(data, newProperty)
      return true
    } catch (e) {
      throw e;
    }
  }

  async updateData(data: any, newProperty: object) {
    if (data) {
      let storage = this.storage;
      let newData = this.validate(Object.assign(storage[data?.__index__], newProperty));
      storage[data?.__index__] = newData;
      this.storage = storage;
    }
    await this.save()
  }

  async find(finder: any, showIndex: boolean = false) {
    let keys = Object.keys(finder)
    let collection = this.storage.filter((prop, index) => {
      if (this.onEvery(keys, prop, finder)) {
        if (showIndex) prop.__index__ = index;
        return prop;
      }
    })
    if (collection.length == 0) return null;
    else return collection.length > 1 ? collection : collection[0];
  }

  private onEvery(keys, prop, finder) {
    return keys.every((key) => {
      let value = finder[key]?.value || finder[key];
      if (finder[key].operation) return finder[key].operation(prop[key], value);
      else return prop[key] === value;
    })
  }

  async reset() {
    this.data = []
  }

  async save() { }

}