<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Panel de Líder</div>

    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="team" label="Mi Equipo" />
      <q-tab name="vacancies" label="Mis Vacantes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- Panel de Equipo -->
      <q-tab-panel name="team">
        <div class="text-h6 q-mb-md">Gestión de Equipo</div>
        <q-table :rows="team" :columns="teamColumns" row-key="id" :loading="loadingTeam">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat color="primary" label="Ver Skills" @click="viewSkills(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Panel de Vacantes -->
      <q-tab-panel name="vacancies">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Mis Vacantes</div>
          <q-btn
            color="primary"
            label="Crear Vacante"
            icon="add"
            @click="openCreateVacancyDialog"
          />
        </div>
        <q-table
          :rows="vacancies"
          :columns="vacancyColumns"
          row-key="id"
          :loading="loadingVacancies"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="editVacancy(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="deleteVacancy(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                color="secondary"
                label="Ver Candidatos"
                @click="viewMatches(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Dialogo Crear/Editar Vacante -->
    <q-dialog v-model="showCreateVacancyDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar Vacante' : 'Nueva Vacante' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveVacancy" class="q-gutter-md">
            <q-input v-model="newVacancy.titulo" label="Título del Puesto" filled required />
            <q-input v-model="newVacancy.proyecto" label="Proyecto" filled />
            <q-select
              v-model="newVacancy.urgenciaId"
              :options="urgencies"
              option-label="nombre"
              option-value="id"
              label="Urgencia"
              filled
              emit-value
              map-options
              required
            />
            <q-input
              v-model="newVacancy.fechaInicioRequerida"
              label="Fecha Inicio"
              filled
              type="date"
              InputLabelProps="{ shrink: true }"
            />

            <q-separator class="q-my-md" />
            <div class="text-subtitle2">Habilidades Requeridas</div>

            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="newSkill.skill"
                  :options="availableSkills"
                  option-label="nombre"
                  label="Habilidad"
                  filled
                  dense
                />
              </div>
              <div class="col-5">
                <q-select
                  v-model="newSkill.nivel"
                  :options="availableLevels"
                  option-label="nombre"
                  label="Nivel"
                  filled
                  dense
                />
              </div>
              <div class="col-2 flex flex-center">
                <q-btn
                  icon="add"
                  round
                  color="primary"
                  size="sm"
                  @click="addSkillToVacancy"
                  :disable="!newSkill.skill || !newSkill.nivel"
                />
              </div>
            </div>

            <q-list dense separator class="q-mt-sm">
              <q-item v-for="(skill, index) in newVacancy.skills" :key="index">
                <q-item-section>
                  <q-item-label>{{ skill.skillNombre }}</q-item-label>
                  <q-item-label caption>{{ skill.nivelNombre }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeSkillFromVacancy(index)"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div align="right">
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
              <q-btn :label="isEditing ? 'Guardar' : 'Crear'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo de Skills del Colaborador -->
    <q-dialog v-model="showSkillsDialog" full-width>
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Habilidades de {{ selectedCollab?.nombre }} {{ selectedCollab?.apellido }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-table :rows="collabSkills" :columns="skillColumns" row-key="id">
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="getStatusColor(props.row.estado)" text-color="white">
                  {{ props.row.estado }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div v-if="props.row.estado === 'Pendiente'">
                  <q-btn
                    flat
                    round
                    color="positive"
                    icon="check"
                    @click="validateSkill(props.row, 'Validado')"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="close"
                    @click="validateSkill(props.row, 'Rechazado')"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo de Matches (Candidatos) -->
    <q-dialog v-model="showMatchesDialog" full-width>
      <q-card>
        <q-card-section>
          <div class="text-h6">Candidatos para: {{ selectedVacancy?.titulo }}</div>
        </q-card-section>
        <q-card-section>
          <div v-if="vacancyMatches.length === 0" class="text-center q-pa-md text-grey">
            No se encontraron candidatos compatibles.
          </div>
          <q-list separator v-else>
            <q-item v-for="match in vacancyMatches" :key="match.usuarioId">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ match.nombreUsuario ? match.nombreUsuario.charAt(0) : '?' }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ match.nombreUsuario }}</q-item-label>
                <q-item-label caption>{{ match.email }}</q-item-label>
                <div class="q-mt-sm">
                  <div class="text-caption text-grey-7">Habilidades:</div>
                  <div class="q-gutter-xs">
                    <q-chip
                      v-for="skill in match.skillsCoincidentes"
                      :key="'c-' + skill"
                      color="green-5"
                      text-color="white"
                      size="sm"
                      icon="check"
                    >
                      {{ skill }}
                    </q-chip>
                    <q-chip
                      v-for="skill in match.skillsFaltantes"
                      :key="'f-' + skill"
                      color="red-5"
                      text-color="white"
                      size="sm"
                      icon="close"
                    >
                      {{ skill }}
                    </q-chip>
                    <span
                      v-if="
                        match.skillsCoincidentes.length === 0 && match.skillsFaltantes.length === 0
                      "
                      class="text-caption text-italic text-grey"
                    >
                      No se especificaron habilidades requeridas.
                    </span>
                  </div>
                </div>
              </q-item-section>
              <q-item-section side top style="width: 150px">
                <div class="text-caption text-center">{{ match.porcentaje }}% Coincidencia</div>
                <q-linear-progress
                  :value="match.porcentaje / 100"
                  color="green"
                  size="10px"
                  rounded
                  class="q-mb-sm"
                />
                <q-btn size="sm" color="primary" label="Invitar" @click="inviteCandidate(match)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const auth = useAuthStore()
const tab = ref('team')

// Data
const team = ref([])
const vacancies = ref([])
const urgencies = ref([])
const loadingTeam = ref(false)
const loadingVacancies = ref(false)

// Dialogs
const showSkillsDialog = ref(false)
const selectedCollab = ref(null)
const collabSkills = ref([])

const showMatchesDialog = ref(false)
const selectedVacancy = ref(null)
const vacancyMatches = ref([])

const showCreateVacancyDialog = ref(false)
const newVacancy = ref({
  titulo: '',
  proyecto: '',
  urgenciaId: null,
  fechaInicioRequerida: '',
  skills: [], // List of { skillId, nivelId, skillNombre, nivelNombre }
})

const availableSkills = ref([])
const availableLevels = ref([])
const newSkill = ref({ skill: null, nivel: null })

// Columns
const teamColumns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'apellido', label: 'Apellido', field: 'apellido', align: 'left' },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
  { name: 'puestoActual', label: 'Puesto', field: 'puestoActual', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const vacancyColumns = [
  { name: 'titulo', label: 'Título', field: 'titulo', align: 'left' },
  { name: 'proyecto', label: 'Proyecto', field: 'proyecto', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const skillColumns = [
  { name: 'skillNombre', label: 'Habilidad', field: 'skillNombre', align: 'left' },
  { name: 'nivelNombre', label: 'Nivel', field: 'nivelNombre', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'actions', label: 'Validar', align: 'center' },
]

onMounted(() => {
  fetchTeam()
  fetchVacancies()
  fetchUrgencies()
  fetchSkills()
  fetchLevels()
})

async function fetchTeam() {
  loadingTeam.value = true
  try {
    const { data } = await api.get('/api/Lider/team')
    team.value = data
  } catch (error) {
    console.error('Error fetching team:', error)
  } finally {
    loadingTeam.value = false
  }
}

async function fetchVacancies() {
  loadingVacancies.value = true
  try {
    const { data } = await api.get('/api/Lider/vacancies')
    vacancies.value = data
  } catch (error) {
    console.error('Error fetching vacancies:', error)
  } finally {
    loadingVacancies.value = false
  }
}

async function fetchUrgencies() {
  try {
    const { data } = await api.get('/api/Vacantes/urgencias')
    urgencies.value = data
  } catch (error) {
    console.error('Error fetching urgencies:', error)
  }
}

async function fetchSkills() {
  try {
    const { data } = await api.get('/api/Skills')
    availableSkills.value = data
  } catch (error) {
    console.error('Error fetching skills:', error)
  }
}

async function fetchLevels() {
  try {
    const { data } = await api.get('/api/NivelesSkill')
    availableLevels.value = data
  } catch (error) {
    console.error('Error fetching levels:', error)
  }
}

function addSkillToVacancy() {
  if (newSkill.value.skill && newSkill.value.nivel) {
    newVacancy.value.skills.push({
      skillId: newSkill.value.skill.id,
      nivelId: newSkill.value.nivel.id,
      skillNombre: newSkill.value.skill.nombre,
      nivelNombre: newSkill.value.nivel.nombre,
    })
    newSkill.value = { skill: null, nivel: null }
  }
}

function removeSkillFromVacancy(index) {
  newVacancy.value.skills.splice(index, 1)
}

const isEditing = ref(false)
const editingVacancyId = ref(null)

function openCreateVacancyDialog() {
  isEditing.value = false
  editingVacancyId.value = null
  newVacancy.value = {
    titulo: '',
    proyecto: '',
    urgenciaId: null,
    fechaInicioRequerida: '',
    skills: [],
  }
  showCreateVacancyDialog.value = true
}

async function editVacancy(vacancy) {
  try {
    const { data } = await api.get(`/api/Vacantes/${vacancy.id}`)
    newVacancy.value = {
      titulo: data.titulo,
      proyecto: data.proyecto,
      urgenciaId: data.urgenciaId,
      fechaInicioRequerida: data.fechaInicioRequerida
        ? data.fechaInicioRequerida.split('T')[0]
        : '',
      skills: data.vacanteSkills.map((vs) => ({
        skillId: vs.skillId,
        nivelId: vs.nivelId,
        skillNombre: vs.skill.nombre,
        nivelNombre: vs.nivelSkill.nombre,
      })),
    }
    isEditing.value = true
    editingVacancyId.value = vacancy.id
    showCreateVacancyDialog.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos de la vacante' })
  }
}

async function deleteVacancy(vacancy) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de que deseas eliminar esta vacante?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/api/Vacantes/${vacancy.id}`)
      $q.notify({ type: 'positive', message: 'Vacante eliminada' })
      fetchVacancies()
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Error al eliminar vacante' })
    }
  })
}

async function saveVacancy() {
  try {
    const payload = {
      ...newVacancy.value,
      liderId: auth.user.id,
      skills: newVacancy.value.skills.map((s) => ({ skillId: s.skillId, nivelId: s.nivelId })),
    }

    if (isEditing.value) {
      await api.put(`/api/Vacantes/${editingVacancyId.value}`, payload)
      $q.notify({ type: 'positive', message: 'Vacante actualizada exitosamente' })
    } else {
      await api.post('/api/Vacantes', payload)
      $q.notify({ type: 'positive', message: 'Vacante creada exitosamente' })
    }

    showCreateVacancyDialog.value = false
    fetchVacancies()
    // Reset form
    newVacancy.value = {
      titulo: '',
      proyecto: '',
      urgenciaId: null,
      fechaInicioRequerida: '',
      skills: [],
    }
    isEditing.value = false
    editingVacancyId.value = null
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al guardar vacante' })
  }
}

async function viewSkills(collab) {
  selectedCollab.value = collab
  try {
    const { data } = await api.get(`/api/Lider/colaborador/${collab.id}/skills`)
    collabSkills.value = data
    showSkillsDialog.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar skills' })
  }
}

async function validateSkill(skill, newState) {
  try {
    await api.put(`/api/Lider/skill/${skill.id}/validate`, { estado: newState })
    skill.estado = newState
    $q.notify({ type: 'positive', message: `Skill ${newState}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al validar skill' })
  }
}

async function viewMatches(vacancy) {
  selectedVacancy.value = vacancy
  try {
    const { data } = await api.get(`/api/Matches/vacante/${vacancy.id}`)
    vacancyMatches.value = data.sort((a, b) => b.porcentaje - a.porcentaje)
    showMatchesDialog.value = true
  } catch (error) {
    if (error.response && error.response.status === 404) {
      vacancyMatches.value = []
      showMatchesDialog.value = true
    } else {
      $q.notify({ type: 'negative', message: 'Error al buscar candidatos' })
    }
  }
}

async function inviteCandidate(candidate) {
  try {
    await api.post('/api/Lider/invitar', {
      vacanteId: selectedVacancy.value.id,
      usuarioId: candidate.usuarioId,
    })
    $q.notify({ type: 'positive', message: 'Invitación enviada' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.response?.data || 'Error al invitar' })
  }
}

function getStatusColor(status) {
  if (status === 'Validado') return 'green'
  if (status === 'Rechazado') return 'red'
  return 'orange'
}
</script>
