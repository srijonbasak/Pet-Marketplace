import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faArrowLeft, faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PetApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [petInfo, setPetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // This would normally fetch data from your backend API
    // For now, we'll use mock data
    setTimeout(() => {
      setPetInfo({
        _id: id,
        name: 'Buddy',
        breed: 'Labrador Mix',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      });
      
      setApplications([
        {
          _id: 'app1',
          applicantId: 'user1',
          applicantName: 'John Doe',
          applicantEmail: 'john@example.com',
          applicantPhone: '555-123-4567',
          status: 'pending',
          submittedDate: '2023-08-10',
          notes: 'Has a large backyard and experience with dogs.'
        },
        {
          _id: 'app2',
          applicantId: 'user2',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane@example.com',
          applicantPhone: '555-987-6543',
          status: 'approved',
          submittedDate: '2023-08-05',
          notes: 'First-time dog owner but has completed pet care courses.'
        },
        {
          _id: 'app3',
          applicantId: 'user3',
          applicantName: 'Mark Johnson',
          applicantEmail: 'mark@example.com',
          applicantPhone: '555-567-8901',
          status: 'rejected',
          submittedDate: '2023-07-28',
          notes: 'Lives in an apartment that doesn't allow pets.'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app._id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'approved':
        variant = 'success';
        break;
      case 'pending':
        variant = 'warning';
        break;
      case 'rejected':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  const filteredApplications = applications.filter(app => 
    activeTab === 'all' || app.status === activeTab
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Link to="/my-pets" className="btn btn-outline-primary mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to My Pets
      </Link>
      
      {petInfo && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={3} className="mb-3 mb-md-0">
                <img 
                  src={petInfo.image} 
                  alt={petInfo.name}
                  className="img-fluid rounded"
                  style={{ maxHeight: '150px', objectFit: 'cover' }}
                />
              </Col>
              <Col md={9}>
                <h2>
                  <FontAwesomeIcon icon={faPaw} className="me-2 text-primary" />
                  Applications for {petInfo.name}
                </h2>
                <p className="lead mb-0">
                  {petInfo.breed} • {applications.length} applications received
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Applications" />
        <Tab eventKey="pending" title={`Pending (${applications.filter(a => a.status === 'pending').length})`} />
        <Tab eventKey="approved" title={`Approved (${applications.filter(a => a.status === 'approved').length})`} />
        <Tab eventKey="rejected" title={`Rejected (${applications.filter(a => a.status === 'rejected').length})`} />
      </Tabs>
      
      {filteredApplications.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div>
                        <strong>{app.applicantName}</strong>
                        <div className="text-muted small">{app.applicantEmail}</div>
                        <div className="text-muted small">{app.applicantPhone}</div>
                      </div>
                    </td>
                    <td>{new Date(app.submittedDate).toLocaleDateString()}</td>
                    <td>{renderStatusBadge(app.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          as={Link}
                          to={`/application-details/${app._id}`}
                        >
                          <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                          Details
                        </Button>
                        
                        {app.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleStatusChange(app._id, 'approved')}
                            >
                              <FontAwesomeIcon icon={faCheck} className="me-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                            >
                              <FontAwesomeIcon icon={faTimes} className="me-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {app.status === 'approved' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleStatusChange(app._id, 'pending')}
                          >
                            Undo Approval
                          </Button>
                        )}
                        
                        {app.status === 'rejected' && (
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleStatusChange(app._id, 'pending')}
                          >
                            Reconsider
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm text-center p-5">
          <Card.Body>
            <h3>No applications in this category</h3>
            <p className="text-muted">
              {activeTab === 'all' 
                ? "This pet hasn't received any adoption applications yet." 
                : `No ${activeTab} applications found for this pet.`}
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default PetApplications; 