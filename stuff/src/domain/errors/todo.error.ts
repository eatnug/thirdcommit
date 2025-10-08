export class TodoNotFoundError extends Error {
  constructor(todoId: string) {
    super(`Todo with id "${todoId}" not found`)
    this.name = 'TodoNotFoundError'
  }
}

export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TodoValidationError'
  }
}
