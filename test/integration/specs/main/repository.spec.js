import repository from './../../../../src/main/repository'

describe('repository', () => {
  it('creates a git repository ready to deploy the new blog', () => {
    repository.createBlog({
      name: 'foo',
      directory: './bar'
    })
  })
})
