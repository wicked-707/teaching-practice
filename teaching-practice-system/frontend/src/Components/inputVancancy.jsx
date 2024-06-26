import React, { useState } from 'react';
import { createVacancy } from '../Services/Api';

const VacancyForm = () => {
  const [formData, setFormData] = useState({
    primary_subject: '',
    secondary_subject: '',
    positions_available: 0,
    stat_date: '',
    end_date: '',
    application_deadline: '',
    application_method: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    accommodation_provided: '',
    stipend_amount: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVacancy(formData);
      alert('Vacancy created successfully');
    } catch (error) {
      console.error('Error creating vacancy', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Add form fields */}
      <input type="text" name="primary_subject" placeholder="Primary Subject" onChange={handleChange} />
      <input type="text" name="secondary_subject" placeholder="Secondary Subject" onChange={handleChange} />
      <input type="number" name="positions_available" placeholder="Positions Available" onChange={handleChange} />
      <input type="date" name="stat_date" placeholder="Start Date" onChange={handleChange} />
      <input type="date" name="end_date" placeholder="End Date" onChange={handleChange} />
      <input type="date" name="application_deadline" placeholder="Application Deadline" onChange={handleChange} />
      <input type="text" name="application_method" placeholder="Application Method" onChange={handleChange} />
      <input type="text" name="coordinator_name" placeholder="Coordinator Name" onChange={handleChange} />
      <input type="email" name="coordinator_email" placeholder="Coordinator Email" onChange={handleChange} />
      <input type="text" name="coordinator_phone" placeholder="Coordinator Phone" onChange={handleChange} />
      <input type="text" name="accommodation_provided" placeholder="Accommodation Provided" onChange={handleChange} />
      <input type="number" name="stipend_amount" placeholder="Stipend Amount" onChange={handleChange} />
      <button type="submit">Create Vacancy</button>
    </form>
  );
};

export default VacancyForm;
