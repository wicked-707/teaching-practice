import React, { useEffect, useState } from 'react';
import { getVacancyById } from '../services/vacancyService';
import { useParams, Link } from 'react-router-dom';

const VacancyDetail = () => {
  const { id } = useParams();
  const [vacancy, setVacancy] = useState(null);

  useEffect(() => {
    fetchVacancy();
  }, [id]);

  const fetchVacancy = async () => {
    const data = await getVacancyById(id);
    setVacancy(data);
  };

  if (!vacancy) return <div>Loading...</div>;

  return (
    <div>
      <h1>Vacancy Detail</h1>
      <p>{vacancy.primary_subject} - {vacancy.secondary_subject}</p>
      <p>Coordinator: {vacancy.coordinator_name}</p>
      <p>Email: {vacancy.coordinator_email}</p>
      <p>Phone: {vacancy.coordinator_phone}</p>
      <Link to={`/edit/${vacancy.vacancy_id}`}>Edit</Link>
    </div>
  );
};

export default VacancyDetail;
