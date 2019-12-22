<template>
  <v-container fluid>
    <v-combobox
        v-model="select"
        :items="items"
        label="Select a favorite activity or create a new one"
        multiple
        chips
    />
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      items: [],
      select: [],
    }),
  }
</script>