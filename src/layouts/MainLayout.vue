<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navegación </q-item-label>
        <q-item to="/" exact clickable v-ripple class="disabled" @click.prevent>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Inicio de Sesión</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/colaboradores" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Colaboradores</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/perfil" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mi Perfil</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="authStore.user?.rol === 'AdminRRHH'"
          to="/admin/skills"
          exact
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Catálogo de Habilidades</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="authStore.user?.rol === 'AdminRRHH'"
          to="/admin/dashboard"
          exact
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard Analítico</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'

const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
