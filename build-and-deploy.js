/* eslint-disable @typescript-eslint/no-var-requires */
const inquirer = require('inquirer')
const esbuild = require('esbuild')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function main() {
  const ui = new inquirer.ui.BottomBar()
  const {functionName, action} = await inquirer.prompt([
    {
      type: 'list',
      name: 'functionName',
      message: 'Which lambda function to process?',
      choices: ['tinkoff-get-status']
    },
    {
      type: 'list',
      name: 'action',
      message: 'What shall we do?',
      choices: [
        {
          key: '1',
          name: 'Build and deploy',
          value: 'buildAndDeploy'
        },
        {
          key: '2',
          name: 'Just build',
          value: 'build'
        }
      ],
      default: 'buildAndDeploy'
    }
  ])

  ui.log.write(`Building ${functionName}...`)
  await build(functionName)
  ui.log.write(`🏗 Build complete.`)

  if (action !== 'buildAndDeploy') {
    return
  }

  ui.log.write(`Compressing...`)
  await zip(functionName)
  ui.log.write(`🗜 Created ${functionName}.zip`)

  ui.log.write(`Deploying...`)
  await deploy(functionName)
  ui.log.write(`🌐 Deployed to AWS Lambda`)

  ui.log.write(`Cleaning up...`)
  await cleanup(functionName)
  ui.log.write(`🎉 Done!`)
}

function build(functionName) {
  return esbuild
    .build({
      entryPoints: [`./src/${functionName}/index.ts`],
      bundle: true,
      platform: 'node',
      target: ['node14.0'],
      external: ['aws-sdk'],
      outdir: `./${functionName}`
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

function zip(functionName) {
  return exec(`zip -j ${functionName}.zip  ./${functionName}/index.js`)
}

function deploy(functionName) {
  return exec(
    `aws lambda update-function-code --function-name ${functionName} --zip-file fileb://${functionName}.zip`
  )
}

function cleanup(functionName) {
  return exec(`rm ${functionName}.zip & rm -rf ./${functionName}`)
}

main()
