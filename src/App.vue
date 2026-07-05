<script setup>
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <router-view />
  <ToastContainer />
</template>

<style>
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
}
</style>
