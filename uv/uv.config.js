/* Ultraviolet Configuration for Static Athyx Network */
(() => {
    let basePath = '';
    try {
        const path = self.location.pathname;
        const uvIndex = path.indexOf('/uv/');
        if (uvIndex !== -1) {
            basePath = path.substring(0, uvIndex);
        } else {
            const scramjetIndex = path.indexOf('/scramjet/');
            if (scramjetIndex !== -1) {
                basePath = path.substring(0, scramjetIndex);
            }
        }
    } catch (e) {}

    self.__uv$config = {
        prefix: (basePath ? basePath : '') + '/uv/service/',
        bare: '/bare/',
        encodeUrl: (u) => {
            if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
                return Ultraviolet.codec.xor.encode(u);
            }
            return encodeURIComponent(u);
        },
        decodeUrl: (u) => {
            if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
                return Ultraviolet.codec.xor.decode(u);
            }
            return decodeURIComponent(u);
        },
        handler: (basePath ? basePath : '') + '/uv/uv.handler.js',
        client: (basePath ? basePath : '') + '/uv/uv.client.js',
        bundle: (basePath ? basePath : '') + '/uv/uv.bundle.js',
        config: (basePath ? basePath : '') + '/uv/uv.config.js',
        sw: (basePath ? basePath : '') + '/uv/uv.sw.js',
    };
})();
