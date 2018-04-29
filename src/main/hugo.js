const hugo = require('child_process').spawn
const path = require('path')
const cwd = require('cwd')

export default {
  process: undefined,
  startServeBlog: function (blogPath) {
    if (this.process !== undefined) {
      this.process.kill('SIGINT')
    }

    this.process = hugo(path.join(cwd(), 'hugo.exe'), ['serve', '-s', blogPath, '-D'])
  },
  stopServeBlog: function () {
    this.process.kill('SIGINT')
    this.process = undefined
  }
}
