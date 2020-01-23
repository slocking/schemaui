<script>
    /* eslint-disable */
    import { FieldTypes } from '../../lib/enums';
    import _ from 'lodash';
    import { form } from '../mixins/form';
    import { VTextField, VTextarea, VCombobox, VSelect, VSwitch } from 'vuetify/lib/components';

    export default {
        props: ['value'],
        mixins: [form],
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
            requiredNumber (isRequired, fieldName) {
                if (isRequired) {
                    return [
                        v => ('undefined' !== typeof v || !!v) || 'Missing ' + _.startCase(fieldName),
                        v => Boolean('number' === typeof v) || 'Invalid ' + _.startCase(fieldName),
                    ]
                }

                return [];
            },
            requiredFieldArray (isRequired, fieldName) {
                if (isRequired) {
                    return [
                        v => (Array.isArray(v) && Boolean(v.length)) || 'Missing ' + _.startCase(fieldName),
                        v => (Array.isArray(v) && 0 === v.filter(val => 0 === val.trim().length).length) || 'Invalid ' + _.startCase(fieldName),
                    ]
                }

                return [];
            },
            requiredObjectId (isRequired, fieldName) {
                if (isRequired) {
                    return [
                        v => !!v || 'Missing ' + _.startCase(fieldName),
                        v => Boolean('string' === typeof v && /^[a-z0-9]{24}$/.test(v)) || 'Invalid ' + _.startCase(fieldName),
                    ]
                }

                return [];
            },
            requiredObjectIdArray (isRequired, fieldName) {
                if (isRequired) {
                    return [
                        v => (Array.isArray(v) && Boolean(v.length)) || 'Missing ' + _.startCase(fieldName),
                        v => (Array.isArray(v) && 0 === v.filter(val => false === /^[a-z0-9]{24}$/.test(val)).length) || 'Invalid ' + _.startCase(fieldName),
                    ]
                }

                return [];
            },
        },
        render (createElement) {
            const self = this;
            const field = self.$attrs.field;
            const [element, props] = getElementWithProps();

            if ('_id' === field.key) {
                return;
            }

            return createElement(
                element,
                {
                    props,
                    on: {
                        input: newValue => self.$emit('input', transformValue(newValue)),
                        change: newValue => {
                            if (FieldTypes.Boolean === field.type) {
                                self.$emit('input', Boolean(newValue)) // handle required only for VSwitch elements
                            }
                        }
                    }
                }
            );

            function transformValue (Value) {
                if (field.type === FieldTypes.Number &&  false === isNaN(parseInt(Value))) {
                    return parseInt(Value);
                }

                return Value;
            }

            function getElementWithProps () {
                let element = VTextField;
                const props = {
                    value: self.value,
                    placeholder: self.getFieldName(field.key),
                    label: self.getFieldName(field.key),
                    outlined: true,
                    required: field.required,
                    dense: true,
                    rules: self.requiredField(field.required, field.key)
                };

                const hasEnum = field.hasOwnProperty('enum');

                switch (field.type) {
                    case FieldTypes.String:
                        if (field.multi || true === hasEnum) {
                            element = field.multi ? VCombobox : VSelect;
                            props.multiple = field.multi;
                            props.chips = field.multi;
                            props.rules = field.multi ? self.requiredFieldArray(field.required, field.key) : self.requiredField(field.required, field.key);

                            if (true === hasEnum) {
                                element = VSelect;
                                props.items = field.enum;
                                props.clearable = true;
                            }
                        } else if (true === field.textarea) {
                            element = VTextarea;
                            props['auto-grow'] = true;
                        }
                        break;
                    case FieldTypes.ObjectId:
                        if (field.multi) {
                            element = VCombobox;
                            props.multiple = true;
                            props.chips = true;
                            props.rules = self.requiredObjectIdArray(field.required, field.key);
                        } else {
                            props.rules = self.requiredObjectId(field.required, field.key);
                        }
                        break;
                    case FieldTypes.Number:
                        element = VTextField;
                        props.type = field.type;
                        props.rules = self.requiredNumber(field.required, field.key);
                        break;
                    case FieldTypes.Boolean:
                        element = VSwitch;
                        props['input-value'] = self.value;
                        delete props.value;
                        delete props.required;
                        delete props.rules;
                        break;
                    default:
                        throw new Error(`Couldn't find any type for ${field.key}`);
                }

                return [element, props];
            }
        },
    }
</script>