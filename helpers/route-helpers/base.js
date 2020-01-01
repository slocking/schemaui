class BaseRoute {
    constructor () {
        return new Proxy(this, this);
    }

    get (target, prop) {
        return async function (request, response) {
            const body = {
                success: false,
                data: null
            };

            try {
                body.data = (await target[prop](request, response));
                body.success = true;
            } catch (error) {
                body.data = error.message;
            }

            return response.json(body);
        }
    }
}

module.exports = BaseRoute;