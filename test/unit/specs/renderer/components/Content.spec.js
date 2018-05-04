import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from '@vue/test-utils'
import fontawesome from '@fortawesome/fontawesome'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import regular from '@fortawesome/fontawesome-free-regular'
import brands from '@fortawesome/fontawesome-free-brands'
import Content from '@/components/Content'

Vue.use(Vuex)

fontawesome.library.add(solid, regular, brands)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)

describe('Content.vue', () => {
  let vm

  beforeEach(() => {
    const getters = {
      sortedPosts: (state) => {
        return []
      }
    }

    const $store = new Vuex.Store({
      getters
    })

    const wrapper = mount(Content, {
      mocks: {
        $store
      }
    })

    vm = wrapper.vm
  })

  it('shows a published post when the filters are off', () => {
    vm.filterPublished = false
    vm.filterDrafts = false

    expect(vm.show({ draft: false })).to.equal(true)
  })

  it('shows a published post when filtering out drafts', () => {
    vm.filterPublished = false
    vm.filterDrafts = true

    expect(vm.show({ draft: false })).to.equal(true)
  })

  it('does not show a published post when filtering them out', () => {
    vm.filterPublished = true
    vm.filterDrafts = false

    expect(vm.show({ draft: false })).to.equal(false)
  })

  it('does not show a published post when filtering out drafts and published posts', () => {
    vm.filterPublished = true
    vm.filterDrafts = true

    expect(vm.show({ draft: false })).to.equal(false)
  })

  it('shows a draft when the filters are off', () => {
    vm.filterPublished = false
    vm.filterDrafts = false

    expect(vm.show({ draft: true })).to.equal(true)
  })

  it('shows a draft when filtering out published posts', () => {
    vm.filterPublished = true
    vm.filterDrafts = false

    expect(vm.show({ draft: true })).to.equal(true)
  })

  it('does not show a draft when filtering them out', () => {
    vm.filterPublished = false
    vm.filterDrafts = true

    expect(vm.show({ draft: true })).to.equal(false)
  })

  it('does not show a draft when filtering out drafts and published posts', () => {
    vm.filterPublished = true
    vm.filterDrafts = true

    expect(vm.show({ draft: true })).to.equal(false)
  })
})
