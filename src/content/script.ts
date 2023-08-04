// Adding the query script and module is not a valid path, it's from crxjs
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
// @ts-ignore
import initUrl from '@/web/init?script&module'
import { moegiOptions } from '@/services/options'
import './listeners'

// Inject initial script to current page with saved options
const initElement = document.createElement('script');

initElement.src = chrome.runtime.getURL(initUrl)
initElement.type = 'module'
initElement.defer = true
initElement.async = true
initElement.dataset.dictPath = chrome.runtime.getURL('dict/')
initElement.dataset.extensionId = chrome.runtime.id
initElement.dataset.moegiScript = ''
initElement.dataset.moegiOptions = JSON.stringify(moegiOptions)
document.head.appendChild(initElement);
