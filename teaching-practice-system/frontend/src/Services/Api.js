// import axios from 'axios';

// const API_URL = 'http://localhost:5000';

// export const createVacancy = (vacancy) => axios.post(`${API_URL}/vacancy`, vacancy);
// export const getVacancies = () => axios.get(`${API_URL}/vacancy`);
// export const getVacancy = (id) => axios.get(`${API_URL}/vacancy/${id}`);
// export const updateVacancy = (id, vacancy) => axios.put(`${API_URL}/vacancy/${id}`, vacancy);
// export const deleteVacancy = (id) => axios.delete(`${API_URL}/vacancy/${id}`);
import axios from 'axios';

const API_URL = 'http://localhost:5000/vacancy';

export const getAllVacancies = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getVacancyById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createVacancy = async (vacancy) => {
  const response = await axios.post(API_URL, vacancy);
  return response.data;
};

export const updateVacancy = async (id, vacancy) => {
  const response = await axios.put(`${API_URL}/${id}`, vacancy);
  return response.data;
};

export const deleteVacancy = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
