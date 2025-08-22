<template>
  <div class="admin-container">
    <!-- Admin Access Check -->
    <div v-if="!isAdmin" class="access-denied">
      <div class="access-denied-content">
        <h2>🚫 Access Denied</h2>
        <p>You need administrator privileges to access this dashboard.</p>
        <p>Please contact your system administrator if you believe this is an error.</p>
      </div>
    </div>

    <!-- Admin Dashboard Content -->
    <div v-else>
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="admin-tabs">
          <button 
            @click="activeTab = 'overview'; loadTabData()" 
            :class="{ active: activeTab === 'overview' }"
            class="tab-button"
          >
            📊 Overview
          </button>
          <button 
            @click="activeTab = 'users'; loadTabData()" 
            :class="{ active: activeTab === 'users' }"
            class="tab-button"
          >
            👥 Users
          </button>
          <button 
            @click="activeTab = 'analytics'; loadTabData()" 
            :class="{ active: activeTab === 'analytics' }"
            class="tab-button"
          >
            📈 Analytics
          </button>
        </div>
      </header>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="tab-content">
      <div v-if="loading.overview" class="loading">Loading overview...</div>
      <div v-else-if="dashboardData" class="overview-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ dashboardData.overview?.totalUsers || 0 }}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏙️</div>
          <div class="stat-content">
            <h3>{{ dashboardData.overview?.totalCities || 0 }}</h3>
            <p>Cities</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎬</div>
          <div class="stat-content">
            <h3>{{ dashboardData.overview?.totalMovies || 0 }}</h3>
            <p>Movies</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{ dashboardData.overview?.totalBlogPosts || 0 }}</h3>
            <p>Blog Posts</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="dashboardData?.recentUsers" class="recent-section">
        <h2>Recent Users</h2>
        <div class="recent-users">
          <div v-for="user in dashboardData.recentUsers" :key="user.id" class="user-item">
            <div class="user-info">
              <strong>{{ user.username }}</strong>
              <span class="user-email">{{ user.email }}</span>
            </div>
            <div class="user-meta">
              <span :class="['role-badge', user.role]">{{ user.role }}</span>
              <span class="join-date">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Statistics -->
      <div v-if="dashboardData?.contentStats" class="content-stats">
        <h2>Content Statistics</h2>
        <div class="stats-grid">
          <div v-if="dashboardData.contentStats.blogPostsByStatus" class="stat-item">
            <h3>Blog Posts by Status</h3>
            <div class="status-list">
              <div v-for="(count, status) in dashboardData.contentStats.blogPostsByStatus" :key="status" class="status-item">
                <span :class="['status-badge', status]">{{ status }}</span>
                <span class="count">{{ count }}</span>
              </div>
            </div>
          </div>
          <div v-if="dashboardData.contentStats.topCountries" class="stat-item">
            <h3>Top Countries (by cities)</h3>
            <div class="country-list">
              <div v-for="country in dashboardData.contentStats.topCountries" :key="country.country" class="country-item">
                <span class="country-name">{{ country.country }}</span>
                <span class="count">{{ country.count }} cities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="users-header">
        <h2>User Management</h2>
        <div class="users-controls">
          <input 
            v-model="userSearch" 
            placeholder="Search users..." 
            class="search-input"
            @input="debouncedSearchUsers"
          />
          <select v-model="userFilter.role" @change="fetchUsers" class="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select v-model="userFilter.status" @change="fetchUsers" class="filter-select">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div v-if="loading.users" class="loading">Loading users...</div>
      <div v-else-if="users.length === 0" class="no-data">No users found</div>
      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td><strong>{{ user.username }}</strong></td>
              <td>{{ user.email }}</td>
              <td>{{ user.first_name }} {{ user.last_name }}</td>
              <td>
                <select 
                  :value="user.role" 
                  @change="updateUserRole(user.id, $event.target.value)"
                  class="role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button 
                  @click="toggleUserStatus(user.id, user.is_active)"
                  :class="['status-toggle', user.is_active ? 'active' : 'inactive']"
                >
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ user.last_login ? formatDate(user.last_login) : 'Never' }}</td>
              <td>
                <button @click="viewUserDetails(user)" class="action-button">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="usersPagination && usersPagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(usersPagination.currentPage - 1)"
          :disabled="usersPagination.currentPage <= 1"
          class="page-button"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ usersPagination.currentPage }} of {{ usersPagination.totalPages }}
          ({{ usersPagination.totalUsers }} total users)
        </span>
        <button 
          @click="changePage(usersPagination.currentPage + 1)"
          :disabled="usersPagination.currentPage >= usersPagination.totalPages"
          class="page-button"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="tab-content">
      <div v-if="loading.analytics" class="loading">Loading analytics...</div>
      <div v-else-if="analytics" class="analytics-grid">
        <div class="analytics-card">
          <h3>User Registration Trends</h3>
          <div v-if="analytics.userRegistrationTrends" class="trend-data">
            <div v-for="trend in analytics.userRegistrationTrends" :key="trend.period" class="trend-item">
              <span class="period">{{ trend.period }}</span>
              <span class="count">{{ trend.count }} users</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h3>Engagement Metrics</h3>
          <div v-if="analytics.engagement" class="engagement-data">
            <div class="metric">
              <span class="label">Active Users (30 days):</span>
              <span class="value">{{ analytics.engagement.activeUsers30d || 0 }}</span>
            </div>
            <div class="metric">
              <span class="label">Blog Posts Created (30 days):</span>
              <span class="value">{{ analytics.engagement.postsCreated30d || 0 }}</span>
            </div>
            <div class="metric">
              <span class="label">Average Session Duration:</span>
              <span class="value">{{ analytics.engagement.avgSessionDuration || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h3>Content Performance</h3>
          <div v-if="analytics.content" class="content-data">
            <div class="metric">
              <span class="label">Published Posts:</span>
              <span class="value">{{ analytics.content.publishedPosts || 0 }}</span>
            </div>
            <div class="metric">
              <span class="label">Draft Posts:</span>
              <span class="value">{{ analytics.content.draftPosts || 0 }}</span>
            </div>
            <div class="metric">
              <span class="label">Most Popular Category:</span>
              <span class="value">{{ analytics.content.popularCategory || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>User Details</h3>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="user-detail">
            <strong>Username:</strong> {{ selectedUser.username }}
          </div>
          <div class="user-detail">
            <strong>Email:</strong> {{ selectedUser.email }}
          </div>
          <div class="user-detail">
            <strong>Name:</strong> {{ selectedUser.first_name }} {{ selectedUser.last_name }}
          </div>
          <div class="user-detail">
            <strong>Role:</strong> {{ selectedUser.role }}
          </div>
          <div class="user-detail">
            <strong>Status:</strong> {{ selectedUser.is_active ? 'Active' : 'Inactive' }}
          </div>
          <div class="user-detail">
            <strong>Joined:</strong> {{ formatDate(selectedUser.created_at) }}
          </div>
          <div class="user-detail">
            <strong>Last Login:</strong> {{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never' }}
          </div>
          <div class="user-detail">
            <strong>Last Updated:</strong> {{ formatDate(selectedUser.updated_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Response Messages -->
    <div v-if="response" :class="['response-message', responseType]">
      {{ response }}
    </div>
    
    </div> <!-- End of v-else admin dashboard content -->
  </div> <!-- End of admin-container -->
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../services/auth.js'

export default {
  name: 'AdminDashboard',
  setup() {
    const { getAuthHeaders, user } = useAuth()
    
    // Check if user is admin
    const isAdmin = computed(() => user.value?.role === 'admin')
    
    const activeTab = ref('overview')
    const loading = ref({
      overview: false,
      users: false,
      analytics: false
    })
    
    // Data
    const dashboardData = ref(null)
    const users = ref([])
    const analytics = ref(null)
    const usersPagination = ref(null)
    const selectedUser = ref(null)
    
    // User management
    const userSearch = ref('')
    const userFilter = ref({
      role: '',
      status: ''
    })
    
    // Response handling
    const response = ref('')
    const responseType = ref('success')
    
    const apiBase = import.meta.env.VITE_API_BASE_URL
    
    // Fetch dashboard overview
    const fetchDashboard = async () => {
      if (!isAdmin.value) return
      
      loading.value.overview = true
      try {
        const res = await fetch(`${apiBase}/admin/dashboard`, {
          headers: getAuthHeaders()
        })
        
        if (res.ok) {
          dashboardData.value = await res.json()
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
      } finally {
        loading.value.overview = false
      }
    }
    
    // Fetch users with pagination and filtering
    const fetchUsers = async (page = 1) => {
      if (!isAdmin.value) return
      
      loading.value.users = true
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        })
        
        if (userSearch.value) params.append('search', userSearch.value)
        if (userFilter.value.role) params.append('role', userFilter.value.role)
        if (userFilter.value.status) params.append('active', userFilter.value.status)
        
        const res = await fetch(`${apiBase}/admin/users?${params}`, {
          headers: getAuthHeaders()
        })
        
        if (res.ok) {
          const data = await res.json()
          users.value = data.users || []
          usersPagination.value = data.pagination || null
        } else {
          console.error('Failed to fetch users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        loading.value.users = false
      }
    }
    
    // Fetch analytics
    const fetchAnalytics = async () => {
      if (!isAdmin.value) return
      
      loading.value.analytics = true
      try {
        const res = await fetch(`${apiBase}/admin/analytics`, {
          headers: getAuthHeaders()
        })
        
        if (res.ok) {
          analytics.value = await res.json()
        } else {
          console.error('Failed to fetch analytics')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        loading.value.analytics = false
      }
    }
    
    // Update user role
    const updateUserRole = async (userId, newRole) => {
      try {
        const res = await fetch(`${apiBase}/admin/users/${userId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: newRole })
        })
        
        if (res.ok) {
          const updatedUser = await res.json()
          const index = users.value.findIndex(u => u.id === userId)
          if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updatedUser.user }
          }
          showResponse('User role updated successfully', 'success')
        } else {
          const error = await res.json()
          showResponse('Failed to update user role: ' + error.message, 'error')
        }
      } catch (err) {
        showResponse('Error updating user role: ' + err.message, 'error')
      }
    }
    
    // Toggle user status
    const toggleUserStatus = async (userId, currentStatus) => {
      try {
        const res = await fetch(`${apiBase}/admin/users/${userId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_active: !currentStatus })
        })
        
        if (res.ok) {
          const updatedUser = await res.json()
          const index = users.value.findIndex(u => u.id === userId)
          if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updatedUser.user }
          }
          showResponse('User status updated successfully', 'success')
        } else {
          const error = await res.json()
          showResponse('Failed to update user status: ' + error.message, 'error')
        }
      } catch (err) {
        showResponse('Error updating user status: ' + err.message, 'error')
      }
    }
    
    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const showResponse = (message, type = 'success') => {
      response.value = message
      responseType.value = type
      setTimeout(() => {
        response.value = ''
      }, 5000)
    }
    
    const changePage = (page) => {
      if (page >= 1 && page <= usersPagination.value?.totalPages) {
        fetchUsers(page)
      }
    }
    
    const viewUserDetails = (user) => {
      selectedUser.value = user
    }
    
    const closeModal = () => {
      selectedUser.value = null
    }
    
    // Debounced search
    let searchTimeout
    const debouncedSearchUsers = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        fetchUsers(1)
      }, 500)
    }
    
    // Load data based on active tab
    const loadTabData = () => {
      switch (activeTab.value) {
        case 'overview':
          fetchDashboard()
          break
        case 'users':
          fetchUsers()
          break
        case 'analytics':
          fetchAnalytics()
          break
      }
    }
    
    // Watch for tab changes
    const changeTab = (tab) => {
      activeTab.value = tab
      loadTabData()
    }
    
    // Initial load
    onMounted(() => {
      if (isAdmin.value) {
        loadTabData()
      }
    })
    
    return {
      activeTab,
      loading,
      dashboardData,
      users,
      analytics,
      usersPagination,
      selectedUser,
      userSearch,
      userFilter,
      response,
      responseType,
      isAdmin,
      fetchUsers,
      updateUserRole,
      toggleUserStatus,
      formatDate,
      changePage,
      viewUserDetails,
      closeModal,
      debouncedSearchUsers,
      loadTabData,
      changeTab
    }
  }
}
</script>

<style scoped>
/* Access Denied Styles */
.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.access-denied-content {
  text-align: center;
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #dc3545;
}

.access-denied-content h2 {
  color: #dc3545;
  margin-bottom: 20px;
  font-size: 2rem;
}

.access-denied-content p {
  color: #666;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #333;
  margin-bottom: 20px;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #eee;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: #f8f9fa;
}

.tab-button.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: bold;
}

.tab-content {
  padding: 30px 0;
}

/* Overview Styles */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #007bff;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-weight: 500;
}

.recent-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.recent-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.recent-users {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.user-info strong {
  color: #333;
}

.user-email {
  color: #666;
  font-size: 0.9rem;
  margin-left: 8px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.role-badge.admin {
  background: #dc3545;
  color: white;
}

.role-badge.user {
  background: #28a745;
  color: white;
}

.join-date {
  color: #666;
  font-size: 0.9rem;
}

.content-stats {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content-stats h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.stat-item h3 {
  margin-bottom: 15px;
  color: #555;
}

.status-list, .country-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item, .country-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.published {
  background: #28a745;
  color: white;
}

.status-badge.draft {
  background: #ffc107;
  color: #333;
}

.count {
  font-weight: bold;
  color: #333;
}

/* Users Management Styles */
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.users-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  min-width: 200px;
}

.users-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.role-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-toggle {
  padding: 4px 12px;
  border: none;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.status-toggle.active {
  background: #28a745;
  color: white;
}

.status-toggle.inactive {
  background: #dc3545;
  color: white;
}

.action-button {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-button:hover {
  background: #0056b3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
}

.page-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

/* Analytics Styles */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.analytics-card h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.trend-data, .engagement-data, .content-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.metric:last-child {
  border-bottom: none;
}

.metric .label {
  color: #666;
}

.metric .value {
  font-weight: bold;
  color: #333;
}

/* Modal Styles */
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
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.user-detail {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.user-detail:last-child {
  border-bottom: none;
}

/* Response Messages */
.response-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 1001;
}

.response-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.response-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-container {
    padding: 10px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .users-controls {
    justify-content: stretch;
  }
  
  .users-controls > * {
    flex: 1;
  }
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1rem;
}
</style>
