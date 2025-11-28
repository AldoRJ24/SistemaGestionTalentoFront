<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Columna Izquierda: Info Personal -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-center">
            <q-avatar size="100px" class="q-mb-md">
              <img :src="user.fotoPerfil || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
            </q-avatar>

            <div class="q-gutter-sm q-mb-md">
              <q-input v-model="user.fotoPerfil" label="URL Foto de Perfil" dense outlined />
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input v-model="user.nombre" label="Nombre" dense outlined />
                </div>
                <div class="col-6">
                  <q-input v-model="user.apellido" label="Apellido" dense outlined />
                </div>
              </div>
              <q-input v-model="user.puestoActual" label="Puesto Actual" dense outlined />
            </div>

            <div v-if="!isLeader">
              <q-chip :color="user.openToWork ? 'green' : 'grey'" text-color="white" icon="work">
                {{ user.openToWork ? 'Open to Work' : 'No disponible' }}
              </q-chip>
              <q-toggle
                v-model="user.openToWork"
                label="Disponible para ofertas"
                @update:model-value="updateOpenToWork"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Sobre mí</div>
            <q-input
              v-model="user.descripcionPerfil"
              type="textarea"
              outlined
              autogrow
              placeholder="Describe tu experiencia y objetivos..."
            />
            <q-btn
              label="Guardar Descripción"
              color="primary"
              flat
              class="full-width q-mt-sm"
              @click="updateProfileDescription"
            />
          </q-card-section>
        </q-card>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Certificaciones</div>
            <q-list separator>
              <q-item v-for="cert in user.certificaciones" :key="cert.id">
                <q-item-section>
                  <q-item-label>{{ cert.nombre }}</q-item-label>
                  <q-item-label caption
                    >{{ cert.entidad }} - {{ formatDate(cert.fechaObtencion) }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <div class="row">
                    <q-btn
                      v-if="cert.url"
                      flat
                      round
                      icon="link"
                      type="a"
                      :href="cert.url"
                      target="_blank"
                    />
                    <q-btn flat round icon="edit" size="sm" @click="openEditCert(cert)" />
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="deleteCert(cert)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <q-btn
              flat
              color="primary"
              label="Agregar Certificación"
              class="full-width q-mt-sm"
              @click="openAddCert"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna Derecha: Skills -->
      <div class="col-12 col-md-8" v-if="!isLeader">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6">Mis Habilidades</div>
              <q-btn color="primary" icon="add" label="Agregar Skill" @click="openAddSkill" />
            </div>
          </q-card-section>

          <q-tabs
            v-model="skillTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="tecnicas" label="Técnicas" />
            <q-tab name="blandas" label="Blandas" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="skillTab" animated>
            <q-tab-panel name="tecnicas">
              <q-list bordered separator>
                <q-item v-for="skill in technicalSkills" :key="skill.id">
                  <q-item-section>
                    <q-item-label>{{ skill.skill.nombre }}</q-item-label>
                    <q-item-label caption>Nivel: {{ skill.nivelSkill.nombre }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center">
                      <q-badge
                        :color="getStatusColor(skill.estado)"
                        :label="skill.estado || 'Pendiente'"
                        class="q-mr-sm"
                      />
                      <q-btn flat round icon="edit" size="sm" @click="openEditSkill(skill)" />
                    </div>
                  </q-item-section>
                </q-item>
                <div v-if="technicalSkills.length === 0" class="text-center q-pa-md text-grey">
                  No has registrado habilidades técnicas.
                </div>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="blandas">
              <q-list bordered separator>
                <q-item v-for="skill in softSkills" :key="skill.id">
                  <q-item-section>
                    <q-item-label>{{ skill.skill.nombre }}</q-item-label>
                    <q-item-label caption>Nivel: {{ skill.nivelSkill.nombre }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center">
                      <q-badge
                        :color="getStatusColor(skill.estado)"
                        :label="skill.estado || 'Pendiente'"
                        class="q-mr-sm"
                      />
                      <q-btn flat round icon="edit" size="sm" @click="openEditSkill(skill)" />
                    </div>
                  </q-item-section>
                </q-item>
                <div v-if="softSkills.length === 0" class="text-center q-pa-md text-grey">
                  No has registrado habilidades blandas.
                </div>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Dialogo Agregar/Editar Skill -->
    <q-dialog v-model="showSkillDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEditingSkill ? 'Editar Nivel' : 'Agregar Habilidad' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newSkill.skillId"
            :options="availableSkills"
            label="Habilidad"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            use-input
            @filter="filterSkills"
            :disable="isEditingSkill"
          />
          <q-select
            v-model="newSkill.nivelId"
            :options="skillLevels"
            label="Nivel"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="saveSkill" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Agregar/Editar Certificación -->
    <q-dialog v-model="showCertDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditingCert ? 'Editar Certificación' : 'Agregar Certificación' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newCert.nombre" label="Nombre" autofocus />
          <q-input v-model="newCert.entidad" label="Entidad Emisora" class="q-mt-sm" />
          <q-input v-model="newCert.url" label="URL de Credencial" class="q-mt-sm" />
          <q-input v-model="newCert.fechaObtencion" label="Fecha" type="date" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="saveCert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const user = ref({
  colaboradorSkills: [],
  certificaciones: [],
  descripcionPerfil: '',
})

const skillTab = ref('tecnicas')
const showSkillDialog = ref(false)
const showCertDialog = ref(false)
const isEditingCert = ref(false)
const isEditingSkill = ref(false)
const editingCertId = ref(null)

const allSkills = ref([]) // Todas las skills disponibles en DB
const availableSkills = ref([]) // Skills filtradas para el select
const skillLevels = ref([]) // Niveles de skill (Básico, Intermedio...)

const newSkill = ref({ skillId: null, nivelId: null })
const newCert = ref({ nombre: '', entidad: '', url: '', fechaObtencion: '' })

// Computed
const isLeader = computed(() => authStore.user?.rol === 'Lider')

const technicalSkills = computed(
  () => user.value.colaboradorSkills?.filter((s) => s.skill.categoria === 'Tecnica') || [],
)
const softSkills = computed(
  () => user.value.colaboradorSkills?.filter((s) => s.skill.categoria === 'Blanda') || [],
)

onMounted(async () => {
  await fetchUserData()
  await fetchCatalogs()
})

async function fetchUserData() {
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const { data } = await api.get(`/api/Usuarios/${userId}`)
    user.value = data
  } catch (error) {
    console.error('Error fetching user:', error)
  }
}

