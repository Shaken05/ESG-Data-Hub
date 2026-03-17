import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ru from './locales/ru'
import kk from './locales/kk'

const savedLocale = localStorage.getItem('esg-locale') || 'en'
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, ru, kk },
})

export default i18n
