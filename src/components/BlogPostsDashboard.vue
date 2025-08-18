<template>
  <div class="blog-posts-container">
    <header class="header">
      <h1>Blog Posts Dashboard</h1>
      <button 
        v-if="isAuthenticated"
        @click="showForm = !showForm; if (!showForm) cancelEdit()" 
        class="add-button"
      >
        {{ showForm ? 'Hide Form' : 'Add New Post' }}
      </button>
      <div v-else class="auth-notice">
        <p>🔒 Login required to add or edit blog posts</p>
      </div>
    </header>

    <!-- Add/Edit Blog Post Form -->
    <div v-if="showForm && isAuthenticated" class="form-container">
      <h2>{{ isEditing ? 'Edit Blog Post' : 'Add a Blog Post' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-row">
          <div class="form-col">
            <label for="title">Title:</label>
            <input id="title" v-model="form.title" required />
          </div>
          <div class="form-col">
            <label for="slug">Slug:</label>
            <input id="slug" v-model="form.slug" required />
          </div>
        </div>
        
        <div class="form-section">
          <h3>Author Information</h3>
          <div class="form-row">
            <div class="form-col">
              <label for="author_name">Author Name:</label>
              <input id="author_name" v-model="form.author.name" required />
            </div>
            <div class="form-col">
              <label for="author_email">Author Email:</label>
              <input id="author_email" v-model="form.author.email" type="email" required />
            </div>
          </div>
        </div>

        <div>
          <label for="content">Content:</label>
          <textarea id="content" v-model="form.content" rows="8" required></textarea>
        </div>
        
        <div>
          <label for="excerpt">Excerpt:</label>
          <textarea id="excerpt" v-model="form.excerpt" rows="3" required></textarea>
        </div>

        <div class="form-row">
          <div class="form-col">
            <label for="status">Status:</label>
            <select id="status" v-model="form.status" required>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="form-col">
            <label for="category">Category:</label>
            <input id="category" v-model="form.category" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <label for="tags">Tags (comma-separated):</label>
            <input id="tags" v-model="tagsInput" placeholder="web, javascript, vue" />
          </div>
          <div class="form-col">
            <label for="reading_time">Reading Time (minutes):</label>
            <input id="reading_time" v-model="form.reading_time" type="number" min="1" required />
          </div>
        </div>

        <div>
          <label for="featured_image">Featured Image URL:</label>
          <input id="featured_image" v-model="form.featured_image" type="url" />
        </div>

        <div class="form-section">
          <h3>SEO Metadata</h3>
          <div class="form-row">
            <div class="form-col">
              <label for="meta_title">Meta Title:</label>
              <input id="meta_title" v-model="form.meta.title" />
            </div>
            <div class="form-col">
              <label for="meta_keywords">Meta Keywords:</label>
              <input id="meta_keywords" v-model="form.meta.keywords" />
            </div>
          </div>
          <div>
            <label for="meta_description">Meta Description:</label>
            <textarea id="meta_description" v-model="form.meta.description" rows="2"></textarea>
          </div>
        </div>

        <div class="form-buttons">
          <button type="submit">{{ isEditing ? 'Update Post' : 'Add Post' }}</button>
          <button v-if="isEditing" type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
      </form>
      <div v-if="response" class="response">
        {{ response }}
      </div>
    </div>

    <!-- Blog Posts Dashboard -->
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Blog Posts List</h2>
        <button @click="fetchBlogPosts" class="refresh-button">Refresh</button>
      </div>
      
      <div v-if="loading" class="loading">Loading blog posts...</div>
      
      <div v-else-if="blogPosts.length === 0" class="no-posts">
        No blog posts found. Add some posts to get started!
      </div>
      
      <div v-else class="posts-grid">
        <div v-for="post in blogPosts" :key="post.id" class="post-card">
          <div class="post-header">
            <h3>{{ post.title }}</h3>
            <span :class="['status-badge', post.status]">{{ post.status }}</span>
          </div>
          
          <div class="post-meta">
            <p><strong>Author:</strong> {{ post.author?.name || 'Unknown' }} ({{ post.author?.email || 'N/A' }})</p>
            <p><strong>Category:</strong> {{ post.category }}</p>
            <p><strong>Reading Time:</strong> {{ post.reading_time }} min</p>
            <p><strong>Slug:</strong> <code>{{ post.slug }}</code></p>
          </div>

          <div class="post-excerpt">
            <p>{{ post.excerpt }}</p>
          </div>

          <div class="post-tags" v-if="post.tags && post.tags.length > 0">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div class="post-stats">
            <span><i class="icon">👁</i> {{ post.views || 0 }}</span>
            <span><i class="icon">👍</i> {{ post.likes || 0 }}</span>
            <span><i class="icon">💬</i> {{ post.comments_count || 0 }}</span>
          </div>

          <div class="post-dates">
            <p><strong>Created:</strong> {{ formatDate(post.created_at) }}</p>
            <p v-if="post.published_at"><strong>Published:</strong> {{ formatDate(post.published_at) }}</p>
            <p><strong>Updated:</strong> {{ formatDate(post.updated_at) }}</p>
          </div>

          <div v-if="isAuthenticated" class="post-actions">
            <button @click="startEdit(post)" class="edit-button">Edit</button>
            <button @click="deleteBlogPost(post.id)" class="delete-button">Delete</button>
          </div>
          <div v-else class="read-only-notice">
            <small>🔒 Login to edit or delete</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../services/auth.js';

export default {
  name: 'BlogPostsDashboard',
  props: {
    isAuthenticated: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { getAuthHeaders } = useAuth();
    const form = ref({
      title: '',
      slug: '',
      author: {
        name: '',
        email: ''
      },
      content: '',
      excerpt: '',
      status: 'draft',
      tags: [],
      category: '',
      featured_image: '',
      reading_time: 1,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    });
    const response = ref(null);
    const blogPosts = ref([]);
    const loading = ref(false);
    const showForm = ref(false);
    const editingPost = ref(null);
    const isEditing = ref(false);
    const tagsInput = ref('');
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/db/blog-posts`;

    // Watch title to auto-generate slug
    watch(() => form.value.title, (newTitle) => {
      if (!isEditing.value && newTitle) {
        form.value.slug = newTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }
    });

    const fetchBlogPosts = async () => {
      loading.value = true;
      try {
        const res = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          blogPosts.value = data;
        } else {
          console.error('Failed to fetch blog posts');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err.message);
      } finally {
        loading.value = false;
      }
    };

    const deleteBlogPost = async (postId) => {
      if (!confirm('Are you sure you want to delete this blog post?')) {
        return;
      }
      
      try {
        const res = await fetch(`${apiEndpoint}/${postId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          // Remove post from local array
          blogPosts.value = blogPosts.value.filter(post => post.id !== postId);
          response.value = 'Blog post deleted successfully!';
        } else {
          const errorData = await res.json();
          alert('Failed to delete blog post: ' + (errorData.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Error deleting blog post: ' + err.message);
      }
    };

    const submitForm = async () => {
      try {
        // Convert tags input to array
        form.value.tags = tagsInput.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);

        let res;
        if (isEditing.value && editingPost.value) {
          // Update existing post
          res = await fetch(`${apiEndpoint}/${editingPost.value.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'Blog post updated successfully!';
            // Update post in local array
            const index = blogPosts.value.findIndex(p => p.id === editingPost.value.id);
            if (index !== -1) {
              blogPosts.value[index] = { ...editingPost.value, ...form.value };
            }
            // Reset editing state
            isEditing.value = false;
            editingPost.value = null;
          } else {
            const errorData = await res.json();
            response.value = 'Error: ' + (errorData.message || 'Failed to update blog post');
          }
        } else {
          // Add new post
          res = await fetch(apiEndpoint, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'Blog post added successfully!';
            // Refresh posts list to get the new post with ID
            fetchBlogPosts();
          } else {
            const errorData = await res.json();
            response.value = 'Error: ' + (errorData.message || 'Failed to add blog post');
          }
        }
        
        // Reset form and hide it
        resetForm();
        showForm.value = false;
      } catch (err) {
        response.value = 'Error: ' + err.message;
      }
    };

    const startEdit = (post) => {
      editingPost.value = post;
      isEditing.value = true;
      form.value = {
        title: post.title || '',
        slug: post.slug || '',
        author: {
          name: post.author?.name || '',
          email: post.author?.email || ''
        },
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        tags: post.tags || [],
        category: post.category || '',
        featured_image: post.featured_image || '',
        reading_time: post.reading_time || 1,
        meta: {
          title: post.meta?.title || '',
          description: post.meta?.description || '',
          keywords: post.meta?.keywords || ''
        }
      };
      tagsInput.value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
      showForm.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editingPost.value = null;
      showForm.value = false;
      resetForm();
    };

    const resetForm = () => {
      form.value = {
        title: '',
        slug: '',
        author: {
          name: '',
          email: ''
        },
        content: '',
        excerpt: '',
        status: 'draft',
        tags: [],
        category: '',
        featured_image: '',
        reading_time: 1,
        meta: {
          title: '',
          description: '',
          keywords: ''
        }
      };
      tagsInput.value = '';
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Fetch blog posts when component mounts
    onMounted(() => {
      fetchBlogPosts();
    });

    return { 
      form, 
      submitForm, 
      response, 
      blogPosts, 
      loading, 
      showForm, 
      fetchBlogPosts, 
      deleteBlogPost,
      startEdit,
      cancelEdit,
      isEditing,
      editingPost,
      tagsInput,
      formatDate
    };
  }
};
</script>

<style scoped>
.blog-posts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.header h1 {
  color: #333;
  margin: 0;
}

.add-button, .refresh-button {
  padding: 10px 20px;
  background: #6f42c1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover, .refresh-button:hover {
  background: #5a2d91;
}

.form-container {
  max-width: 800px;
  margin: 0 auto 40px;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-container h2 {
  text-align: center;
  color: #333;
  margin-top: 0;
}

.form-section {
  margin: 20px 0;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 5px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #555;
  font-size: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 16px;
}

.form-col {
  display: flex;
  flex-direction: column;
}

form > div {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #555;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

select {
  height: auto;
}

code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button[type="submit"] {
  flex: 1;
  padding: 12px;
  background: #6f42c1;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

button[type="submit"]:hover {
  background: #5a2d91;
}

.cancel-button {
  flex: 1;
  padding: 12px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.cancel-button:hover {
  background: #5a6268;
}

.response {
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  background: #e7d6ff;
  color: #5a2d91;
}

.dashboard {
  margin-top: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  color: #333;
  margin: 0;
}

.loading, .no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.post-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  margin-left: 10px;
}

.status-badge.published {
  background: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.archived {
  background: #f8d7da;
  color: #721c24;
}

.post-meta p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.post-excerpt {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-style: italic;
}

.post-tags {
  margin: 10px 0;
}

.tag {
  display: inline-block;
  background: #6f42c1;
  color: white;
  padding: 2px 8px;
  margin: 2px;
  border-radius: 12px;
  font-size: 12px;
}

.post-stats {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  padding: 8px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.icon {
  font-size: 14px;
}

.post-dates {
  margin: 10px 0;
}

.post-dates p {
  margin: 2px 0;
  font-size: 12px;
  color: #888;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.edit-button {
  flex: 1;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.edit-button:hover {
  background: #0056b3;
}

.delete-button {
  flex: 1;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.delete-button:hover {
  background: #c82333;
}

.auth-notice {
  text-align: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
}

.read-only-notice {
  text-align: center;
  padding: 8px;
  color: #6c757d;
  font-style: italic;
}

.read-only-notice small {
  color: #999;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
