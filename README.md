A webpack plugin for uploading files to aliyun oss

````
import OSSPublishWebpackPlugin from 'oss-publish-webpack-plugin'

{
  plugins: [
    new OSSPublishWebpackPlugin({
      bucket: 'your bucket',
      includes: [/\/assets\//], // optional
      excludes: [], // optional
      oss: {
        accessKeyId: '',
        secretAccessKey: '',
        endpoint: 'http://oss-cn-beijing-internal.aliyuncs.com'
      }
    })
  ]
}
````
