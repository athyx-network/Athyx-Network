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
        encodeUrl: typeof Ultraviolet !== 'undefined' ? Ultraviolet.codec.xor.encode : (u => encodeURIComponent(u)),
        decodeUrl: typeof Ultraviolet !== 'undefined' ? Ultraviolet.codec.xor.decode : (u => decodeURIComponent(u)),
        handler: (basePath ? basePath : '') + '/uv/uv.handler.js',
        bundle: (basePath ? basePath : '') + '/uv/uv.bundle.js',
        config: (basePath ? basePath : '') + '/uv/uv.config.js',
        sw: (basePath ? basePath : '') + '/uv/uv.sw.js',
    };
})();
