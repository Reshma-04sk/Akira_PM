import { AxiosError } from "axios";

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, detail: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static parse(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.isAxiosError && axiosError.response) {
        const responseData = axiosError.response.data;
        const status = axiosError.response.status;
        const detail = responseData?.detail || responseData?.message || "An error occurred with the API.";
        const errors = responseData?.errors;

        return new ApiError(
          detail,
          status,
          detail,
          errors
        );
      }
      return new ApiError(error.message, 500, error.message);
    }

    return new ApiError("An unknown error occurred", 500, "An unknown error occurred");
  }
}
