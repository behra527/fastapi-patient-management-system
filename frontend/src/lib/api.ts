const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type Gender = "Male" | "Female" | "Other";

export type Patient = {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientPayload = {
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string | null;
  email: string | null;
  address: string | null;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const detail = errorBody?.detail;

    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item: { msg?: string }) => item.msg ?? "Invalid data").join(", ")
          : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getPatients(): Promise<Patient[]> {
  return request<Patient[]>("/patients/");
}

export function createPatient(payload: PatientPayload): Promise<Patient> {
  return request<Patient>("/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatient(
  patientId: number,
  payload: PatientPayload,
): Promise<Patient> {
  return request<Patient>(`/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePatient(patientId: number): Promise<void> {
  return request<void>(`/patients/${patientId}`, {
    method: "DELETE",
  });
}
