import React, { useEffect, useState } from 'react';
import { getVacancies, deleteVacancy } from '../Services/Api';

const VacancyList = () => {
  const [vacancies, setVacancies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getVacancies();
      setVacancies(result.data);
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteVacancy(id);
      setVacancies(vacancies.filter(vacancy => vacancy.vacancy_id !== id));
    } catch (error) {
      console.error('Error deleting vacancy', error);
    }
  };

  return (
    <div>
      <h2>Vacancy List</h2>
      <ul>
        {vacancies.map((vacancy) => (
          <li key={vacancy.vacancy_id}>
            {vacancy.primary_subject} - {vacancy.secondary_subject}
            <button onClick={() => handleDelete(vacancy.vacancy_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VacancyList;
