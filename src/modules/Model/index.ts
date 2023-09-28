import { v4 } from "uuid"

export default class Model {
  private id;

  public defaultProperty = {
    __id: {
      type: "",
    },
    __created: {
      type: 0,
    },
    __updated: {
      type: 0,
    },
  };
  public properties = {};
  private data = [];
  constructor(public name, private appConfig, private _properties, private options = {}) {
    this.loadProps(Object.assign(this.defaultProperty, this._properties.schema))
  }

  private writeContent() {

  }

  private getWrittenContent() {
    return this.data;
  }

  loadProps(props) {
    Object.keys(props).map(key => {
      this.properties[key] = typeof props[key].type
    })
  }
}