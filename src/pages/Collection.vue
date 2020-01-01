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
                            <td v-if="item && item._id" :colspan="headers.length" style="background-color: #efefef">
                                <document-edit @documentUpdate="onDocumentUpdate" :allowed-fields="model.fields" :document="item" />
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
    </v-container>
</template>

<script>
    import { http } from '../mixins/http';

    export default {
        mixins: [
            http
        ],
        data: () => ({
            model: null,
            options: {},
            loading: true,
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
            this.model = this.$router.collections[this.$route.params.collection];
        },
        watch: {
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
            searchDebounce () {
                clearTimeout(this.searchTimeut);

                this.searchTimeut = setTimeout(() => {
                    this.fetchResults()
                }, 700);
            },
            async fetchResults () {
                this.loading = true;
                const { sortBy, sortDesc, page, itemsPerPage } = this.options;
                const payload = { search: this.search, itemsPerPage, page };

                if (sortBy.length) {
                    payload.sort = { [sortBy[0]]: (sortDesc.length && true === sortDesc[0] ? -1 : 1) }
                }

                const { items, fields, totalItems } = (await this.post('collections/' + this.$route.params.collection, payload));
                this.totalItems = totalItems;
                this.items = items;
                this.headers = fields.map(field => {
                    return { value: field, text: field };
                });

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
            openToast (message) {
                this.toast.message = message;
                this.toast.open = true;
            }
        }
    }
</script>

<style scoped lang="scss">
    th[role="columnheader"] {
        white-space: nowrap;
    }
</style>