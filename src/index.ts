import ALY from 'aliyun-sdk'

interface IDefaultOSSOptions {
    apiVersion: string;
}

interface file {
    name: string;
    body: Buffer;
}

export interface IOSSOptions {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
}

export interface IOptions {
    oss: IOSSOptions;
    bucket: string;
    include?: RegExp;
    exclude?: RegExp;
}

class OSSPublishWebpackPlugin {
    private ossOptions: IOSSOptions & IDefaultOSSOptions
    private options: IOptions
    private oss: any

    constructor (options: IOptions) {
        const {oss} = options
        this.ossOptions = {
            apiVersion: '2013-10-15',
            accessKeyId: oss.accessKeyId,
            secretAccessKey: oss.secretAccessKey,
            endpoint: oss.endpoint
        }
    }

    public apply (compiler) {
        if (!this.ossOptions.accessKeyId || !this.ossOptions.secretAccessKey) {
            return
        }

        // @see https://github.com/aliyun-UED/aliyun-sdk-js/blob/master/samples/oss/oss.js
        this.oss = new ALY.OSS(this.ossOptions)

        compiler.plugin('after-emit', (compilation) => {
            const files = this.getFiles(compilation.assets)
            files.forEach(file => this.publish(file))
        })
    }

    private publish (file: file) {
        // @see https://github.com/aliyun-UED/aliyun-sdk-js/blob/master/samples/oss/PutObject.js
        this.oss.putObject({
            Bucket: this.options.bucket,
            Key: file.name,
            Body: file.body
        }, (err, data) => {
            if (err) {
                console.error('[oss] publish failed', err)
            } else {
                console.log(`[Uploaded] ${file.name}`)
            }
        })
    }

    private getFiles (assets): file[] {
        return Object.keys(assets)
            .map((name) => {
                if (this.options.include && !this.options.include.test(name)) {
                    return null
                }
                if (this.options.exclude && this.options.exclude.test(name)) {
                    return null
                }
                const source = assets[name].source()
                const body = Buffer.from(source, 'utf8')
                return {name, body}
            })
            .filter(i => i)
    }
}

module.exports = OSSPublishWebpackPlugin
