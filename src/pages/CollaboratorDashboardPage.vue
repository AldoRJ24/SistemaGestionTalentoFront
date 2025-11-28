<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Panel de Colaborador</div>
    <div class="text-subtitle1">Bienvenido a tu espacio de crecimiento.</div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-8">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h6">Notificaciones e Invitaciones</div>
          </q-card-section>
          <q-card-section>
            <div v-if="notifications.length === 0" class="text-grey">
              No tienes notificaciones nuevas.
            </div>
            <q-list separator v-else>
              <q-item v-for="notif in notifications" :key="notif.id">
                <q-item-section avatar>
                  <q-icon name="mail" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ notif.mensaje }}</q-item-label>
                  <q-item-label caption>{{ new Date(notif.fecha).toLocaleString() }}</q-item-label>
                  <q-item-label caption v-if="notif.tipo === 'Invitacion'">
                    Estado: <span :class="getStatusColor(notif.estado)">{{ notif.estado }}</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section
                  side
                  v-if="notif.tipo === 'Invitacion' && notif.estado === 'Enviada'"
                >
                  <div class="row q-gutter-sm">
                    <q-btn
                      size="sm"
                      color="positive"
                      label="Aceptar"
                      @click="respondInvitation(notif, 'Aceptada')"
                    />
                    <q-btn
                      size="sm"
                      color="negative"
                      label="Rechazar"
                      @click="respondInvitation(notif, 'Rechazada')"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="my-card q-mb-md">
          <q-card-section>
            <div class="text-h6">Mi Perfil</div>
            <div class="text-caption">Gestiona tus habilidades y certificaciones</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="Ir a Perfil" to="/perfil" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const notifications = ref([])

onMounted(() => {
  fetchNotifications()
})

async function fetchNotifications() {
  try {
    const { data } = await api.get('/api/Notificaciones/mis-notificaciones')
    notifications.value = data
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

async function respondInvitation(notif, response) {
  try {
    await api.put(`/api/Notificaciones/responder-invitacion/${notif.id}`, { estado: response })
    notif.estado = response
    $q.notify({ type: 'positive', message: `Invitación ${response}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al responder' })
  }
}

function getStatusColor(status) {
  if (status === 'Aceptada') return 'text-positive'
  if (status === 'Rechazada') return 'text-negative'
  return 'text-orange'
}
</script>

<style scoped>
.text-positive {
  color: green;
}
.text-negative {
  color: red;
}
.text-orange {
  color: orange;
}
</style>
