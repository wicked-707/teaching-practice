// ... (previous imports and setup remain the same)

// Update User model to include admin role
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student-teacher', 'hod', 'school-admin', 'admin'), allowNull: false },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  universityId: { type: DataTypes.INTEGER, allowNull: true }
});

// Update University model to include approval status
const University = sequelize.define('University', {
  name: { type: DataTypes.STRING, allowNull: false },
  registrationNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  contact: { type: DataTypes.STRING, allowNull: false },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Update HighSchool model (rename isVerified to isApproved for consistency)
const HighSchool = sequelize.define('HighSchool', {
  name: { type: DataTypes.STRING, allowNull: false },
  registrationNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  contact: { type: DataTypes.STRING, allowNull: false },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// ... (other models and associations remain the same)

// Modified University Registration Endpoint
app.post('/api/register/university', async (req, res) => {
  try {
    const { name, registrationNumber, contact } = req.body;
    const university = await University.create({ name, registrationNumber, contact });
    res.status(201).json({ message: 'University registered successfully. Awaiting admin approval.', universityId: university.id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering university', error: error.message });
  }
});

// Modified High School Registration Endpoint
app.post('/api/register/highschool', async (req, res) => {
  try {
    const { name, registrationNumber, contact } = req.body;
    const highSchool = await HighSchool.create({ name, registrationNumber, contact });
    res.status(201).json({ message: 'High school registered successfully. Awaiting admin approval.', highSchoolId: highSchool.id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering high school', error: error.message });
  }
});

// New Admin Approval Endpoints

// Approve University
app.put('/api/approve-university/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can approve universities' });
  }
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    await university.update({ isApproved: true });
    res.json({ message: 'University approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving university', error: error.message });
  }
});

// Approve High School
app.put('/api/approve-highschool/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can approve high schools' });
  }
  try {
    const highSchool = await HighSchool.findByPk(req.params.id);
    if (!highSchool) {
      return res.status(404).json({ message: 'High school not found' });
    }
    await highSchool.update({ isApproved: true });
    res.json({ message: 'High school approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving high school', error: error.message });
  }
});

// Modified Vacancy Posting Endpoint
app.post('/api/vacancies', authenticateToken, async (req, res) => {
  if (req.user.role !== 'school-admin') {
    return res.status(403).json({ message: 'Only school admins can post vacancies' });
  }
  try {
    const { subject, numberOfPositions, requirements, highSchoolId } = req.body;
    const highSchool = await HighSchool.findByPk(highSchoolId);
    if (!highSchool || !highSchool.isApproved) {
      return res.status(403).json({ message: 'High school is not approved to post vacancies' });
  }
    const vacancy = await Vacancy.create({ subject, numberOfPositions, requirements, HighSchoolId: highSchoolId });
    res.status(201).json({ message: 'Vacancy posted successfully', vacancyId: vacancy.id });
    } catch (error) {
      res.status(500).json({ message: 'Error posting vacancy', error: error.message });
    }
});

// ... (other endpoints remain the same)