<script>
import { ref, computed } from 'vue';
import MoviesDashboard from './components/MoviesDashboard.vue';
import CitiesDashboard from './components/CitiesDashboard.vue';
import BlogPostsDashboard from './components/BlogPostsDashboard.vue';
import BlogsPage from './components/BlogsPage.vue';
import ProfilePage from './components/ProfilePage.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import AuthComponent from './components/AuthComponent.vue';
import { useAuth } from './services/auth.js';

export default {
  name: 'App',
  components: {
    MoviesDashboard,
    CitiesDashboard,
    BlogPostsDashboard,
    BlogsPage,
    ProfilePage,
    AdminDashboard,
    AuthComponent
  },
  setup() {
    const currentDashboard = ref('blogs');
    const { isAuthenticated, user, logout } = useAuth();
    const showLogin = ref(false);

    const isAdmin = computed(() => {
      const adminStatus = user.value?.role === 'admin';
      console.log('User:', user.value);
      console.log('Is Admin:', adminStatus);
      return adminStatus;
    });

    const switchDashboard = (dashboard) => {
      // Protected routes that require authentication
      const protectedRoutes = ['profile'];
      const adminRoutes = ['admin'];
      
      // Check if trying to access a protected route without authentication
      if (protectedRoutes.includes(dashboard) && !isAuthenticated.value) {
        console.log('Access denied: Authentication required for', dashboard);
        showLogin.value = true;
        return;
      }
      
      // Check if trying to access admin route without admin privileges
      if (adminRoutes.includes(dashboard) && !isAdmin.value) {
        console.log('Access denied: Admin privileges required for', dashboard);
        return;
      }
      
      currentDashboard.value = dashboard;
    };

    const handleLoginSuccess = () => {
      showLogin.value = false;
      // Force reactivity by creating a new reference
      window.location.reload();
    };

    const handleLogout = () => {
      logout();
      window.location.reload();
    };

    return {
      currentDashboard,
      switchDashboard,
      isAuthenticated,
      user,
      isAdmin,
      showLogin,
      handleLoginSuccess,
      handleLogout
    };
  }
};
</script>

<template>
  <div class="app">
    <!-- Main Navigation - Always visible -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Dashboard Hub</h1>
      </div>
      <div class="nav-center">
        <div class="nav-links">
          <button 
            @click="switchDashboard('movies')" 
            :class="{ active: currentDashboard === 'movies' }"
            class="nav-button"
          >
            Movies
          </button>
          <button 
            @click="switchDashboard('cities')" 
            :class="{ active: currentDashboard === 'cities' }"
            class="nav-button"
          >
            Cities
          </button>
          <button 
            @click="switchDashboard('blog-posts')" 
            :class="{ active: currentDashboard === 'blog-posts' }"
            class="nav-button"
          >
            Blog Posts
          </button>
          <button 
            @click="switchDashboard('blogs')" 
            :class="{ active: currentDashboard === 'blogs' }"
            class="nav-button"
          >
            📖 Blogs
          </button>
          <button 
            v-if="isAdmin"
            @click="switchDashboard('admin')" 
            :class="{ active: currentDashboard === 'admin' }"
            class="nav-button admin-button"
          >
            👨‍💼 Admin
          </button>
        </div>
      </div>
      <div class="nav-user">
        <!-- Show login button if not authenticated -->
        <div v-if="!isAuthenticated" class="auth-actions">
          <button @click="showLogin = true" class="login-button">Login</button>
        </div>
        <!-- Show user info if authenticated -->
        <div v-else class="user-actions">
          <button 
            @click="switchDashboard('profile')" 
            :class="{ active: currentDashboard === 'profile' }"
            class="profile-button"
          >
            👤 Profile
          </button>
          <span class="user-info">
            Welcome, {{ user?.username || 'User' }}! 
            <span v-if="isAdmin" class="admin-badge">Admin</span>
          </span>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
      </div>
    </nav>

    <!-- Login Modal -->
    <div v-if="showLogin && !isAuthenticated" class="modal-overlay" @click="showLogin = false">
      <div class="modal-content" @click.stop>
        <AuthComponent @login-success="handleLoginSuccess" />
        <button @click="showLogin = false" class="close-modal">×</button>
      </div>
    </div>

    <!-- Main Content - Always visible -->
    <main class="main-content">
      <MoviesDashboard v-if="currentDashboard === 'movies'" :is-authenticated="isAuthenticated" />
      <CitiesDashboard v-if="currentDashboard === 'cities'" :is-authenticated="isAuthenticated" />
      <BlogPostsDashboard v-if="currentDashboard === 'blog-posts'" :is-authenticated="isAuthenticated" />
      <BlogsPage v-if="currentDashboard === 'blogs'" />
      <ProfilePage v-if="currentDashboard === 'profile' && isAuthenticated" @navigate="switchDashboard" />
      <AdminDashboard v-if="currentDashboard === 'admin' && isAdmin" />
      
      <!-- Protected Route Access Denied -->
      <div v-if="currentDashboard === 'profile' && !isAuthenticated" class="access-denied">
        <div class="access-denied-content">
          <h2>🔒 Access Denied</h2>
          <p>You must be logged in to view your profile.</p>
          <button @click="showLogin = true" class="login-required-button">Login to Continue</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
}

.navbar {
  background: #343a40;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  background: transparent;
  color: white;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.nav-button.active {
  background: #007bff;
  border-color: #007bff;
}

.admin-button {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-color: #dc3545;
}

.admin-button:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  border-color: #c82333;
}

.admin-button.active {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.admin-badge {
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 8px;
  font-weight: bold;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-button {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background: #218838;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #6f42c1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.profile-button:hover {
  background: linear-gradient(135deg, #5a2d91, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
}

.profile-button.active {
  background: linear-gradient(135deg, #5a2d91, #7c3aed);
  box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.25);
}

.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px;
}

.access-denied-content {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #dc3545;
  max-width: 500px;
}

.access-denied-content h2 {
  color: #dc3545;
  margin-bottom: 20px;
  font-size: 2rem;
}

.access-denied-content p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.5;
}

.login-required-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-required-button:hover {
  background: linear-gradient(135deg, #218838, #17a2b8);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  z-index: 1001;
}

.close-modal:hover {
  color: #333;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.9rem;
  color: #ccc;
}

.logout-button {
  padding: 0.4rem 0.8rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background: #c82333;
}

.main-content {
  padding: 0;
}
</style>
