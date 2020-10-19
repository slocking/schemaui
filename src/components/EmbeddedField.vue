<template>
  <v-expansion-panel ref="panel" @change="onPanelChange">
    <v-expansion-panel-header>
      {{ getFieldName(field.key) }}
      <template v-slot:actions v-if="hasError">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                color="error"
                v-bind="attrs"
                v-on="on"
            >
              mdi-alert-circle
            </v-icon>
          </template>
          <span>{{errorMessage}}</span>
        </v-tooltip>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-alert icon="mdi-school" prominent text type="info">
        This is a nested document field. please make sure you know how to edit this field
      </v-alert>
      <v-jsoneditor
          height="500px"
          ref="jsoneditor"
          v-if="isActive"
          v-model="data"
          :plus="false"
          :options="options"
      ></v-jsoneditor>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>
<script>
    /* eslint-disable */
    import _ from 'lodash';
    import VInput from 'vuetify/lib/components/VInput';
    import { form } from '../mixins/form';

    export default {
      props: ['value', 'field', 'active', 'index', 'errorMessage'],

      mixins: [form],
      extends: VInput,
      data () {
        return {
          valid: true,
          data: _.clone(this.value || []),
          options: {
            mode: 'code',
            mainMenuBar: false,
            onChange: this.onChange
          },
        }
      },
      computed: {
        _ () {
            return _;
        },
        isActive () {
          return this.active === this.index;
        },
      },
      methods: {
        validate () {
          return this.valid;
        },
        onChange () {
          try {
            const newValue = this.$refs.jsoneditor.editor.get();

            this.valid = true;
            this.errorBucket = [];
            this.$emit(this.$_modelEvent, newValue);
          } catch (e) {
            this.valid = false;
            this.errorBucket = ['invalid'];
          }
        },
        onPanelChange () {
          const activePanelNumber = this.index !== this.active ? this.index : -1;

          this.$emit('change', activePanelNumber);
        }
      }
    }
</script>