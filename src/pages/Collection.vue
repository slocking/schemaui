<template>
    <v-container cols="12">
        <v-row align="center" justify="center">
            <v-col xs="12" sm="10" v-if="model">
                <v-card>
                    <v-card-title>
                        {{ $route.params.collection }}
                        <v-spacer />
                        <v-text-field
                                v-model="search"
                                append-icon="mdi-search"
                                label="Search"
                                single-line
                                hide-details
                        />
                    </v-card-title>
                    <v-data-table
                            :headers="headers"
                            :items="items"
                            :footer-props="{
                            'items-per-page-options': [10, 50, 100, 200, 500]
                        }"
                            show-expand
                            item-key="_id"
                            :single-expand="true"
                            :expanded.sync="expanded"
                            :options.sync="options"
                            :server-items-length="totalItems"
                            :loading="loading"
                    >
                        <template v-slot:expanded-item="{headers, item}">
                            <td v-if="item && item._id" :colspan="headers.length" class="expanded-document">
                                <document-edit
                                        @documentUpdate="onDocumentUpdate"
                                        @documentDelete="onDocumentDelete"
                                        :allowed-fields="model.fields"
                                        :document="item"
                                />
                            </td>
                        </template>
                    </v-data-table>
                </v-card>
                <v-btn color="blue" @click="newDocumentModal = true" dark big fixed bottom right fab>
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-col>
            <v-col v-if="!model">
                Model not found :(
            </v-col>
        </v-row>
        <v-snackbar v-model="toast.open" :timeout="3000">
            {{ toast.message }}
            <v-btn color="blue" text @click="toast.open = false">
                Close
            </v-btn>
        </v-snackbar>
        <v-dialog ref="dateModal" v-if="model && newDocumentModal" v-model="newDocumentModal" width="70%">
            <document-edit class="popup-hosting" :allowed-fields="model.fields" :new-item="true" @documentUpdate="onDocumentUpdate" />
        </v-dialog>
        <v-dialog v-model="errorPopup.open" width="290px">
            <v-card>
                <v-card-title class="red--text text--darken-4">
                    <v-icon color="#B71C1C" style="margin-right: 5px;">mdi-alert-circle-outline</v-icon>
                    Oops...
                </v-card-title>
                <v-card-text>
                    {{ errorPopup.message }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text color="primary" type="button" @click="errorPopup.open = false">Got it</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import { http } from '../mixins/http';
    import { FieldTypes, formats } from '../../lib/enums';
    import moment from "moment";
    import _ from 'lodash';

    export default {
        mixins: [
            http
        ],
        data: () => ({
            model: null,
            options: {},
            loading: true,
            errorPopup: {
                open: false
            },
            expanded: [],
            toast: { open: false },
            newDocumentModal: false,
            search: '',
            totalItems: 0,
            headers: [],
            items: [],
            searchTimeut: 0,
        }),
        async mounted () {
            this.init();
        },
        watch: {
            $route () {
                this.init();
                this.fetchResults();
            },
            search () {
                return this.searchDebounce();
            },
            options: {
                handler () {
                    return this.fetchResults();
                },
                deep: true
            }
        },
        methods: {
            init () {
                this.search = '';
                this.model = this.$router.collections[this.$route.params.collection];
            },
            searchDebounce () {
                clearTimeout(this.searchTimeut);

                this.searchTimeut = setTimeout(() => {
                    this.fetchResults()
                }, 700);
            },
            async fetchResults () {
                this.loading = true;

                try {
                    const { sortBy, sortDesc, page, itemsPerPage } = this.options;
                    const payload = { search: this.search, itemsPerPage, page };

                    if (sortBy.length) {
                        payload.sort = { [sortBy[0]]: (sortDesc.length && true === sortDesc[0] ? -1 : 1) }
                    }

                    const { items, fields, totalItems } = (await this.post('collections/' + this.$route.params.collection, payload));
                    this.totalItems = totalItems;
                    this.items = items.map(item => {
                        fields.map(field => {
                            if (FieldTypes.Date === this.model.fields[field].type && _.get(item, field)) {
                                const val = _.get(item, field);

                                _.set(item, field, moment(val).format(formats.uiDate));
                            }
                        });

                        return item;
                    });
                    this.headers = fields.map(field => {
                        const prettyField = field.split('.').map(val => _.startCase(val)).join(' > ');

                        return { value: field, text: prettyField };
                    });
                } catch (error) {
                    this.errorPopup.message = error.message;
                    this.errorPopup.open = true;
                }

                this.loading = false;
            },
            onDocumentUpdate (newItem) {
                const existingDoc = this.items.find(item => item._id === newItem._id);
                if (existingDoc) {
                    Object.assign(existingDoc, newItem);

                    this.openToast('Document Successfully Saved!')
                } else { // new item
                    this.newDocumentModal = false;
                    this.options.page = 1;
                    this.search = newItem._id;
                }
            },
            onDocumentDelete (itemId) {
                const existingIndex = this.items.findIndex(item => item._id === itemId);
                if (-1 < existingIndex) {
                    this.items.splice(existingIndex, 1);
                    this.openToast('Document Deleted Successfully!');
                }
            },
            openToast (message) {
                this.toast.message = message;
                this.toast.open = true;
            }
        }
    }
</script>

<style scoped lang="scss">
    ::v-deep .v-data-table {
        th[role="columnheader"] {
            white-space: nowrap;
        }
        td {
            word-break: break-word;
        }
        td.expanded-document {
            background-color: #efefef;
        }
    }
</style>
<style lang="scss">
    .theme--dark {
        td.expanded-document {
            background-color: #222 !important;
        }
    }
</style>