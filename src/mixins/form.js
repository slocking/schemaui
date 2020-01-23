import _ from "lodash";

export const form = {
    methods: {
        getFieldName (fieldKey = '') {
            return fieldKey.split('.').map(val => _.startCase(val)).join(' > ');
        }
    }
};