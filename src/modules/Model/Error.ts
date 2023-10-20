export class OperationError extends Error {
  constructor() {
    super()
    this.name = "ModOperationError"
  }
}

export class RequirementError extends OperationError {
  constructor(key = '') {
    super()
    this.message = `${this.name}::Missing required field ${key}`

  }
}

export class MismatchError extends OperationError {

  constructor(key = '') {
    super()
    this.message = `${this.name}::DataType mismatch for (${key})`
  }
}