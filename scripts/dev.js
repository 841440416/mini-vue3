const args = require('minimist')(process.argv.slice(2))
const {
  resolve
} = require('path');
const {
  build
} = require('esbuild');

const target = args._[0] || 'reactivity';
const format = args.f || 'global';

// 开发环境只打包一个
const pkg = require(resolve(__dirname, '../packages/' + target + '/package.json'));
// 模块格式
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';
// 输出路径
const outfile = resolve(__dirname, '../packages/' + target + '/dist/' + target + '.' + format + '.js');
// esbuild配置
build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true, // 把所有包全部打包到一个文件中
  sourcemap: true,
  format: outputFormat, // 输出格式
  globalName: pkg.buildOptions?.name, // 全局变量名
  platform: format === 'cjs' ? 'node' : 'browser', // 平台
  watch: { // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`rebuilt~~~~`)
    }
  }
}).then(() => {
  console.log('watching~~~')
})