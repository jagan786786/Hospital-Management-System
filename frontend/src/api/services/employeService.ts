import api from "../axios"; // <-- use your axios instance

// Create a new employee
export const createEmployee = async (employeeData: any) => {
  const response = await api.post("/employees/createEmployee", employeeData);
  return response.data;
};

// (Optional) Fetch all employees
export const getEmployees = async () => {
  const response = await api.get("/employees/getEmployees");
  return response.data;
};

// (Optional) Fetch single employee by ID
export const getEmployeeById = async (id: string) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

// (Optional) Update employee
export const updateEmployee = async (id: string, employeeData: any) => {
  const response = await api.put(`/employees/updateEmployee/${id}`, employeeData);
  return response.data;
};

// (Optional) Delete employee
export const deleteEmployee = async (id: string) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

// Fetch roles
export const getRoles = async () => {
  const response = await api.get("/roles/getRoles");
  return response.data;
};

// ✅ Toggle employee status
export const toggleEmployeeStatus = async (id: string, currentStatus: string) => {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  const response = await api.put(`/employees/updateEmployee/${id}`, { status: newStatus });
  return response.data;
};