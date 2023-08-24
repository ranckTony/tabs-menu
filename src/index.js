import TabsMenu from './tabs-menu/index.vue'

export default TabsMenu

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('tabs-menu', TabsMenu)
}