<template>
  <div class="blogs-page">
    <header class="page-header">
      <h1>Blog Posts</h1>
      <p class="page-subtitle">Discover our latest articles and insights</p>
    </header>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading blog posts...</p>
    </div>

    <div v-else-if="blogPosts.length === 0" class="no-posts">
      <div class="empty-state">
        <h2>No Blog Posts Yet</h2>
        <p>Check back soon for new content!</p>
      </div>
    </div>

    <div v-else class="blog-feed">
      <article 
        v-for="post in blogPosts" 
        :key="post.id" 
        class="blog-card"
        @click="openDetailView(post)"
      >
        <div class="post-header">
          <h2 class="post-title">{{ post.title }}</h2>
          <div class="post-meta">
            <span class="author">
              <i class="icon">👤</i>
              {{ post.author?.name || 'Anonymous' }}
            </span>
            <span class="date">
              <i class="icon">📅</i>
              {{ formatDate(post.published_at || post.created_at) }}
            </span>
            <span class="reading-time">
              <i class="icon">⏱️</i>
              {{ post.reading_time }} min read
            </span>
          </div>
        </div>

        <div class="post-excerpt">
          <p>{{ post.excerpt }}</p>
        </div>

        <div class="post-tags" v-if="post.tags && post.tags.length > 0">
          <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
            {{ tag }}
          </span>
          <span v-if="post.tags.length > 3" class="tag more-tags">
            +{{ post.tags.length - 3 }} more
          </span>
        </div>

        <div class="post-stats">
          <span class="stat">
            <i class="icon">👁️</i>
            {{ formatNumber(post.views || 0) }}
          </span>
          <span class="stat">
            <i class="icon">👍</i>
            {{ formatNumber(post.likes || 0) }}
          </span>
          <span class="stat">
            <i class="icon">💬</i>
            {{ formatNumber(post.comments_count || 0) }}
          </span>
          <span class="category">{{ post.category }}</span>
        </div>

        <div class="read-more">
          <span class="read-more-text">Read full article →</span>
        </div>
      </article>
    </div>

    <!-- Blog Detail Modal -->
    <div v-if="selectedPost" class="modal-overlay" @click.self="closeDetailView">
      <div class="modal-content blog-detail">
        <button @click="closeDetailView" class="close-button">&times;</button>
        
        <header class="detail-header">
          <h1 class="detail-title">{{ selectedPost.title }}</h1>
          
          <div class="detail-meta">
            <div class="author-info">
              <strong>{{ selectedPost.author?.name || 'Anonymous' }}</strong>
              <span class="author-email">{{ selectedPost.author?.email }}</span>
            </div>
            <div class="post-info">
              <span class="publish-date">
                <i class="icon">📅</i>
                {{ formatDate(selectedPost.published_at || selectedPost.created_at) }}
              </span>
              <span class="reading-time">
                <i class="icon">⏱️</i>
                {{ selectedPost.reading_time }} min read
              </span>
              <span class="category-badge">{{ selectedPost.category }}</span>
            </div>
          </div>

          <div class="detail-tags" v-if="selectedPost.tags && selectedPost.tags.length > 0">
            <span v-for="tag in selectedPost.tags" :key="tag" class="detail-tag">
              {{ tag }}
            </span>
          </div>
        </header>

        <div class="detail-content">
          <div class="excerpt-section">
            <h3>Summary</h3>
            <p class="excerpt">{{ selectedPost.excerpt }}</p>
          </div>

          <div class="content-section">
            <h3>Full Article</h3>
            <div class="content" v-html="formatContent(selectedPost.content)"></div>
          </div>

          <div class="detail-stats">
            <div class="stat-item">
              <i class="icon">👁️</i>
              <span>{{ formatNumber(selectedPost.views || 0) }} views</span>
            </div>
            <div class="stat-item">
              <i class="icon">👍</i>
              <span>{{ formatNumber(selectedPost.likes || 0) }} likes</span>
            </div>
            <div class="stat-item">
              <i class="icon">💬</i>
              <span>{{ formatNumber(selectedPost.comments_count || 0) }} comments</span>
            </div>
          </div>

          <div class="post-dates">
            <p><strong>Created:</strong> {{ formatDate(selectedPost.created_at) }}</p>
            <p v-if="selectedPost.published_at"><strong>Published:</strong> {{ formatDate(selectedPost.published_at) }}</p>
            <p><strong>Last Updated:</strong> {{ formatDate(selectedPost.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'BlogsPage',
  setup() {
    const blogPosts = ref([]);
    const loading = ref(false);
    const selectedPost = ref(null);
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/db/blog-posts`;

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
          // Filter only published posts for public view
          blogPosts.value = data.filter(post => post.status === 'published').sort((a, b) => {
            const dateA = new Date(b.published_at || b.created_at);
            const dateB = new Date(a.published_at || a.created_at);
            return dateA - dateB;
          });
        } else {
          console.error('Failed to fetch blog posts');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err.message);
      } finally {
        loading.value = false;
      }
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

    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    };

    const formatContent = (content) => {
      if (!content) return '';
      // Basic formatting: convert line breaks to paragraphs
      return content
        .split('\n\n')
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');
    };

    const openDetailView = (post) => {
      selectedPost.value = post;
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    };

    const closeDetailView = () => {
      selectedPost.value = null;
      // Restore body scroll
      document.body.style.overflow = 'auto';
    };

    onMounted(() => {
      fetchBlogPosts();
    });

    return {
      blogPosts,
      loading,
      selectedPost,
      fetchBlogPosts,
      formatDate,
      formatNumber,
      formatContent,
      openDetailView,
      closeDetailView
    };
  }
};
</script>

<style scoped>
.blogs-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6f42c1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-posts {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-state h2 {
  margin-bottom: 10px;
  color: #333;
}

.blog-feed {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.blog-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #6f42c1;
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #666;
  font-size: 0.9rem;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.post-excerpt {
  margin-bottom: 20px;
}

.post-excerpt p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: linear-gradient(135deg, #6f42c1, #8b5cf6);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.more-tags {
  background: #6c757d;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.9rem;
}

.category {
  background: #f8f9fa;
  color: #6f42c1;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #6f42c1;
}

.read-more {
  text-align: right;
}

.read-more-text {
  color: #6f42c1;
  font-weight: 500;
  font-size: 0.9rem;
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
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  z-index: 1001;
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

.detail-header {
  padding: 40px 40px 30px;
  border-bottom: 2px solid #eee;
}

.detail-title {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.2;
  padding-right: 60px;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.author-info strong {
  color: #333;
  font-size: 1.1rem;
}

.author-email {
  color: #666;
  font-size: 0.9rem;
  margin-left: 8px;
}

.post-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.post-info span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.9rem;
}

.category-badge {
  background: linear-gradient(135deg, #6f42c1, #8b5cf6);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  background: #f8f9fa;
  color: #6f42c1;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  border: 1px solid #6f42c1;
  font-weight: 500;
}

.detail-content {
  padding: 40px;
}

.excerpt-section, .content-section {
  margin-bottom: 40px;
}

.excerpt-section h3, .content-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
  border-bottom: 2px solid #6f42c1;
  padding-bottom: 8px;
}

.excerpt {
  font-size: 1.2rem;
  color: #555;
  font-style: italic;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #6f42c1;
}

.content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #444;
}

.content p {
  margin-bottom: 20px;
}

.detail-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-item .icon {
  font-size: 1.5rem;
}

.stat-item span {
  color: #666;
  font-weight: 500;
}

.post-dates {
  border-top: 1px solid #eee;
  padding-top: 20px;
  color: #666;
  font-size: 0.9rem;
}

.post-dates p {
  margin: 5px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .blogs-page {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .blog-card {
    padding: 20px;
  }
  
  .post-title {
    font-size: 1.4rem;
  }
  
  .post-meta {
    gap: 15px;
  }
  
  .post-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .detail-header {
    padding: 30px 20px 20px;
  }
  
  .detail-title {
    font-size: 1.6rem;
    padding-right: 50px;
  }
  
  .detail-content {
    padding: 20px;
  }
  
  .detail-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-stats {
    flex-wrap: wrap;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .post-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .post-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-stats {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
