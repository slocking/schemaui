<template>
    <div>
        <v-form @submit.prevent="saveDocument" ref="editForm">
            <v-card class="fields-container" v-if="fields && Object.keys(fields).length">
                <v-row v-if="!newItem">
                    <v-col class="d-flex justify-end id-label grey--text text--accent-4">
                        ID: {{ item._id }}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col sm="10" md="8" lg="6">
                        <template v-if="fields[fieldTypes.String]">
                            <dynamic-field v-for="field of fields[fieldTypes.String]" :key="field.key" v-model="item[field.key]" :field="field" />
                        </template>
                        <template v-if="fields[fieldTypes.Number]">
                            <dynamic-field v-for="field of fields[fieldTypes.Number]" :key="field.key" v-model="item[field.key]" :field="field" />
                        </template>
                        <template v-if="fields[fieldTypes.ObjectId]">
                            <dynamic-field v-for="field of fields[fieldTypes.ObjectId]" :key="field.key" v-model="item[field.key]" :field="field" />
                        </template>
                        <template v-if="fields[fieldTypes.Date]">
                            <v-text-field
                                    v-for="(field, index) of fields[fieldTypes.Date]"
                                    v-model="item[field.key]"
                                    :key="field.key"
                                    :outlined="true"
                                    :rules="requiredField(field.required, field.key)"
                                    :required="field.required"
                                    :label="getFieldName(field.key)"
                                    @click="openDateModal(field.key, index)"
                                    @focus="openDateModal(field.key, index)"
                                    prepend-icon="mdi-calendar"
                                    readonly
                            />
                            <v-dialog
                                    ref="dateModal"
                                    v-model="dateModal.open"
                                    persistent
                                    width="290px">
                                <v-date-picker v-if="1 === dateModal.step" v-model="dateModal.date" scrollable>
                                    <v-spacer />
                                    <v-btn text color="primary" @click="dateModal.open = false">Cancel</v-btn>
                                    <v-btn text color="primary" :disabled="!dateModal.date" @click="dateModal.step = 2">Next</v-btn>
                                </v-date-picker>
                                <v-time-picker v-if="2 === dateModal.step" format="24hr" v-model="dateModal.time" full-width>
                                    <v-spacer />
                                    <v-btn text color="primary" @click="dateModal.step = 1">Back</v-btn>
                                    <v-btn text color="primary" :disabled="!dateModal.time" @click="saveDateModal()">OK</v-btn>
                                </v-time-picker>
                            </v-dialog>
                        </template>
                        <template v-if="fields[fieldTypes.Boolean]">
                            <dynamic-field v-for="field of fields[fieldTypes.Boolean]" :key="field.key" v-model="item[field.key]" :field="field" />
                        </template>
                    </v-col>
                </v-row>
                <v-card-actions>
                    <v-spacer />
                    <v-btn v-if="newItem" raised color="primary" :loading="loading" :disabled="loading" type="submit">Create new Document</v-btn>
                    <template v-if="!newItem">
                        <v-btn text color="#f00" :disabled="loading" type="button" @click="openDeleteConfirm = true">Delete</v-btn>
                        <v-btn raised color="primary" :loading="loading" :disabled="loading" type="submit">Save Changes</v-btn>
                    </template>
                </v-card-actions>
                <v-dialog
                        ref="openDeleteConfirm"
                        v-model="openDeleteConfirm"
                        width="290px">
                    <v-card>
                        <v-card-title>Are you sure?</v-card-title>
                        <v-card-text>
                            You're about to delete this document, proceed with this action?
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn text color="primary" type="button" :disabled="loading" @click="deleteItem()">Sure, DO IT!</v-btn>
                        </v-card-actions>
                    </v-card>
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
            </v-card>
            <v-progress-circular
                v-if="false === loaded"
                :size="50"
                color="primary"
                indeterminate
            />
        </v-form>
    </div>
</template>

