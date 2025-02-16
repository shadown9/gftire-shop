export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const handleFirebaseError = (error: any): AppError => {
  console.error("Firebase Error:", error)

  if (error.code === "permission-denied") {
    return new AppError("No tienes permisos para realizar esta acción", "PERMISSION_DENIED", 403)
  }

  if (error.code === "not-found") {
    return new AppError("El recurso solicitado no existe", "NOT_FOUND", 404)
  }

  if (error.code === "already-exists") {
    return new AppError("El recurso ya existe", "ALREADY_EXISTS", 409)
  }

  return new AppError("Ha ocurrido un error inesperado", "INTERNAL_ERROR", 500)
}

