import { expect } from 'chai'
import sinon from 'sinon'
import ActiveBlog from '@/store/modules/ActiveBlog'
import { ADD_POST, SET_BLOG_BASE_PATH, CHANGE_POST, OPEN_BLOG } from '@/store/mutation-types'

describe('ActiveBlog', () => {
  it('can add a new blog post', () => {
    const state = {
      blogData: {
        posts: []
      }
    }

    ActiveBlog.mutations[ADD_POST](state, {
      title: 'new post'
    })

    expect(state.blogData.posts).to.have.length(1)
  })

  it('sets the blog base path', () => {
    const state = {
      blogData: {
        basePath: ''
      }
    }

    ActiveBlog.mutations[SET_BLOG_BASE_PATH](state, 'FOO')

    expect(state.blogData.basePath).to.equal('FOO')
  })

  it('changes properties of an existing post', () => {
    const thePost = {
      foo: 'bar',
      foobar: 'foo'
    }

    const state = {
      blogData: {
        posts: [ thePost ]
      }
    }

    ActiveBlog.mutations[CHANGE_POST](state, thePost, {
      foo: 'baz',
      foobar: 'foobaz'
    })

    expect(state.blogData.posts[0].foo).to.equal('baz')
    expect(state.blogData.posts[0].foobar).to.equal('foobaz')
  })

  it('ignores new properties for a post', () => {
    const thePost = {
      foo: 'bar'
    }

    const state = {
      blogData: {
        posts: [ thePost ]
      }
    }

    ActiveBlog.mutations[CHANGE_POST](state, thePost, {
      foobar: 'foobaz'
    })

    expect(state.blogData.posts[0].foo).to.equal('bar')
    expect(state.blogData.posts[0]).to.not.haveOwnProperty('foobar')
  })

  it('sets the blogs base path when opening a blog', () => {
    const commit = sinon.spy()
    const state = {
      blogData: {
        basePath: '',
        posts: []
      }
    }

    ActiveBlog.__Rewire__('fs', {
      readdir: function (postsPath, callback) {
        callback(undefined, [])
      }
    })

    ActiveBlog.actions[OPEN_BLOG]({commit, state}, 'basePath')

    expect(commit.args[0]).to.deep.equal(['SET_BLOG_BASE_PATH', 'basePath'])
  })

  it('adds all existing posts when opening a blog', () => {
    const commit = sinon.spy()
    const state = {
      blogData: {
        basePath: '',
        posts: []
      }
    }

    ActiveBlog.__Rewire__('fs', {
      readdir: function (postsPath, callback) {
        callback(undefined, ['file', 'post'])
      },
      readFile: function (path, format, callback) {
        if (path.endsWith('file')) {
          callback(undefined, `---
title: foo
---`)
        } else {
          callback(undefined, `---
title: bar
---`)
        }
      }
    })

    ActiveBlog.actions[OPEN_BLOG]({commit, state}, 'basePath')

    expect(commit.args[2]).to.deep.equal(
      ['ADD_POST', {
        title: 'foo',
        date: undefined,
        draft: undefined,
        categories: undefined,
        tags: undefined,
        titleImage: undefined,
        filepath: 'basePath\\content\\posts\\file'
      }]
    )

    expect(commit.args[3]).to.deep.equal(
      ['ADD_POST', {
        title: 'bar',
        date: undefined,
        draft: undefined,
        categories: undefined,
        tags: undefined,
        titleImage: undefined,
        filepath: 'basePath\\content\\posts\\post'
      }]
    )
  })

  it('removes the old posts when opening a new blog', () => {
    const commit = sinon.spy()
    const state = {
      blogData: {
        basePath: '',
        posts: []
      }
    }

    ActiveBlog.__Rewire__('fs', {
      readdir: function (postsPath, callback) {
        callback(undefined, [])
      }
    })

    ActiveBlog.actions[OPEN_BLOG]({commit, state}, 'basePath')

    expect(commit.args[1]).to.deep.equal(
      ['UNLOAD_ACTIVE_BLOG']
    )
  })

  it('sorts the posts by date', () => {
    const state = {
      blogData: {
        posts: [
          { date: new Date(2018, 5, 3) },
          { date: new Date(2018, 5, 4) },
          { date: new Date(2018, 5, 2) }
        ]
      }
    }

    const sortedPosts = ActiveBlog.getters.sortedPosts(state)

    expect(sortedPosts).to.deep.equal([
      { date: new Date(2018, 5, 4) },
      { date: new Date(2018, 5, 3) },
      { date: new Date(2018, 5, 2) }
    ])
  })
})
