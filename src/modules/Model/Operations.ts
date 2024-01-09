import { modelProperty } from ".";
import { MismatchError, RequirementError, DuplicateError } from "./Error"
import { dataTypes } from "./typeMatch";
const __priv = ["defaultProperty", "properties", "data"];

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

  get container() {
    return JSON.parse(JSON.stringify(this.data));
  }

  set container(data: any) {
    this.data = data;
  }


  get document() {
    return {
      keys: this.keys,
      properties: this.properties,
      data: this.container,
    }
  }

  loadData(data) {
    this.data = data;
  }

  validate(data) {
    Object.keys(this.properties).forEach(key => {
      if (this.properties[key]?.required) {
        if (!data[key]) throw new MismatchError(key)
      }
      if (this.properties[key]?.unique) {
        if (this.find({ [key]: data[key] })) {
          throw new DuplicateError(`${key}: ${data[key]}`)
        }
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
    return propKey.toLowerCase() == (typeof dataKey).toLowerCase()
  }

  async create(data: Object | Array<Object>): Promise<void> {
    if (Array.isArray(data)) {
      Promise.all(data.map(async (d) => await this.pushData(d)))
      await this.save()
    } else {
      await this.pushData(data)
      await this.save();
    }
  }

  async pushData(data: Object) {
    let container = this.container;
    container.push(this.validate(data));
    this.container = container
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
    let container = this.container
    container.splice(data?.__index__, 1);
    this.container = container;
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
      let container = this.container;
      let newData = this.validate(Object.assign(container[data?.__index__], newProperty));
      container[data?.__index__] = newData;
      this.container = container;
    }
    await this.save()
  }

  find(finder: any, showIndex: boolean = false) {
    let keys = Object.keys(finder)
    let collection = this.container.filter((prop, index) => {
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