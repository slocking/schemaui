exports.FieldTypes = {
    Object: 'object',
    ObjectId: 'objectId',
    String: 'string',
    Number: 'number',
    Date: 'date',
    Boolean: 'boolean',
};

exports.formats = {
    uiDate: 'YYYY-MM-DD HH:mm',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
};

exports.PermissionType = {
    Read: 'read',
    Create: 'create',
    Edit: 'edit',
    Delete: 'delete'
};

exports.AuditTypes = {
    create: 'create',
    edit: 'edit',
    delete: 'delete'
}