<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Catálogo de Habilidades</div>
        <q-btn color="primary" icon="add" label="Nueva Habilidad" @click="openAddDialog" />
      </q-card-section>

      <q-card-section>
        <q-table :rows="skills" :columns="columns" row-key="id" :loading="loading" :filter="filter">
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="deleteSkill(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialogo Agregar/Editar -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar Habilidad' : 'Nueva Habilidad' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="editedSkill.nombre"
            label="Nombre"
            autofocus
            :rules="[(val) => !!val || 'El nombre es requerido']"
          />
          <q-select
            v-model="editedSkill.categoria"
            :options="['Tecnica', 'Blanda']"
            label="Categoría"
            emit-value
            map-options
            :rules="[(val) => !!val || 'La categoría es requerida']"
          />
          <q-select
            v-model="editedSkill.estado"
            :options="['Activo', 'Inactivo']"
            label="Estado"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="saveSkill" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const skills = ref([])
const loading = ref(false)
const filter = ref('')
const showDialog = ref(false)
const isEditing = ref(false)

const editedSkill = ref({
  id: null,
  nombre: '',
  categoria: 'Tecnica',
  estado: 'Activo',
})

const columns = [
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true,
  },
  { name: 'categoria', align: 'left', label: 'Categoría', field: 'categoria', sortable: true },
  { name: 'estado', align: 'left', label: 'Estado', field: 'estado', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

onMounted(() => {
  fetchSkills()
})

async function fetchSkills() {
  loading.value = true
  try {
    const { data } = await api.get('/api/Skills')
    skills.value = data
  } catch (error) {
    console.error('Error fetching skills:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar habilidades' })
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEditing.value = false
  editedSkill.value = { id: null, nombre: '', categoria: 'Tecnica', estado: 'Activo' }
  showDialog.value = true
}

function openEditDialog(skill) {
  isEditing.value = true
  editedSkill.value = { ...skill }
  showDialog.value = true
}

async function saveSkill() {
  if (!editedSkill.value.nombre || !editedSkill.value.categoria) {
    $q.notify({ type: 'warning', message: 'Complete los campos requeridos' })
    return
  }

  try {
    if (isEditing.value) {
      await api.put(`/api/Skills/${editedSkill.value.id}`, editedSkill.value)
      $q.notify({ type: 'positive', message: 'Habilidad actualizada' })
    } else {
      const newSkill = { ...editedSkill.value }
      delete newSkill.id
      await api.post('/api/Skills', newSkill)
      $q.notify({ type: 'positive', message: 'Habilidad creada' })
    }
    showDialog.value = false
    fetchSkills()
  } catch (error) {
    console.error('Error saving skill:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar habilidad' })
  }
}

async function deleteSkill(skill) {
  if (!confirm(`¿Estás seguro de eliminar "${skill.nombre}"?`)) return

  try {
    await api.delete(`/api/Skills/${skill.id}`)
    $q.notify({ type: 'positive', message: 'Habilidad eliminada' })
    fetchSkills()
  } catch (error) {
    console.error('Error deleting skill:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar habilidad' })
  }
}
</script>
