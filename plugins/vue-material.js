import Vue from 'vue'
import VueMaterial from 'vue-material'

Vue.use(VueMaterial)

// fix vue-material beta15 bug
// https://github.com/vuematerial/vue-material/issues/2285#issuecomment-1059410143
Vue.component(
  'MdFile',
  Vue.options.components.MdFile.extend({
    methods: {
      isInvalidValue: function isInvalidValue () {
        return this.$el.validity
          ? this.$el.validity.badInput
          : this.$el.querySelector('input').validity.badInput
      }
    }
  })
)
Vue.component(
  'MdSelect',
  Vue.options.components.MdSelect.extend({
    methods: {
      isInvalidValue: function isInvalidValue () {
        return this.$el.validity
          ? this.$el.validity.badInput
          : this.$el.querySelector('input').validity.badInput
      }
    }
  })
)
