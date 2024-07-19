import { createI18n } from 'vue-i18n'
import CN from './zh-cn'
import EN from './en'
import { ConfigTaskService } from '../common/entity/configTaskService'

const messages =  {
    'zh-CN': CN,
    'en-US': EN
}
const configTaskService = new ConfigTaskService()
const i18n = createI18n({
    locale: await configTaskService.getLanguage(),
    legacy: false,
    globalInjection: true,
    messages,
})
export default i18n