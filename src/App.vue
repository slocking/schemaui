<template>
  <v-app>
    <v-app-bar app clipped-left color="orange" v-if="!headless">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <span class="title ml-3 mr-5">
        Schema UI&nbsp;<span class="font-weight-light">Dashboard</span>
      </span>

      <v-spacer />
      <span>
        v{{config.version}}
      </span>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app clipped color="grey lighten-4" v-if="!headless">
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
                {{ _.startCase(collection.name) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-spacer />
      <div class="credit">
        <a href="https://github.com/molaga">
          Made with ♡ by <v-icon>mdi-github-circle</v-icon> molaga
        </a>
      </div>
    </v-navigation-drawer>

    <v-content>
      <template v-if="hasCollections">
        <router-view />
      </template>
    </v-content>
  </v-app>
</template>

<script>
import { http } from './mixins/http';
import _ from 'lodash';

export default {
  name: 'App',

  mixins: [
    http
  ],

  async mounted () {
    this.collections = await this.get('collections');
    this.$router.collections = this.collections;
    this.headless = ('true' === this.$route.query.headless);
    this.config = await this.get('config');
  },

  computed: {
    _ () {
      return _;
    },
    hasCollections () {
      return Boolean(Object.keys(this.collections).length);
    }
  },

  data: () => ({
    loaded: false,
    drawer: true,
    headless: true,
    selectedCollection: 'Glossary',
    collections: {},
    config: {}
  }),
};
</script>

<style lang="scss">
  nav > .v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .credit {
      opacity: .3;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;

      a {
        text-decoration: none;
        color: #4d4d4d;
      }

      .v-icon {
        margin: 0 3px;
      }
    }
  }
</style>
