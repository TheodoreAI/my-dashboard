<template>
  <div class="cities-container">
    <header class="header">
      <h1>Cities Dashboard</h1>
      <button @click="showForm = !showForm; if (!showForm) cancelEdit()" class="add-button">
        {{ showForm ? 'Hide Form' : 'Add New City' }}
      </button>
    </header>

    <!-- Add/Edit City Form -->
    <div v-if="showForm" class="form-container">
      <h2>{{ isEditing ? 'Edit City' : 'Add a City' }}</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">City Name:</label>
          <input id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="country">Country:</label>
          <input id="country" v-model="form.country" required />
        </div>
        <div>
          <label for="population">Population:</label>
          <input id="population" v-model="form.population" type="number" min="0" required />
        </div>
        <div>
          <label for="founded">Founded Year:</label>
          <input id="founded" v-model="form.founded" type="number" min="0" max="2024" required />
        </div>
        <div>
          <label for="crime_rate">Crime Rate (%):</label>
          <input id="crime_rate" v-model="form.crime_rate" type="number" min="0" max="100" step="0.1" required />
        </div>
        <div class="form-buttons">
          <button type="submit">{{ isEditing ? 'Update City' : 'Add City' }}</button>
          <button v-if="isEditing" type="button" @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
      </form>
      <div v-if="response" class="response">
        {{ response }}
      </div>
    </div>

    <!-- Cities Dashboard -->
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Cities List</h2>
        <button @click="fetchCities" class="refresh-button">Refresh</button>
      </div>
      
      <div v-if="loading" class="loading">Loading cities...</div>
      
      <div v-else-if="cities.length === 0" class="no-cities">
        No cities found. Add some cities to get started!
      </div>
      
      <div v-else class="cities-grid">
        <div v-for="city in cities" :key="city.id" class="city-card">
          <h3>{{ city.name }}</h3>
          <p><strong>Country:</strong> {{ city.country }}</p>
          <p><strong>Population:</strong> {{ formatNumber(city.population) }}</p>
          <p><strong>Founded:</strong> {{ city.founded }}</p>
          <p><strong>Crime Rate:</strong> {{ city.crime_rate }}%</p>
          <div class="city-actions">
            <button @click="startEdit(city)" class="edit-button">Edit</button>
            <button @click="deleteCity(city.id)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'CitiesDashboard',
  setup() {
    const form = ref({
      name: '',
      country: '',
      population: '',
      founded: '',
      crime_rate: ''
    });
    const response = ref(null);
    const cities = ref([]);
    const loading = ref(false);
    const showForm = ref(false);
    const editingCity = ref(null);
    const isEditing = ref(false);
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/cities`;

    const fetchCities = async () => {
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
          cities.value = data;
        } else {
          console.error('Failed to fetch cities');
        }
      } catch (err) {
        console.error('Error fetching cities:', err.message);
      } finally {
        loading.value = false;
      }
    };

    const deleteCity = async (cityId) => {
      if (!confirm('Are you sure you want to delete this city?')) {
        return;
      }
      
      try {
        const res = await fetch(`${apiEndpoint}/${cityId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          // Remove city from local array
          cities.value = cities.value.filter(city => city.id !== cityId);
        } else {
          alert('Failed to delete city');
        }
      } catch (err) {
        alert('Error deleting city: ' + err.message);
      }
    };

    const submitForm = async () => {
      try {
        let res;
        if (isEditing.value && editingCity.value) {
          // Update existing city
          res = await fetch(`${apiEndpoint}/${editingCity.value.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'City updated successfully!';
            // Update city in local array
            const index = cities.value.findIndex(c => c.id === editingCity.value.id);
            if (index !== -1) {
              cities.value[index] = { ...editingCity.value, ...form.value };
            }
            // Reset editing state
            isEditing.value = false;
            editingCity.value = null;
          } else {
            response.value = 'Error: Failed to update city';
          }
        } else {
          // Add new city
          res = await fetch(`${apiEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
          });
          if (res.ok) {
            response.value = 'City added successfully!';
            // Refresh cities list to get the new city with ID
            fetchCities();
          } else {
            response.value = 'Error: Failed to add city';
          }
        }
        
        // Reset form and hide it
        form.value = {
          name: '',
          country: '',
          population: '',
          founded: '',
          crime_rate: ''
        };
        showForm.value = false;
      } catch (err) {
        response.value = 'Error: ' + err.message;
      }
    };

    const startEdit = (city) => {
      editingCity.value = city;
      isEditing.value = true;
      form.value = {
        name: city.name,
        country: city.country,
        population: city.population,
        founded: city.founded,
        crime_rate: city.crime_rate
      };
      showForm.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editingCity.value = null;
      showForm.value = false;
      form.value = {
        name: '',
        country: '',
        population: '',
        founded: '',
        crime_rate: ''
      };
    };

    const formatNumber = (num) => {
      return new Intl.NumberFormat().format(num);
    };

    // Fetch cities when component mounts
    onMounted(() => {
      fetchCities();
    });

    return { 
      form, 
      submitForm, 
      response, 
      cities, 
      loading, 
      showForm, 
      fetchCities, 
      deleteCity,
      startEdit,
      cancelEdit,
      isEditing,
      editingCity,
      formatNumber
    };
  }
};
</script>

<style scoped>
.cities-container {
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
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover, .refresh-button:hover {
  background: #138496;
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
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

button[type="submit"]:hover {
  background: #138496;
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
  background: #d1ecf1;
  color: #0c5460;
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

.loading, .no-cities {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.city-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.city-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.city-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.city-card p {
  margin: 8px 0;
  color: #666;
}

.city-actions {
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
