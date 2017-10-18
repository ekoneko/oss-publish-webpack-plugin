import ALY from 'aliyun-sdk'

// interface IDefaultOSSOptions {
//     apiVersion: string;
// }

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
    includes?: RegExp[];
    excludes?: RegExp[];
}

export default class OSSPublishWebpackPlugin {
    // private ossOptions: IOSSOptions & IDefaultOSSOptions
    private options: IOptions
    private ossClient: any

    constructor (options: IOptions) {
        this.options = options
    }

    public apply (compiler) {
        const {oss} = this.options
        if (!oss.accessKeyId || !oss.secretAccessKey) {
            return
        }

        // @see https://github.com/aliyun-UED/aliyun-sdk-js/blob/master/samples/oss/oss.js
        this.ossClient = new ALY.OSS({
            apiVersion: '2013-10-15',
            ...oss,
        })

        compiler.plugin('after-emit', (compilation) => {
            const files = this.getFiles(compilation.assets)
            files.forEach(file => this.publish(file))
        })
    }

    private publish (file: file) {
        // @see https://github.com/aliyun-UED/aliyun-sdk-js/blob/master/samples/oss/PutObject.js
        this.ossClient.putObject({
            Bucket: this.options.bucket,
            Key: file.name,
            Body: file.body
        }, (err, data) => {
            if (err) {
                console.error('[oss] publish failed: ${file.name}', err)
            } else {
                console.log(`[oss] publish success: ${file.name}`)
            }
        })
    }

    private getFiles (assets): file[] {
        return Object.keys(assets)
            .map((name) => {
                if (!this._verifyFile(name)) {
                    return null
                }
                const source = assets[name].source()
                const body = Buffer.from(source, 'utf8')
                return {name, body}
            })
            .filter(i => i)
    }

    private _verifyFile (name): boolean {
        const {includes, excludes} = this.options
        if (includes && includes instanceof Array && includes.length) {
            if (!includes.some(include => include.test(name))) {
                return false
            }
        }
        if (excludes && excludes instanceof Array && excludes.length) {
            if (!excludes.some(exclude => !exclude.test(name))) {
                return false
            }
        }
        return true
    }
}
