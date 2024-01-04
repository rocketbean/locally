import { v4 } from "uuid"
import Operations from "./Operations";
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
  }
}

export default class Model extends Operations {

  private defaultProperty = {
    __id: {
      type: String,
    },
  };
  
  private app;
  properties: modelProperty = {};
  constructor(public name, private appConfig, private _properties, private options = {}) {
    super()
    this.setup()
    this.loadProps(Object.assign(this.defaultProperty, this._properties))
  }

  get meta() {
    return {}
  }

  loadProps(props) {
    Object.keys(props).map(key => {
      this.properties[key] = props[key]
    })
  }

  appSynch(app) {
    this.app = app;
  }

  async save() {
    await this.app.save()
  }

}

