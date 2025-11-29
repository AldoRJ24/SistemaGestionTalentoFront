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
          <q-card-section class="flex flex-center">
            <div style="width: 300px; height: 300px">
              <Doughnut v-if="loaded" :data="collaboratorSkillsData" :options="doughnutOptions" />
            </div>
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

      <!-- Supply vs Demand Trend -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Oferta vs Demanda (Últimos 6 Meses)</div>
          </q-card-section>
          <q-card-section>
            <Line v-if="loaded" :data="supplyDemandData" :options="chartOptions" />
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
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
)

const loaded = ref(false)
const stats = ref({
  totalVacantes: 0,
  totalColaboradores: 0,
  topRequestedSkills: [],
  topCollaboratorSkills: [],
  vacanciesByStatus: [],
  supplyDemandTrend: [],
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

// Helper to generate random colors
const generateColors = (count) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`)
  }
  return colors
}

const collaboratorSkillsData = computed(() => ({
  labels: stats.value.topCollaboratorSkills.map((s) => s.name),
  datasets: [
    {
      label: 'Colaboradores',
      backgroundColor: generateColors(stats.value.topCollaboratorSkills.length),
      data: stats.value.topCollaboratorSkills.map((s) => s.count),
      hoverOffset: 4,
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

const supplyDemandData = computed(() => ({
  labels: stats.value.supplyDemandTrend.map((t) => t.period),
  datasets: [
    {
      label: 'Demanda (Vacantes)',
      backgroundColor: '#1976D2',
      borderColor: '#1976D2',
      data: stats.value.supplyDemandTrend.map((t) => t.vacancies),
      tension: 0.4, // Smooth curve
    },
    {
      label: 'Oferta (Colaboradores)',
      backgroundColor: '#26A69A',
      borderColor: '#26A69A',
      data: stats.value.supplyDemandTrend.map((t) => t.collaborators),
      tension: 0.4,
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
