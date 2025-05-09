import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave, faEdit, faUpload, faPaw } from '@fortawesome/free-solid-svg-icons';
import { userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchUserProfile = async () => {
      try {
        if (!isAuthenticated || !authService.getToken()) {
          console.log('User is not authenticated, redirecting to login');
          setError('Authentication required');
          setLoading(false);
          navigate('/login');
          return;
        }
        
        console.log('Fetching user profile data...');
        
        // Add timeout to the API call to prevent long-hanging requests
        const fetchWithTimeout = async (timeoutMs = 10000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          try {
            const response = await userAPI.getCurrentUser(controller.signal);
            clearTimeout(timeoutId);
            return response;
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }
        };
        
        const response = await fetchWithTimeout();
        console.log('User profile fetched successfully');
        
        // Transform the backend user data to match our frontend structure
        const userData = {
          _id: response.data._id,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          bio: response.data.bio || '',
          petPreferences: response.data.petPreferences || {
            species: [],
            breed: [],
            age: [],
            size: []
          },
          role: response.data.role,
          profileImage: response.data.profileImage,
          createdAt: response.data.createdAt
        };
        
        setUser(userData);
        setFormData(userData);
        
        // Process profile image if available
        if (userData.profileImage && userData.profileImage.preview) {
          console.log('Using preview image data directly from response');
          setImagePreview(userData.profileImage.preview);
        }
        else if (userData.profileImage && userData.profileImage.data) {
          console.log('Processing profile image data:', {
            dataType: typeof userData.profileImage.data,
            isBuffer: userData.profileImage.data instanceof Buffer,
            isString: typeof userData.profileImage.data === 'string',
            contentType: userData.profileImage.contentType,
            dataLength: typeof userData.profileImage.data === 'string' ? userData.profileImage.data.length : 'unknown'
          });
          
          try {
            // Check if the data is already a string (like a base64 string or URL)
            if (typeof userData.profileImage.data === 'string') {
              // If it's already a data URL, use it directly
              if (userData.profileImage.data.startsWith('data:')) {
                console.log('Profile image is already a data URL');
                setImagePreview(userData.profileImage.data);
              } else {
                try {
                  // Check if it's a JSON representation of binary data
                  const isDataObject = userData.profileImage.data.includes('{') && 
                                      userData.profileImage.data.includes('}');
                  
                  if (isDataObject) {
                    // Try to parse as JSON if it looks like an object
                    console.log('Profile image data appears to be a JSON string representation of binary');
                    const dataObj = JSON.parse(userData.profileImage.data);
                    const binData = Object.values(dataObj);
                    const uint8Array = new Uint8Array(binData);
                    const base64 = arrayBufferToBase64(uint8Array);
                    const contentType = userData.profileImage.contentType || 'image/jpeg';
                    setImagePreview(`data:${contentType};base64,${base64}`);
                  } else {
                    // Assume it's already a base64 string without the data URL prefix
                    console.log('Profile image is a string, assuming base64 without prefix');
                    const contentType = userData.profileImage.contentType || 'image/jpeg';
                    setImagePreview(`data:${contentType};base64,${userData.profileImage.data}`);
                  }
                } catch (parseErr) {
                  console.error('Error parsing profile image data string:', parseErr);
                  // Assume it's base64 encoded anyway
                  const contentType = userData.profileImage.contentType || 'image/jpeg';
                  setImagePreview(`data:${contentType};base64,${userData.profileImage.data}`);
                }
              }
            } else if (userData.profileImage.data && typeof userData.profileImage.data === 'object') {
              // Handle Buffer, ArrayBuffer, or Buffer-like object
              console.log('Converting binary profile image data to base64');
              
              // If it looks like a buffer representation with type and data properties
              if (userData.profileImage.data.type && userData.profileImage.data.data) {
                console.log('Found nested buffer data structure');
                const base64String = arrayBufferToBase64(userData.profileImage.data.data);
                const contentType = userData.profileImage.contentType || 'image/jpeg';
                setImagePreview(`data:${contentType};base64,${base64String}`);
              } else {
                // Regular buffer object or array
                const base64String = arrayBufferToBase64(userData.profileImage.data);
                if (base64String) {
                  const contentType = userData.profileImage.contentType || 'image/jpeg';
                  setImagePreview(`data:${contentType};base64,${base64String}`);
                  console.log('Successfully set image preview from binary data');
                } else {
                  console.warn('Failed to convert profile image to base64');
                }
              }
            }
          } catch (imgErr) {
            console.error('Error processing profile image:', imgErr);
          }
        } else if (userData.profileImage && userData.profileImage.url) {
          // If the server provides a direct URL to the image
          console.log('Using profile image URL from server');
          setImagePreview(userData.profileImage.url);
        } else {
          console.log('No profile image available');
          
          // Check if we have a cached image in session storage
          const cachedImage = sessionStorage.getItem('lastImagePreview');
          if (cachedImage) {
            console.log('Using cached profile image from session storage');
            setImagePreview(cachedImage);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Debug more error details
        console.log('Error details:', {
          name: err.name,
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          isAxiosError: err.isAxiosError,
          isAborted: err.name === 'AbortError' || err.code === 'ECONNABORTED'
        });
        
        // Check if this is a network error or timeout
        if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || !err.response) {
          console.log('Network error or request timeout');
          
          // Retry a few times for network errors
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying (${retryCount}/${maxRetries})...`);
            setError(`Connection problem. Retrying (${retryCount}/${maxRetries})...`);
            
            // Wait a bit before retrying
            setTimeout(() => {
              fetchUserProfile();
            }, 2000 * retryCount); // Exponential backoff
            return;
          }
          
          setError('Unable to connect to the server. Please check your internet connection and try again later.');
        }
        // Check if this is an authentication error
        else if (err.response && err.response.status === 401) {
          console.log('Authentication error, token may be invalid');
          setError('Your session has expired. Please log in again.');
          
          // Log out and redirect to login
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else {
          setError('Failed to load profile. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, navigate, logout]);

  // Update the existing useEffect that processes image data
  useEffect(() => {
    if (!user) return;
    
    console.log('User data changed, checking for profile image');
    
    try {
      // If user data has already been processed, skip processing
      if (user.profileImage && user.profileImage._alreadyProcessed) {
        console.log('Image already processed, skipping image processing');
        return;
      }
      
      // If we already have a valid image preview from a file selection, keep it
      if (imagePreview && imagePreview.startsWith('data:image/')) {
        console.log('Already have valid image preview, keeping it');
        return;
      }
      
      // Process profile image if it exists
      if (user.profileImage && user.profileImage.data) {
        console.log('Found profile image data in user object');
        
        // For already processed data URLs
        if (typeof user.profileImage.data === 'string' && 
            user.profileImage.data.startsWith('data:')) {
          console.log('Using pre-processed data URL');
          setImagePreview(user.profileImage.data);
          return;
        }
        
        // For binary data (Buffer, ArrayBuffer, etc.)
        console.log('Processing binary image data, type:', typeof user.profileImage.data);
        console.log('Is array?', Array.isArray(user.profileImage.data));
        
        try {
          const base64String = arrayBufferToBase64(user.profileImage.data);
          const contentType = user.profileImage.contentType || 'image/jpeg';
          console.log('Created base64 string, length:', base64String ? base64String.length : 0);
          
          if (base64String) {
            const dataUrl = `data:${contentType};base64,${base64String}`;
            console.log('Setting image preview with data URL');
            setImagePreview(dataUrl);
          } else {
            console.warn('Could not create base64 string from image data');
          }
        } catch (imgErr) {
          console.error('Error processing image data:', imgErr);
        }
      } else {
        console.log('No profile image data found in user object');
      }
    } catch (err) {
      console.error('Error in image processing effect:', err);
    }
  }, [user]);

  // New useEffect to ensure we keep the local image preview if it exists
  useEffect(() => {
    // This effect ensures we don't lose the image preview when navigation happens
    return () => {
      // This cleanup function will run when the component unmounts
      // We can use it to save the image preview in sessionStorage if needed
      if (imagePreview) {
        console.log('Saving image preview to session storage');
        sessionStorage.setItem('lastImagePreview', imagePreview);
      }
    };
  }, [imagePreview]);

  // Another useEffect to restore the image preview from session storage on mount
  useEffect(() => {
    const savedPreview = sessionStorage.getItem('lastImagePreview');
    if (savedPreview) {
      console.log('Restoring image preview from session storage');
      setImagePreview(savedPreview);
      
      // If we're restoring from session storage, we need to also restore the file
      // This handles the case where a user refreshes after selecting but before uploading
      try {
        if (savedPreview.startsWith('data:image/')) {
          // Convert the data URL back to a file
          const dataURLParts = savedPreview.split(',');
          const mime = dataURLParts[0].match(/:(.*?);/)[1];
          const byteString = atob(dataURLParts[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const intArray = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([arrayBuffer], { type: mime });
          const fileName = 'restored_profile_image.' + mime.split('/')[1];
          const file = new File([blob], fileName, { type: mime });
          
          // Create a new DataTransfer object
          if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            console.log('Restored file to input element');
          }
        }
      } catch (err) {
        console.error('Error restoring file from data URL:', err);
      }
    }
  }, []);

  // Convert array buffer to base64 - improved version
  const arrayBufferToBase64 = (buffer) => {
    // Handle null/undefined
    if (!buffer) {
      console.warn('Received null/undefined buffer');
      return '';
    }
    
    console.log('Converting buffer to base64, type:', typeof buffer);
    
    // If we have a plain object representing a buffer (from JSON)
    if (typeof buffer === 'object' && !ArrayBuffer.isView(buffer) && !Array.isArray(buffer)) {
      try {
        // Try to convert object to Uint8Array
        console.log('Converting object buffer to Uint8Array');
        const values = Object.values(buffer);
        buffer = new Uint8Array(values);
      } catch (e) {
        console.error('Error converting object to Uint8Array:', e);
        return '';
      }
    }
    
    let binary = '';
    let bytes;
    
    // Handle different buffer types
    if (buffer instanceof ArrayBuffer) {
      bytes = new Uint8Array(buffer);
    } else if (ArrayBuffer.isView(buffer)) {
      bytes = new Uint8Array(buffer.buffer);
    } else if (Array.isArray(buffer)) {
      bytes = new Uint8Array(buffer);
    } else {
      console.error('Unsupported buffer type:', typeof buffer);
      return '';
    }
    
    // Convert Uint8Array to binary string
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Convert binary string to base64
    return window.btoa(binary);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (e, category, value) => {
    const isChecked = e.target.checked;
    
    setFormData(prevState => {
      const currentPreferences = {...prevState.petPreferences};
      
      if (isChecked) {
        // Add value if not already in the array
        if (!currentPreferences[category].includes(value)) {
          currentPreferences[category] = [...currentPreferences[category], value];
        }
      } else {
        // Remove value from array
        currentPreferences[category] = currentPreferences[category].filter(item => item !== value);
      }
      
      return {
        ...prevState,
        petPreferences: currentPreferences
      };
    });
  };

  const handleImageSelect = (e) => {
    console.log('File input change event triggered');
    const file = e.target.files?.[0];
    
    if (!file) {
      console.warn('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, 'type:', file.type, 'size:', file.size);
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Handle errors
    reader.onerror = () => {
      console.error('FileReader error');
      setError('Error reading the selected file. Please try another file.');
    };
    
    // Set up completion handler
    reader.onload = () => {
      console.log('File read completed');
      setImagePreview(reader.result);
    };
    
    // Read the file as a data URL (base64 encoded)
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) {
      setError('Please select an image first');
      return;
    }
    
    try {
      setUploadProgress(10);
      
      // Get the file from the hidden input
      const file = fileInputRef.current.files[0];
      console.log('Uploading file:', file.name, 'type:', file.type, 'size:', file.size);
      
      // Validate the file is an image and not too large
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file is not an image. Please select an image file.');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image is too large. Maximum size is 5MB.');
      }
      
      // Clear any existing errors
      setError(null);
      
      try {
        // Use the API service directly with the progress callback
        const response = await userAPI.uploadProfileImage(file, (progress) => {
          console.log(`Upload progress: ${progress}%`);
          setUploadProgress(progress);
        });
        
        console.log('Upload successful, response received:', response.data);
        
        // Check if the response includes a preview image
        if (response.data.user && response.data.user.profileImage) {
          if (response.data.user.profileImage.preview) {
            console.log('Using preview image from server response');
            setImagePreview(response.data.user.profileImage.preview);
            sessionStorage.setItem('lastImagePreview', response.data.user.profileImage.preview);
          } else if (typeof response.data.user.profileImage.data === 'string') {
            // If the server returns data as a base64 string
            console.log('Using image data from server response');
            const contentType = response.data.user.profileImage.contentType || 'image/jpeg';
            const imageUrl = `data:${contentType};base64,${response.data.user.profileImage.data}`;
            setImagePreview(imageUrl);
            sessionStorage.setItem('lastImagePreview', imageUrl);
          }
          // We already have a preview, so we just keep it
          else {
            console.log('No preview in response, keeping existing preview');
            if (imagePreview) {
              sessionStorage.setItem('lastImagePreview', imagePreview);
            }
          }
        } else {
          console.log('No image data in response, keeping existing preview');
          if (imagePreview) {
            sessionStorage.setItem('lastImagePreview', imagePreview);
          }
        }
        
        // Update the user state with the returned user data
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        // Ensure the progress bar completes
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1500);
        
        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (uploadErr) {
        console.error('Upload request failed:', uploadErr);
        
        // Handle specific error types
        if (uploadErr.response) {
          // The server responded with an error status
          const errorMessage = uploadErr.response.data?.message || 
                               `Server error: ${uploadErr.response.status} ${uploadErr.response.statusText}`;
          throw new Error(errorMessage);
        } else if (uploadErr.request) {
          // The request was made but no response was received
          throw new Error('No response from server. Please check your internet connection and try again.');
        } else {
          // Something else caused the error
          throw new Error(`Upload error: ${uploadErr.message}`);
        }
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadProgress(0);
      setError(`Image upload failed: ${err.message}`);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data to send to backend
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio
      };
      
      // Only include pet preferences if user is a buyer
      if (user && user.role === 'buyer') {
        updateData.petPreferences = formData.petPreferences;
      }
      
      // Send update request
      const response = await userAPI.updateProfile(updateData);
      
      // Update local state with response data
      setUser(response.data);
      
      // Exit edit mode and show success
      setEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      // Check specific error types
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (err.response.status === 400) {
          setError('Invalid data. Please check your input and try again.');
        } else {
          setError('Failed to update profile. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  // Add this function just before useEffect
  const getImageUrl = () => {
    // For debugging
    console.log('Getting image URL, imagePreview is:', imagePreview ? 'present' : 'null');
    
    if (imagePreview) {
      return imagePreview;
    }
    
    // For debugging, check what's in user.profileImage if it exists
    if (user && user.profileImage) {
      console.log('User profileImage:', {
        hasData: !!(user.profileImage && user.profileImage.data),
        dataType: user.profileImage.data ? typeof user.profileImage.data : 'none',
        contentType: user.profileImage.contentType,
        preview: user.profileImage.preview ? 'exists' : 'none'
      });
    }
    
    // Fallback to a plain colored circle
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23f8f9fa'/%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Create default empty object structure if user is null to prevent errors
  const defaultUser = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
    petPreferences: {
      species: [],
      breed: [],
      age: [],
      size: []
    },
    role: 'buyer', // Default role
    createdAt: new Date().toISOString()
  };

  // Use user data if available, otherwise use default structure
  const userData = user || defaultUser;
  const userRole = userData.role || 'buyer';

  return (
    <Container className="py-5">
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
        My Profile
      </h1>
      
      {saveSuccess && (
        <Alert variant="success" className="mb-4">
          Your profile has been successfully updated!
        </Alert>
      )}
      
      <Row>
        <Col md={3} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                {imagePreview || (user && user.profileImage && user.profileImage.data) ? (
                  <Image 
                    src={getImageUrl()} 
                    alt="Profile Picture" 
                    roundedCircle 
                    className="profile-image" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Error loading profile image');
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23f8f9fa'/%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div 
                    className="profile-image-placeholder rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <FontAwesomeIcon icon={faUser} size="4x" className="text-secondary" />
                  </div>
                )}
              </div>
              
              <Form.Group className="mb-3">
                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      // Directly create and click an input element
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        console.log('File selected:', file.name, 'type:', file.type, 'size:', file.size);
                        
                        // Read file as data URL
                        const reader = new FileReader();
                        reader.onload = () => {
                          console.log('File read completed');
                          setImagePreview(reader.result);
                        };
                        reader.onerror = () => {
                          console.error('FileReader error');
                          setError('Error reading the selected file. Please try another file.');
                        };
                        reader.readAsDataURL(file);
                        
                        // Store file in the ref for later upload
                        if (fileInputRef.current) {
                          // Create a new DataTransfer object
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          fileInputRef.current.files = dataTransfer.files;
                        }
                      };
                      input.click();
                    }}
                  >
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    Select Image
                  </Button>
                </div>
                
                {/* Hidden file input for form submission */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                
                {imagePreview && (
                  <div className="mt-2 text-center">
                    <small className="text-success">
                      Image selected. Click "Upload Image" to save.
                    </small>
                  </div>
                )}
              </Form.Group>
              
              {uploadProgress > 0 && (
                <div className="mb-3">
                  <div className="progress">
                    <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress}%` }} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                </div>
              )}
              
              <Button 
                variant="primary" 
                className="w-100 mt-2"
                onClick={handleImageUpload}
                disabled={!imagePreview || uploadProgress > 0}
              >
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
              </Button>
              
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="progress">
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }} 
                      aria-valuenow={uploadProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <Badge bg="secondary" className="me-2">{userRole}</Badge>
                <div className="text-muted mt-2">
                  <small>Member since {new Date(userData.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button 
                  variant={editing ? "outline-secondary" : "outline-primary"}
                  onClick={() => setEditing(!editing)}
                >
                  <FontAwesomeIcon icon={editing ? faSave : faEdit} className="me-2" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-4">
                    <h4 className="mb-3">Personal Information</h4>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={true} // Email cannot be edited
                        required
                      />
                      {editing && (
                        <Form.Text className="text-muted">
                          Contact support to change your email address.
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-4">
                    <h4 className="mb-3">Address</h4>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.street"
                        value={formData.address?.street || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.state"
                            value={formData.address?.state || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.zipCode"
                            value={formData.address?.zipCode || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.country"
                        value={formData.address?.country || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Tell us about yourself and your experience with pets..."
                  />
                </Form.Group>
                
                {userRole === 'buyer' && (
                  <div className="mb-4">
                    <h4 className="mb-3">
                      <FontAwesomeIcon icon={faPaw} className="me-2 text-primary" />
                      Pet Preferences
                    </h4>
                    <p className="text-muted">Select your preferences to receive personalized pet recommendations</p>
                    
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-bold">Species</Form.Label>
                        <div>
                          {['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish'].map((species) => (
                            <Form.Check
                              key={species}
                              type="checkbox"
                              id={`species-${species}`}
                              label={species}
                              checked={formData.petPreferences?.species?.includes(species) || false}
                              onChange={(e) => handleCheckboxChange(e, 'species', species)}
                              disabled={!editing}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-bold">Age</Form.Label>
                        <div>
                          {['Baby', 'Young', 'Adult', 'Senior'].map((age) => (
                            <Form.Check
                              key={age}
                              type="checkbox"
                              id={`age-${age}`}
                              label={age}
                              checked={formData.petPreferences?.age?.includes(age) || false}
                              onChange={(e) => handleCheckboxChange(e, 'age', age)}
                              disabled={!editing}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-bold">Size</Form.Label>
                        <div>
                          {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                            <Form.Check
                              key={size}
                              type="checkbox"
                              id={`size-${size}`}
                              label={size}
                              checked={formData.petPreferences?.size?.includes(size) || false}
                              onChange={(e) => handleCheckboxChange(e, 'size', size)}
                              disabled={!editing}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
                
                {editing && (
                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile; 