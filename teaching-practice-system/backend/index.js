const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const authorize = require('./middleware/Authorize');

const router = express.Router();

// Signup routes
router.post('/signup/:role', async (req, res) => {
  const { role } = req.params;
  const { name, email, password, ...additionalFields } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let result;
    switch (role) {
      case 'student':
        result = await pool.query(
          `INSERT INTO student (
            first_name, last_name, id_number, date_of_birth, gender, email, phone_number,
            university_name, course_name, specialization, graduation_date,
            primary_teaching_subject, secondary_teaching_subject, kenya_county, password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
          [
            additionalFields.first_name, additionalFields.last_name, additionalFields.id_number, 
            additionalFields.date_of_birth, additionalFields.gender, email, 
            additionalFields.phone_number, additionalFields.university_name, 
            additionalFields.course_name, additionalFields.specialization, 
            additionalFields.graduation_date, additionalFields.primary_teaching_subject, 
            additionalFields.secondary_teaching_subject, additionalFields.kenya_county, 
            hashedPassword
          ]
        );
        break;
      case 'university':
        result = await pool.query(
          `INSERT INTO university (
            university_name, establishment_date, registration_number, charter_number,
            accreditation_status, official_email, official_phone_number, website,
            postal_address, physical_address, county, category, password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
          [
            additionalFields.university_name, additionalFields.establishment_date, 
            additionalFields.registration_number, additionalFields.charter_number,
            additionalFields.accreditation_status, email, additionalFields.official_phone_number,
            additionalFields.website, additionalFields.postal_address, 
            additionalFields.physical_address, additionalFields.county, 
            additionalFields.category, hashedPassword
          ]
        );
        break;
      case 'highschool':
        result = await pool.query(
          `INSERT INTO high_school (
            school_name, establishment_date, registration_number, education_system,
            school_type, official_email, official_phone_number, website,
            postal_address, physical_address, principal_name, principal_email,
            principal_phone, county, sub_county, password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
          [
            additionalFields.school_name, additionalFields.establishment_date, 
            additionalFields.registration_number, additionalFields.education_system,
            additionalFields.school_type, email, additionalFields.official_phone_number,
            additionalFields.website, additionalFields.postal_address, 
            additionalFields.physical_address, additionalFields.principal_name, 
            additionalFields.principal_email, additionalFields.principal_phone, 
            additionalFields.county, additionalFields.sub_county, hashedPassword
          ]
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const token = jwt.sign(
      { id: result.rows[0].id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login route
router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  try {
    let user;
    switch (role) {
      case 'student':
        user = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        break;
      case 'university':
        user = await pool.query('SELECT * FROM university WHERE email = $1', [email]);
        break;
      case 'highschool':
        user = await pool.query('SELECT * FROM high_school WHERE email = $1', [email]);
        break;
      case 'hod':
        user = await pool.query('SELECT * FROM hod WHERE email = $1', [email]);
        break;
      case 'supervisor':
        user = await pool.query('SELECT * FROM supervisor WHERE email = $1', [email]);
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// admin approves hods
router.put('/approve/university/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE university SET approval_status = $1, approved_by = $2, approval_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['Approved', req.user.id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Example protected route for HOD
router.put('/approve/hod/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE hod SET approval_status = $1, approved_by = $2, approval_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['Approved', req.user.id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// HOD approves supervisor
router.put('/approve/supervisor/:id', authorize(['hod']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE supervisors SET approval_status = $1, approved_by = $2, approval_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['Approved', req.user.id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//hods approve student
router.put('/approve/student/:id', authorize(['hod']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE student SET approval_status = $1, approved_by = $2, approval_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['Approved', req.user.id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;

// Start the server
const app = express();
app.use(express.json());
app.use('/api', router);
app.get('/test', (req, res) => {
  res.send('Server is working');
});
app.listen(5000, () => {
  console.log("Server has started on port 5000");
});