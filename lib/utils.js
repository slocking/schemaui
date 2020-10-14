const { AuditTypes } = require('./enums');

function getAuditLogModel (mongooseInstance, dbInstance) {
    const logModelName = 'SchemaUIAuditLog';

    if (!dbInstance.models[logModelName]) {
        const auditLogSchema = new mongooseInstance.Schema({
            collection_name: String,
            type: {
                type: String,
                enum: Object.values(AuditTypes)
            },
            document_id: mongooseInstance.Schema.Types.ObjectId,
            initiator: mongooseInstance.Schema.Types.Mixed,
            modifiedFields: Object,
            date: {
                type: Date,
                default: Date.now
            }
        }, {
            collection: 'audit_log',
            strict: false
        });

        return dbInstance.model(logModelName, auditLogSchema);
    }

    return dbInstance.models[logModelName];
}

module.exports = {
    getAuditLogModel
};