export const dataTypes = {
  String: {
    type: String,
    label: "String",
    format: data => data.toString()
  },
  Number: {
    type: Number,
    label: "Number",
    format: data => Number(data)
  },
  Object: {
    type: Object,
    label: "Object",
    format: data => JSON.parse(data)
  },
  Array: {
    type: Array,
    label: "Array",
    format: data => JSON.parse(data)
  }
}