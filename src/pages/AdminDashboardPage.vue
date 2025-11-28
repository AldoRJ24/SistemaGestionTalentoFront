<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Dashboard de Analíticas RRHH</div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Total Vacantes</div>
            <div class="text-h2 text-weight-bold">{{ stats.totalVacantes }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Total Colaboradores</div>
            <div class="text-h2 text-weight-bold">{{ stats.totalColaboradores }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-col-gutter-md">
      <!-- Top Requested Skills -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Skills Más Solicitados (Vacantes)</div>
          </q-card-section>
          <q-card-section>
            <Bar v-if="loaded" :data="requestedSkillsData" :options="chartOptions" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Top Collaborator Skills -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Skills Más Comunes (Colaboradores)</div>
          </q-card-section>
          <q-card-section>
            <Bar v-if="loaded" :data="collaboratorSkillsData" :options="chartOptions" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Vacancy Status -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Estado de Vacantes</div>
          </q-card-section>
          <q-card-section class="flex flex-center">
            <div style="width: 300px; height: 300px">
              <Doughnut v-if="loaded" :data="vacancyStatusData" :options="doughnutOptions" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const loaded = ref(false)
const stats = ref({
  totalVacantes: 0,
  totalColaboradores: 0,
  topRequestedSkills: [],
  topCollaboratorSkills: [],
  vacanciesByStatus: [],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const requestedSkillsData = computed(() => ({
  labels: stats.value.topRequestedSkills.map((s) => s.name),
  datasets: [
    {
      label: 'Solicitudes',
      backgroundColor: '#1976D2',
      data: stats.value.topRequestedSkills.map((s) => s.count),
    },
  ],
}))

const collaboratorSkillsData = computed(() => ({
  labels: stats.value.topCollaboratorSkills.map((s) => s.name),
  datasets: [
    {
      label: 'Colaboradores',
      backgroundColor: '#26A69A',
      data: stats.value.topCollaboratorSkills.map((s) => s.count),
    },
  ],
}))

const vacancyStatusData = computed(() => ({
  labels: stats.value.vacanciesByStatus.map((s) => s.name),
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
      data: stats.value.vacanciesByStatus.map((s) => s.count),
    },
  ],
}))

onMounted(async () => {
  try {
    const { data } = await api.get('/api/Admin/dashboard-stats')
    stats.value = data
    loaded.value = true
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
})
</script>
