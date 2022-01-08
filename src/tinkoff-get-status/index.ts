import {getStoredParam} from '../utils/getStoredParam'
import OpenAPI from '@tinkoff/invest-openapi-js-sdk'

const apiURL = 'https://api-invest.tinkoff.ru/openapi/sandbox'
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws'

export const handler = async () => {
  const apiKey = await getStoredParam('tinkoff_api_key_sandbox')
  const api = new OpenAPI({apiURL, secretToken: apiKey, socketURL})
  const portfolio = await api.portfolio()
  return {
    statusCode: 200,
    body: JSON.stringify(portfolio)
  }
}
