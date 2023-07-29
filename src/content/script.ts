// @ts-ignore
// Adding the query script and module is not a valid path, it's from crxjs
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import listeners from '../web/listeners?script&module'

const url = chrome.runtime.getURL(listeners)
const script = document.createElement('script')

script.src = url
script.type = 'module'

document.head.append(script)
