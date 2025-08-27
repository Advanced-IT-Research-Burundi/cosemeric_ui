// directives/select2.js
import $ from 'jquery'
import 'select2'

export default {
  mounted(el, binding) {
    $(el).select2(binding.value || {})
  },
  unmounted(el) {
    $(el).select2('destroy')
  }
}
