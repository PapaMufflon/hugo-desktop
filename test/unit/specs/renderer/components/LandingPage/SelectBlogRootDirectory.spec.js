import { shallow } from '@vue/test-utils'
import SelectBlogRootDirectory from '@/components/LandingPage/SelectBlogRootDirectory'

const loopbackIpcRenderer = {
  on: function (s, callback) {
    this.callback = callback
  },
  callback: {},
  send: function (s) {
    this.callback({}, [this.selectedDirectory])
  },
  selectedDirectory: '',
  setSelectedDirectory: function (directory) {
    this.selectedDirectory = directory
  }
}

describe('SelectBlogRootDirectory.vue', () => {
  it('should display the chosen directory', () => {
    loopbackIpcRenderer.setSelectedDirectory('foo')

    SelectBlogRootDirectory.__Rewire__('electron', {
      ipcRenderer: loopbackIpcRenderer
    })

    const wrapper = shallow(SelectBlogRootDirectory)

    wrapper.find('.button').trigger('click')

    expect(wrapper.vm.directory).to.contain('foo')
  })
})
