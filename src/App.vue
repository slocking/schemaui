<template>
  <v-app>
    <v-app-bar app clipped-left class="orange" v-if="!headless">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <span class="title ml-3 mr-5">
        Schema UI&nbsp;<span class="font-weight-light">Dashboard</span>
      </span>

      <v-spacer />
      <span>
        <v-switch
                :label="dark ? 'Dark' : 'Light'"
                @change="toggleDark"
                :input-value="dark"
                inset
                hide-details
                style="margin-right: 15px;"
        />
      </span>
      <span>
        v{{version}}
      </span>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app clipped v-if="!headless">
      <v-list shaped>
        <v-subheader>COLLECTIONS</v-subheader>
        <v-list-item-group color="primary" active-class="active">
          <v-list-item link
                       v-for="collection of collections"
                       :key="collection.name"
                       :to="'/collection/' + collection.name"
                       :class="{active: $route.params && collection.name === $route.params.collection}">
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
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
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import { http } from './mixins/http';

export default {
  name: 'App',

  mixins: [
    http
  ],

  async mounted () {
    this.collections = await this.get('collections');
    this.$router.collections = this.collections;
    this.headless = ('true' === this.$route.query.headless);
    this.updateGlobal();
  },

  computed: {
    _ () {
      return _;
    },
    ...mapGetters(['version', 'dark']),
    hasCollections () {
      return Boolean(Object.keys(this.collections).length);
    }
  },

  methods: {
    ...mapActions(['updateGlobal', 'toggleDark']),
    onError (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  },

  data: () => ({
    loaded: false,
    drawer: true,
    headless: true,
    collections: {}
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

  .theme--dark {
    nav > .v-navigation-drawer__content {
      .credit {
        a {
          color: white;
        }
      }
    }
  }
</style>
