import AWS from 'aws-sdk'

const parameterStore = new AWS.SSM()

/** Get a value of parameter stored in AWS Systems Manager */
export const getStoredParam = (paramName: string) => {
  return new Promise<string>((resolve, reject) => {
    parameterStore.getParameter(
      {
        Name: paramName,
        WithDecryption: true
      },
      (err, data) => {
        if (err) {
          return reject(err)
        }
        if (!data.Parameter?.Value) {
          return reject('not found')
        }
        return resolve(data.Parameter.Value)
      }
    )
  })
}
