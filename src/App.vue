<template>
  <v-app>
    <v-app-bar app clipped-left color="orange">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <span class="title ml-3 mr-5">
        INAFF&nbsp;<span class="font-weight-light">Dashboard</span>
      </span>

      <v-spacer />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app clipped color="grey lighten-4">
      <v-list rounded class="grey lighten-4">
        <v-subheader>COLLECTIONS</v-subheader>
        <v-list-item-group active-class="active">
          <v-list-item link
                       v-for="collection of collections"
                       :key="collection.name"
                       :to="'/collection/' + collection.name"
                       :class="{active: $route.params && collection.name === $route.params.collection}">
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="grey--text">
                {{ collection.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
// import HelloWorld from './components/HelloWorld';
import { http } from './mixins/http';

export default {
  name: 'App',

  components: {
    // HelloWorld,
  },
  mixins: [
    http
  ],

  async mounted () {
    this.collections = await this.get('collections');
  },

  data: () => ({
    loaded: false,
    drawer: true,
    selectedCollection: 'Glossary',
    collections: []
  }),
};
</script>