<script>
    import { FieldTypes } from './../../lib/enums';
    import { http } from '../mixins/http';
    import { form } from '../mixins/form';
    import _ from 'lodash';
    import { formats } from '../../lib/enums';
    import moment from 'moment';

    export default {
        mixins: [
            http,
            form
        ],
        props: [
            'allowedFields',
            'document',
            'newItem'
        ],
        data () {
            return {
                fieldTypes: FieldTypes,
                loaded: false,
                loading: false,
                openDeleteConfirm: false,
                errorPopup: {
                    open: false
                },
                fields: {},
                item: {},
                dateModal: {},
            }
        },
        async mounted () {
            this.init();
        },
        computed: {
            _ () {
                return _;
            }
        },
        methods: {
            requiredField (isRequired, fieldName) {
                if (isRequired) {
                    return [
                        v => !!v || 'Missing ' + _.startCase(fieldName),
                        v => Boolean('string' === typeof v && v.trim().length) || 'Invalid ' + _.startCase(fieldName),
                    ]
                }

                return [];
            },
            parseModelFromDb (item) {
                const parsedItem = {};
                const fieldKeys = Object.keys(this.allowedFields);

                for (const key of fieldKeys) {
                    if (_.has(item, key)) {
                        const val = _.get(item, key);
                        const field = _.get(this.allowedFields, key);

                        if (FieldTypes.Date === field.type && val && val.length) {
                            parsedItem[key] = moment(val).format(formats.uiDate);
                        } else {
                            parsedItem[key] = val;
                        }
                    }
                }

                return parsedItem;
            },
            formatModelToDb (item) {
                const formattedItem = {};
                const fieldKeys = Object.keys(this.allowedFields);

                for (const key of fieldKeys) {
                    if (item.hasOwnProperty(key)) {
                        const field = _.get(this.allowedFields, key);

                        if (FieldTypes.Date === field.type && item[key] && item[key].length) {
                            _.set(formattedItem, key, moment(item[key], formats.uiDate).toISOString());
                        } else {
                            _.set(formattedItem, key, item[key]);
                        }
                    }
                }

                return formattedItem;
            },
            async init () {
                if (this.newItem) {
                    const item = await this.get(
                        `collections/${this.$route.params.collection}/initial`
                    );
                    this.item = this.parseModelFromDb(item);
                } else {
                    const item = await this.get(
                        `collections/${this.$route.params.collection}/${this.document._id}`
                    );
                    this.item = this.parseModelFromDb(item);
                }
                this.fields = _.groupBy(this.allowedFields, 'type');
                // this.fields = _(this.allowedFields).groupBy('type').sortBy('type');
                this.loaded = true;
            },
            saveDateModal () {
                this.item[this.dateModal.key] = `${this.dateModal.date} ${this.dateModal.time}`;
                this.dateModal = {};
            },
            openDateModal (fieldKey) {
                this.dateModal = {
                    key: fieldKey,
                    step: 1,
                    open: true,
                };

                if (this.item[fieldKey] && this.item[fieldKey].length) {
                    const dateObj = moment(this.item[fieldKey], formats.uiDate);

                    this.dateModal.date = dateObj.format(formats.dateFormat);
                    this.dateModal.time = dateObj.format(formats.timeFormat);
                }
            },
            async saveDocument () {
                const formValid = this.$refs.editForm.validate();

                if (!formValid) {
                    return;
                }

                if (true === this.loading) {
                    return;
                }

                this.loading = true;

                try {
                    const itemClone = _.cloneDeep(this.item); // make sure the DOM item isn't affected by reference
                    const formattedItem = this.formatModelToDb(itemClone);

                    const savedItem = await this.post(`collections/${this.$route.params.collection}/save`, formattedItem);

                    if (this.newItem) {
                        this.$emit('documentUpdate', { _id: savedItem._id });
                    } else {
                        this.$emit('documentUpdate', itemClone);
                    }
                } catch (error) {
                    this.errorPopup.message = error.message;
                    this.errorPopup.open = true;
                }

                this.loading = false;
            },
            async deleteItem () {
                if (true === this.loading) {
                    return;
                }

                this.loading = true;

                try {
                    const documentId = this.document._id;
                    await this.delete(`collections/${this.$route.params.collection}/${documentId}`);
                    this.$emit('documentDelete', documentId);

                    this.openDeleteConfirm = false;
                } catch (error) {
                    this.errorPopup.message = error.message;
                    this.errorPopup.open = true;
                }
                this.loading = false;

            },
        },
        watch: {
            document () {
                this.loaded = false;
                this.fields = {};
                this.item = {};
                this.init();
            },
        }
    }
</script>

<style scoped lang="scss">
    .popup-hosting .fields-container {
        margin: 0;
    }

    form {
        display: flex;
        min-height: 250px;

        > * {
            flex: 1;
        }

        .v-progress-circular {
            align-self: center;
        }
    }
    .fields-container {
        margin: 26px 10px;
        padding: 20px;
    }

    .id-label {
        padding-right: 25px;
        font-family: monospace;
    }
</style>