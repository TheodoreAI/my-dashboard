<script>
import { ref } from 'vue';
import MoviesDashboard from './components/MoviesDashboard.vue';
import CitiesDashboard from './components/CitiesDashboard.vue';
import BlogPostsDashboard from './components/BlogPostsDashboard.vue';

export default {
  name: 'App',
  components: {
    MoviesDashboard,
    CitiesDashboard,
    BlogPostsDashboard
  },
  setup() {
    const currentDashboard = ref('movies');

    const switchDashboard = (dashboard) => {
      currentDashboard.value = dashboard;
    };

    return {
      currentDashboard,
      switchDashboard
    };
  }
};
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Dashboard Hub</h1>
      </div>
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
      </div>
    </nav>

    <main class="main-content">
      <MoviesDashboard v-if="currentDashboard === 'movies'" />
      <CitiesDashboard v-if="currentDashboard === 'cities'" />
      <BlogPostsDashboard v-if="currentDashboard === 'blog-posts'" />
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

.main-content {
  padding: 0;
}
</style>
