<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Crear Cuenta</div>
      <div class="text-subtitle2 text-grey-7">Regístrate para acceder al sistema</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input v-model="nombre" label="Nombre" dense :rules="[rules.required]" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="apellido" label="Apellido" dense :rules="[rules.required]" />
          </div>
        </div>

        <q-input
          v-model="email"
          label="Correo Electrónico"
          type="email"
          dense
          :rules="[rules.required, rules.email]"
        />

        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Contraseña"
          dense
          :rules="[rules.required, rules.min6]"
        >
          <template #append>
            <q-icon
              :name="isPwd ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-select
          v-model="rol"
          :options="roles"
          label="Rol"
          dense
          emit-value
          map-options
          :rules="[rules.required]"
        />

        <div class="row items-center q-gutter-sm q-mt-lg">
          <q-btn flat label="Cancelar" color="grey" to="/login" />
          <q-space />
          <q-btn color="primary" label="Registrarse" type="submit" :loading="loading" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiError } from 'src/composables/useApiError'
import { api } from 'src/boot/axios'

const router = useRouter()
const { notifyError, notifySuccess } = useApiError()

const formRef = ref(null)
const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const rol = ref('Colaborador') // Valor por defecto
const isPwd = ref(true)
const loading = ref(false)

const roles = [
  { label: 'Colaborador', value: 'Colaborador' },
  { label: 'Líder', value: 'Lider' },
]

const rules = {
  required: (v) => !!v || 'Requerido',
  email: (v) => /\S+@\S+\.\S+/.test(v) || 'Email inválido',
  min6: (v) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
}

async function onSubmit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  loading.value = true
  try {
    // Mapear el rol seleccionado a un ID (1=Lider, 2=Colaborador)
    // NOTA: Esto asume que el Seeder creó los roles en ese orden.
    const rolId = rol.value === 'Lider' ? 1 : 2

    // Payload debe coincidir con RegisterDto.cs
    const payload = {
      Nombre: nombre.value,
      Apellido: apellido.value,
      Email: email.value,
      Password: password.value,
      RolId: rolId,
      Puesto: 'Nuevo Ingreso',
    }

    console.log('Enviando registro:', payload)
    console.log('URL Base:', api.defaults.baseURL)

    await api.post('/api/Auth/register', payload)

    notifySuccess('Cuenta creada exitosamente. Por favor inicia sesión.')
    router.push('/')
  } catch (err) {
    console.error('Error en registro:', err)
    alert('Error al registrar: ' + (err.response?.data || err.message))
    notifyError(err, 'Error al registrar usuario')
  } finally {
    loading.value = false
  }
}
</script>
