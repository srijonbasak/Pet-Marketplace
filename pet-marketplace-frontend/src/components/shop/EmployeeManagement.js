import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { shopAPI, employeeAPI } from '../../services/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    permissions: {
      canAddProducts: true,
      canCreateInvoices: true,
      canManageInventory: true
    }
  });

  useEffect(() => {
    fetchShopId();
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchEmployees();
    }
  }, [shopId]);

  const fetchShopId = async () => {
    try {
      console.log('Fetching shop data...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await shopAPI.getMyShop();
      console.log('Shop data received:', response.data);
      
      setShopId(response.data._id);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shop:', error.response?.data || error.message);
      toast.error('Failed to fetch shop information');
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees for shop:', shopId);
      const response = await employeeAPI.getShopEmployees(shopId);
      console.log('Employees received:', response.data.length);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error.response?.data || error.message);
      toast.error('Failed to fetch employees');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith('permissions.')) {
      const permission = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Registering employee for shop:', shopId);
      await employeeAPI.registerEmployee({
        ...formData,
        shopId
      });
      toast.success('Employee added successfully');
      setShowAddModal(false);
      fetchEmployees();
      resetForm();
    } catch (error) {
      console.error('Error adding employee:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleUpdateStatus = async (employeeId, isActive) => {
    try {
      console.log('Updating employee status:', employeeId, isActive);
      await employeeAPI.updateEmployeeStatus(employeeId, isActive);
      toast.success('Employee status updated');
      fetchEmployees();
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      toast.error('Failed to update employee status');
    }
  };

  const handleUpdatePermissions = async (employeeId, permissions) => {
    try {
      console.log('Updating employee permissions:', employeeId, permissions);
      await employeeAPI.updateEmployeePermissions(employeeId, permissions);
      toast.success('Employee permissions updated');
      fetchEmployees();
    } catch (error) {
      console.error('Error updating permissions:', error.response?.data || error.message);
      toast.error('Failed to update employee permissions');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      permissions: {
        canAddProducts: true,
        canCreateInvoices: true,
        canManageInventory: true
      }
    });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <h2>Employee Management</h2>
        <div className="spinner-border mt-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading shop information...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Employee Management</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Employee
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No employees found</td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr key={employee._id}>
                    <td>{`${employee.firstName} ${employee.lastName}`}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={employee.isActive}
                        onChange={(e) => handleUpdateStatus(employee._id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <div>
                        <Form.Check
                          type="checkbox"
                          label="Add Products"
                          checked={employee.permissions.canAddProducts}
                          onChange={(e) => handleUpdatePermissions(employee._id, {
                            ...employee.permissions,
                            canAddProducts: e.target.checked
                          })}
                        />
                        <Form.Check
                          type="checkbox"
                          label="Create Invoices"
                          checked={employee.permissions.canCreateInvoices}
                          onChange={(e) => handleUpdatePermissions(employee._id, {
                            ...employee.permissions,
                            canCreateInvoices: e.target.checked
                          })}
                        />
                        <Form.Check
                          type="checkbox"
                          label="Manage Inventory"
                          checked={employee.permissions.canManageInventory}
                          onChange={(e) => handleUpdatePermissions(employee._id, {
                            ...employee.permissions,
                            canManageInventory: e.target.checked
                          })}
                        />
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(employee._id, false)}
                      >
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Employee Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  label="Can Add Products"
                  name="permissions.canAddProducts"
                  checked={formData.permissions.canAddProducts}
                  onChange={handleInputChange}
                />
                <Form.Check
                  type="checkbox"
                  label="Can Create Invoices"
                  name="permissions.canCreateInvoices"
                  checked={formData.permissions.canCreateInvoices}
                  onChange={handleInputChange}
                />
                <Form.Check
                  type="checkbox"
                  label="Can Manage Inventory"
                  name="permissions.canManageInventory"
                  checked={formData.permissions.canManageInventory}
                  onChange={handleInputChange}
                />
              </div>
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Employee
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeManagement; 