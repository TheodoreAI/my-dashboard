<template>
  <div class="movies-container">
    <header class="header">
      <h1>Movies Dashboard</h1>
      <button @click="showForm = !showForm; if (!showForm) cancelEdit()" class="add-button">
        {{ showForm ? 'Hide Form' : 'Add New Movie' }}
      </button>
    </header>

    <!-- Add/Edit Movie Form -->
    <div v-if="showForm" class="form-container">
      <h2>{{ isEditing ? 'Edit Movie' : 'Add a Movie' }}</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label for="title">Title:</label>
          <input id="title" v-model="form.title" required />
        </div>
        <div>
          <label for="year">Year:</label>
          <input id="year" v-model="form.year" type="number" required />
        </div>
        <div>
          <label for="genre">Genre:</label>
          <input id="genre" v-model="form.genre" required />
        </div>
        <div>
          <label for="director">Director:</label>
          <input id="director" v-model="form.director" required />
        </div>
        <div>
          <label for="rating">Rating:</label>
          <input id="rating" v-model="form.rating" type="number" min="0" max="10" step="0.1" required />
        </div>
        <div class="form-buttons">
          <button type="submit">{{ isEditing ? 'Update Movie' : 'Add Movie' }}</button>
          <button v-if="isEditing" type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
      </form>
      <div v-if="response" class="response">
        {{ response }}
      </div>
    </div>

    <!-- Movies Dashboard -->
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Movies List</h2>
        <button @click="fetchMovies" class="refresh-button">Refresh</button>
      </div>
      
      <div v-if="loading" class="loading">Loading movies...</div>
      
      <div v-else-if="movies.length === 0" class="no-movies">
        No movies found. Add some movies to get started!
      </div>
      
      <div v-else class="movies-grid">
        <div v-for="movie in movies" :key="movie.id" class="movie-card">
          <h3>{{ movie.title }}</h3>
          <p><strong>Year:</strong> {{ movie.year }}</p>
          <p><strong>Genre:</strong> {{ movie.genre }}</p>
          <p><strong>Director:</strong> {{ movie.director }}</p>
          <p><strong>Rating:</strong> {{ movie.rating }}/10</p>
          <div class="movie-actions">
            <button @click="startEdit(movie)" class="edit-button">Edit</button>
            <button @click="deleteMovie(movie.id)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MoviesDashboard',
  setup() {
    const form = ref({
      title: '',
      year: '',
      genre: '',
      director: '',
      rating: ''
    });
    const response = ref(null);
    const movies = ref([]);
    const loading = ref(false);
    const showForm = ref(false);
    const editingMovie = ref(null);
    const isEditing = ref(false);
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/movies`;

    const fetchMovies = async () => {
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
          movies.value = data;
        } else {
          console.error('Failed to fetch movies');
        }
      } catch (err) {
        console.error('Error fetching movies:', err.message);
      } finally {
        loading.value = false;
      }
    };

    const deleteMovie = async (movieId) => {
      if (!confirm('Are you sure you want to delete this movie?')) {
        return;
      }
      
      try {
        const res = await fetch(`${apiEndpoint}/${movieId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          // Remove movie from local array
          movies.value = movies.value.filter(movie => movie.id !== movieId);
        } else {
          alert('Failed to delete movie');
        }
      } catch (err) {
        alert('Error deleting movie: ' + err.message);
      }
    };

    const submitForm = async () => {
      try {
        let res;
        if (isEditing.value && editingMovie.value) {
          // Update existing movie
          res = await fetch(`${apiEndpoint}/${editingMovie.value.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'Movie updated successfully!';
            // Update movie in local array
            const index = movies.value.findIndex(m => m.id === editingMovie.value.id);
            if (index !== -1) {
              movies.value[index] = { ...editingMovie.value, ...form.value };
            }
            // Reset editing state
            isEditing.value = false;
            editingMovie.value = null;
          } else {
            response.value = 'Error: Failed to update movie';
          }
        } else {
          // Add new movie
          res = await fetch(`${apiEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'Movie added successfully!';
            // Refresh movie list to get the new movie with ID
            fetchMovies();
          } else {
            response.value = 'Error: Failed to add movie';
          }
        }
        
        // Reset form and hide it
        form.value = {
          title: '',
          year: '',
          genre: '',
          director: '',
          rating: ''
        };
        showForm.value = false;
      } catch (err) {
        response.value = 'Error: ' + err.message;
      }
    };

    const startEdit = (movie) => {
      editingMovie.value = movie;
      isEditing.value = true;
      form.value = {
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        director: movie.director,
        rating: movie.rating
      };
      showForm.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editingMovie.value = null;
      showForm.value = false;
      form.value = {
        title: '',
        year: '',
        genre: '',
        director: '',
        rating: ''
      };
    };

    // Fetch movies when component mounts
    onMounted(() => {
      fetchMovies();
    });

    return { 
      form, 
      submitForm, 
      response, 
      movies, 
      loading, 
      showForm, 
      fetchMovies, 
      deleteMovie,
      startEdit,
      cancelEdit,
      isEditing,
      editingMovie
    };
  }
};
</script>

<style scoped>
.movies-container {
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
  background: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover, .refresh-button:hover {
  background: #369870;
}

.form-container {
  max-width: 500px;
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

form > div {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button[type="submit"] {
  flex: 1;
  padding: 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

button[type="submit"]:hover {
  background: #369870;
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
  background: #e6ffe6;
  color: #006600;
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

.loading, .no-movies {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.movie-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.movie-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.movie-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.movie-card p {
  margin: 8px 0;
  color: #666;
}

.movie-actions {
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
</style>