async function fetchCatalogs() {
  try {
    // MOCK TEMPORAL PARA UI (Hasta que confirmemos endpoints de catálogos)
    skillLevels.value = [
      { id: 1, nombre: 'Básico' },
      { id: 2, nombre: 'Intermedio' },
      { id: 3, nombre: 'Avanzado' },
      { id: 4, nombre: 'Experto' },
    ]

    // Intentar cargar skills reales
    try {
      const { data } = await api.get('/api/Skills')
      allSkills.value = data
    } catch (e) {
      console.error('Error fetching skills:', e)
      // Fallback mock
      allSkills.value = [
        { id: 1, nombre: 'Python', categoria: 'Tecnica' },
        { id: 2, nombre: 'Liderazgo', categoria: 'Blanda' },
      ]
    }
  } catch (error) {
    console.error(error)
  }
}

function filterSkills(val, update) {
  const category = skillTab.value === 'tecnicas' ? 'Tecnica' : 'Blanda'
  const skillsByCategory = allSkills.value.filter((s) => s.categoria === category)

  if (val === '') {
    update(() => {
      availableSkills.value = skillsByCategory
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    availableSkills.value = skillsByCategory.filter(
      (v) => v.nombre.toLowerCase().indexOf(needle) > -1,
    )
  })
}

async function updateOpenToWork(val) {
  try {
    await api.put(`/api/Usuarios/${user.value.id}/opentowork`, { openToWork: val })
    $q.notify({ type: 'positive', message: 'Disponibilidad actualizada' })
  } catch (error) {
    console.error('Error updating OpenToWork:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar disponibilidad' })
    user.value.openToWork = !val // Revertir
  }
}

async function updateProfileDescription() {
  try {
    await api.put(`/api/Usuarios/${user.value.id}/profile`, {
      nombre: user.value.nombre,
      apellido: user.value.apellido,
      puestoActual: user.value.puestoActual,
      descripcionPerfil: user.value.descripcionPerfil,
      fotoPerfil: user.value.fotoPerfil,
    })
    $q.notify({ type: 'positive', message: 'Perfil actualizado' })
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar perfil' })
  }
}

function openAddSkill() {
  isEditingSkill.value = false
  newSkill.value = { skillId: null, nivelId: null }
  showSkillDialog.value = true
}

function openEditSkill(skill) {
  isEditingSkill.value = true
  newSkill.value = { skillId: skill.skillId, nivelId: skill.nivelId }
  showSkillDialog.value = true
}

async function saveSkill() {
  try {
    await api.post(`/api/Usuarios/${user.value.id}/skills`, {
      skillId: newSkill.value.skillId,
      nivelId: newSkill.value.nivelId,
    })
    $q.notify({
      type: 'positive',
      message: isEditingSkill.value ? 'Habilidad actualizada' : 'Habilidad agregada',
    })
    showSkillDialog.value = false
    await fetchUserData() // Recargar
  } catch (error) {
    console.error('Error saving skill:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar habilidad' })
  }
}

function openAddCert() {
  isEditingCert.value = false
  newCert.value = { nombre: '', entidad: '', url: '', fechaObtencion: '' }
  showCertDialog.value = true
}

function openEditCert(cert) {
  isEditingCert.value = true
  editingCertId.value = cert.id
  // Copiar valores, formatear fecha para input date (yyyy-MM-dd)
  const date = cert.fechaObtencion ? new Date(cert.fechaObtencion).toISOString().split('T')[0] : ''
  newCert.value = {
    nombre: cert.nombre,
    entidad: cert.entidad,
    url: cert.url,
    fechaObtencion: date,
  }
  showCertDialog.value = true
}

async function saveCert() {
  try {
    if (isEditingCert.value) {
      await api.put(
        `/api/Usuarios/${user.value.id}/certificaciones/${editingCertId.value}`,
        newCert.value,
      )
      $q.notify({ type: 'positive', message: 'Certificación actualizada' })
    } else {
      await api.post(`/api/Usuarios/${user.value.id}/certificaciones`, newCert.value)
      $q.notify({ type: 'positive', message: 'Certificación agregada' })
    }

    showCertDialog.value = false
    newCert.value = { nombre: '', entidad: '', url: '', fechaObtencion: '' }
    await fetchUserData()
  } catch (error) {
    console.error('Error saving certification:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar certificación' })
  }
}

async function deleteCert(cert) {
  if (!confirm('¿Estás seguro de eliminar esta certificación?')) return
  try {
    await api.delete(`/api/Usuarios/${user.value.id}/certificaciones/${cert.id}`)
    $q.notify({ type: 'positive', message: 'Certificación eliminada' })
    await fetchUserData()
  } catch (error) {
    console.error('Error deleting certification:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar certificación' })
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

function getStatusColor(status) {
  if (status === 'Validado') return 'green'
  return 'grey'
}
</script>
