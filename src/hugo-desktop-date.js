'use strict'

export default {
  toShortDate: (d) => {
    const components = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    const paddings = [4, 2, 2]

    return components.map((component, i) => component.toString().padStart(paddings[i], '0')).join('-')
  }
}
