<template>
  <div class="profile-page">
    <div class="profile-container">
      <header class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ getInitials(user?.username || 'User') }}
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ user?.username || 'Unknown User' }}</h1>
          <p class="email">{{ user?.email || 'No email provided' }}</p>
          <div class="role-badge" :class="user?.role">
            <i class="role-icon">{{ getRoleIcon(user?.role) }}</i>
            {{ user?.role || 'user' }}
          </div>
        </div>
      </header>

      <div class="profile-content">
        <div class="profile-sections">
          <!-- Account Information Section -->
          <section class="profile-section">
            <h2>
              <i class="section-icon">👤</i>
              Account Information
            </h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Username</label>
                <p>{{ user?.username || 'Not provided' }}</p>
              </div>
              <div class="info-item">
                <label>Email Address</label>
                <p>{{ user?.email || 'Not provided' }}</p>
              </div>
              <div class="info-item">
                <label>Account Role</label>
                <p class="role-text">{{ formatRole(user?.role) }}</p>
              </div>
              <div class="info-item">
                <label>Member Since</label>
                <p>{{ formatDate(user?.created_at) }}</p>
              </div>
            </div>
          </section>

          <!-- Account Activity Section -->
          <section class="profile-section">
            <h2>
              <i class="section-icon">📊</i>
              Account Activity
            </h2>
            <div class="activity-grid">
              <div class="activity-card">
                <div class="activity-icon">🎬</div>
                <div class="activity-info">
                  <h3>Movies</h3>
                  <p>{{ stats.movies || 0 }} interactions</p>
                </div>
              </div>
              <div class="activity-card">
                <div class="activity-icon">🏙️</div>
                <div class="activity-info">
                  <h3>Cities</h3>
                  <p>{{ stats.cities || 0 }} interactions</p>
                </div>
              </div>
              <div class="activity-card">
                <div class="activity-icon">📝</div>
                <div class="activity-info">
                  <h3>Blog Posts</h3>
                  <p>{{ stats.blogPosts || 0 }} interactions</p>
                </div>
              </div>
              <div class="activity-card">
                <div class="activity-icon">⏰</div>
                <div class="activity-info">
                  <h3>Last Login</h3>
                  <p>{{ formatDate(user?.last_login) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Security Settings Section -->
          <section class="profile-section">
            <h2>
              <i class="section-icon">🔒</i>
              Security & Preferences
            </h2>
            <div class="security-options">
              <div class="security-item">
                <div class="security-info">
                  <h3>Password</h3>
                  <p>Last changed {{ getPasswordAge() }}</p>
                </div>
                <button class="btn btn-outline" @click="showChangePassword = true">
                  Change Password
                </button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <h3>Session Management</h3>
                  <p>Active session on this device</p>
                </div>
                <button class="btn btn-outline" @click="logoutAllDevices">
                  Logout All Devices
                </button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <h3>Account Status</h3>
                  <p class="status-active">Active account</p>
                </div>
                <button class="btn btn-danger" @click="showDeleteAccount = true">
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          <!-- Admin Features (if admin) -->
          <section v-if="isAdmin" class="profile-section admin-section">
            <h2>
              <i class="section-icon">👨‍💼</i>
              Administrator Features
            </h2>
            <div class="admin-features">
              <div class="feature-card">
                <div class="feature-icon">⚙️</div>
                <div class="feature-info">
                  <h3>System Management</h3>
                  <p>Access admin dashboard</p>
                </div>
                <button class="btn btn-primary" @click="goToAdmin">
                  Open Admin Panel
                </button>
              </div>
              <div class="feature-card">
                <div class="feature-icon">👥</div>
                <div class="feature-info">
                  <h3>User Management</h3>
                  <p>Manage all user accounts</p>
                </div>
                <button class="btn btn-primary" @click="goToAdmin">
                  Manage Users
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Change Password</h3>
          <button @click="showChangePassword = false" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                v-model="passwordForm.current" 
                required 
                placeholder="Enter current password"
              />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                v-model="passwordForm.new" 
                required 
                placeholder="Enter new password"
                minlength="6"
              />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                v-model="passwordForm.confirm" 
                required 
                placeholder="Confirm new password"
              />
            </div>
            <div class="form-buttons">
              <button type="submit" class="btn btn-primary" :disabled="!isPasswordFormValid">
                Update Password
              </button>
              <button type="button" @click="showChangePassword = false" class="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
          <div v-if="passwordMessage" class="message" :class="passwordMessage.type">
            {{ passwordMessage.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteAccount" class="modal-overlay" @click="showDeleteAccount = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Delete Account</h3>
          <button @click="showDeleteAccount = false" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="warning-content">
            <div class="warning-icon">⚠️</div>
            <h4>This action cannot be undone</h4>
            <p>Deleting your account will permanently remove all your data and access to the platform.</p>
            
            <div class="confirmation-input">
              <label>Type "DELETE" to confirm:</label>
              <input 
                type="text" 
                v-model="deleteConfirmation" 
                placeholder="Type DELETE"
                style="text-transform: uppercase;"
              />
            </div>
            
            <div class="form-buttons">
              <button 
                @click="deleteAccount" 
                class="btn btn-danger" 
                :disabled="deleteConfirmation !== 'DELETE'"
              >
                Delete My Account
              </button>
              <button @click="showDeleteAccount = false" class="btn btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../services/auth.js';

export default {
  name: 'ProfilePage',
  emits: ['navigate'],
  setup(props, { emit }) {
    const { user, logout } = useAuth();
    const stats = ref({
      movies: 0,
      cities: 0,
      blogPosts: 0
    });
    
    const showChangePassword = ref(false);
    const showDeleteAccount = ref(false);
    const deleteConfirmation = ref('');
    
    const passwordForm = ref({
      current: '',
      new: '',
      confirm: ''
    });
    
    const passwordMessage = ref(null);

    const isAdmin = computed(() => user.value?.role === 'admin');

    const isPasswordFormValid = computed(() => {
      return passwordForm.value.current && 
             passwordForm.value.new && 
             passwordForm.value.confirm && 
             passwordForm.value.new === passwordForm.value.confirm &&
             passwordForm.value.new.length >= 6;
    });

    const getInitials = (name) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getRoleIcon = (role) => {
      switch(role) {
        case 'admin': return '👨‍💼';
        case 'moderator': return '🛡️';
        default: return '👤';
      }
    };

    const formatRole = (role) => {
      if (!role) return 'Standard User';
      return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return 'Invalid Date';
      }
    };

    const getPasswordAge = () => {
      // Since we don't have password change tracking, return a default
      return "over 30 days ago";
    };

    const loadUserStats = async () => {
      // Simulate loading user activity stats
      // In a real app, this would fetch from your API
      stats.value = {
        movies: Math.floor(Math.random() * 50) + 5,
        cities: Math.floor(Math.random() * 30) + 2,
        blogPosts: Math.floor(Math.random() * 20) + 1
      };
    };

    const changePassword = async () => {
      if (!isPasswordFormValid.value) return;
      
      try {
        // Simulate password change API call
        // In a real app, this would call your backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        passwordMessage.value = {
          type: 'success',
          text: 'Password updated successfully!'
        };
        
        // Clear form
        passwordForm.value = {
          current: '',
          new: '',
          confirm: ''
        };
        
        setTimeout(() => {
          showChangePassword.value = false;
          passwordMessage.value = null;
        }, 2000);
        
      } catch (error) {
        passwordMessage.value = {
          type: 'error',
          text: 'Failed to update password. Please try again.'
        };
      }
    };

    const logoutAllDevices = async () => {
      if (confirm('This will log you out of all devices. Continue?')) {
        logout();
        emit('navigate', 'movies');
      }
    };

    const deleteAccount = async () => {
      if (deleteConfirmation.value !== 'DELETE') return;
      
      if (confirm('Are you absolutely sure? This cannot be undone.')) {
        try {
          // Simulate account deletion
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          alert('Account deleted successfully. You will now be logged out.');
          logout();
          emit('navigate', 'movies');
          
        } catch (error) {
          alert('Failed to delete account. Please try again.');
        }
      }
    };

    const goToAdmin = () => {
      emit('navigate', 'admin');
    };

    onMounted(() => {
      loadUserStats();
    });

    return {
      user,
      stats,
      isAdmin,
      showChangePassword,
      showDeleteAccount,
      deleteConfirmation,
      passwordForm,
      passwordMessage,
      isPasswordFormValid,
      getInitials,
      getRoleIcon,
      formatRole,
      formatDate,
      getPasswordAge,
      changePassword,
      logoutAllDevices,
      deleteAccount,
      goToAdmin
    };
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  background: white;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.profile-info h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 8px;
}

.email {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 15px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.role-badge.admin {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.role-badge.user {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.profile-content {
  display: grid;
  gap: 30px;
}

.profile-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.section-icon {
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.info-item label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.role-text {
  font-weight: 600;
  color: #667eea !important;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
}

.activity-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 4px;
}

.activity-info p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.security-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.security-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 4px;
}

.security-info p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.status-active {
  color: #28a745 !important;
  font-weight: 600 !important;
}

.admin-section {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.admin-section h2 {
  color: white;
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.admin-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.feature-info h3 {
  color: white;
  margin-bottom: 4px;
}

.feature-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 20px;
  border-bottom: 2px solid #f0f0f0;
}

.modal-header h3 {
  color: #333;
  margin: 0;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.form-buttons .btn {
  flex: 1;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.warning-content {
  text-align: center;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.warning-content h4 {
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.warning-content p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}

.confirmation-input {
  text-align: left;
  margin-bottom: 30px;
}

.confirmation-input label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  display: block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-page {
    padding: 10px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .profile-info h1 {
    font-size: 2rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-grid {
    grid-template-columns: 1fr;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .admin-features {
    grid-template-columns: 1fr;
  }
  
  .feature-card {
    flex-direction: column;
    text-align: center;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}
</style>
