import React, { useEffect, useState } from 'react';
import { Container, Button, Table, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const PendingAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchPendingAdoptions();
    // eslint-disable-next-line
  }, []);

  const fetchPendingAdoptions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/adoptions?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdoptions(res.data.adoptions || []);
    } catch (err) {
      setError('Failed to fetch pending adoptions.');
    }
    setLoading(false);
  };

  const handleAction = async (adoptionId, status) => {
    setActionMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/adoptions/${adoptionId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMsg(`Adoption request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
      await fetchPendingAdoptions();
    } catch (err) {
      setActionMsg('Failed to update adoption status.');
      setLoading(false);
    }
  };
// ...existing code...
  return (
    <Container className="py-4">
      <h2 className="mb-4">Pending Adoption Requests</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {actionMsg && <Alert variant="info">{actionMsg}</Alert>}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : adoptions.length === 0 ? (
        <Alert variant="info">No pending adoption requests.</Alert>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Applicant</th>
              <th>Application Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map(adoption => (
              <tr key={adoption._id}>
                <td>
                  <div><strong>{adoption.pet?.name}</strong></div>
                  <div>{adoption.pet?.breed}</div>
                </td>
                <td>{adoption.applicant?.username}</td>
                <td>
                  <ul className="mb-0">
                    <li><strong>Living Arrangement:</strong> {adoption.applicationDetails?.livingArrangement}</li>
                    <li><strong>Has Yard:</strong> {adoption.applicationDetails?.hasYard ? 'Yes' : 'No'}</li>
                    <li><strong>Has Children:</strong> {adoption.applicationDetails?.hasChildren ? 'Yes' : 'No'}</li>
                    <li><strong>Has Other Pets:</strong> {adoption.applicationDetails?.hasOtherPets ? 'Yes' : 'No'}</li>
                    {adoption.applicationDetails?.hasOtherPets && (
                      <li><strong>Other Pets Details:</strong> {adoption.applicationDetails?.otherPetsDetails}</li>
                    )}
                    <li><strong>Work Schedule:</strong> {adoption.applicationDetails?.workSchedule}</li>
                    <li><strong>Experience:</strong> {adoption.applicationDetails?.experience}</li>
                    <li><strong>Reason:</strong> {adoption.applicationDetails?.reasonForAdoption}</li>
                  </ul>
                </td>
                <td><span className="badge bg-warning text-dark">Pending</span></td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleAction(adoption._id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(adoption._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  ); // No unused _ variable
};

export default PendingAdoptions; 