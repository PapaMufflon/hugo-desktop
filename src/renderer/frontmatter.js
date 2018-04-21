const yaml = require('js-yaml')

export default {
  parse: (data) => {
    try {
      return yaml.safeLoad(data)
    } catch (e) {
      console.log(e)
    }
  }
}
