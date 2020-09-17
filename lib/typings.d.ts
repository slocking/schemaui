interface IPermissions {
    read: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

/**
 * TBD - Global options for SchemaUI package
 */
interface IGlobalOptions {

}

interface IModelOptions {
    /**
     * define which field are available while displaying the collection documents
     */
    listFields?: string[];
    /**
     * restrict which fields are available. if this option is supplied, all the rest are ignored
     */
    fields?: string[];
    /**
     * UI options per collection - read | create | edit | delete
     */
    permissions?: IPermissions
}

declare class SchemaUI {
    init (options?: IGlobalOptions): void;
    /**
     *
     * @param mongooseModel a pre well-defined mongoose model
     * @param options model specific options
     */
    registerModel (mongooseModel: any, options: IModelOptions): void;
}

// @ts-ignore
export = new SchemaUI();