<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Ir al Inicio"
        no-caps
      />
      <q-btn
        class="q-mt-xl q-ml-sm"
        color="white"
        text-color="blue"
        unelevated
        to="/login"
        label="Ir al Login"
        no-caps
      />
      <q-btn
        class="q-mt-xl q-ml-sm"
        color="white"
        text-color="blue"
        outline
        @click="$router.go(-1)"
        label="Regresar"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
//
</script>
