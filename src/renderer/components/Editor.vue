<template>
    <div>
        <div class="container">
            <nav class="navbar is-transparent">
                <div class="navbar-brand">
                    <div class="navbar-burger burger" data-target="navMenu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                
                <div id="navMenu" class="navbar-menu">
                    <div class="navbar-start">
                        <posts-menu-item
                            :posts="posts"
                            @new-post="newPost"
                            @open-post="openPost">
                        </posts-menu-item>
                        
                        <markdown-header
                            :editor="editor">
                        </markdown-header>

                        <markdown-link
                            :editor="editor">
                        </markdown-link>

                        <markdown-image
                            :currentPost="currentPost"
                            :editor="editor">
                        </markdown-image>
                    </div>

                    <div class="navbar-end">
                        <publish
                            :content.sync="content">
                        </publish>
                        <a class="navbar-item" @click="toggleSplitscreen">
                            <span class="icon" style="color: #333;">
                                <font-awesome-icon :icon="['fas', 'columns']" />
                            </span>
                        </a>
                        <a class="navbar-item" @click="popOutPreview">
                            <span class="icon" style="color: #333;">
                                <font-awesome-icon :icon="['fas', 'external-link-alt']" />
                            </span>
                        </a>
                    </div>
                </div>
            </nav>
        </div>
        <div class="section main">
            <div class="columns is-gapless">
                <div :class="[{'is-half': showPreview}, 'column', 'full-height']">
                    <div
                      id="editor"
                      class="fill-parent"
                      autofocus>
                    </div>
                </div>
                <div class="column is-half full-height" v-if="showPreview">
                    <webview class="fill-parent" src="http://localhost:1313/"></webview>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import MarkdownHeader from './Editor/MarkdownHeader'
  import MarkdownImage from './Editor/MarkdownImage'
  import MarkdownLink from './Editor/MarkdownLink'
  import PostsMenuItem from './Editor/PostsMenuItem'
  import Publish from './Editor/Publish'
  
  import { BLOG_OPENED } from './../store/mutation-types'

  const path = require('path')
  const fs = require('fs')
  const sanitize = require('sanitize-filename')
  const {shell} = require('electron')
  const hugo = require('child_process').execFile
  const cwd = require('cwd')
  
  function startHugo (blogPath) {
    console.log('starting serving ' + blogPath)

    hugo(path.join(cwd(), 'hugo.exe'), ['serve', '-s', blogPath, '-D'], function (err, data) {
      if (err) {
        console.error(err)
      }
    })
  }

  function loadMonacoEditor (thisEditor) {
    const nodeRequire = global.require

    const loaderScript = document.createElement('script')

    loaderScript.onload = () => {
      const amdRequire = global.require
      global.require = nodeRequire

      var path = require('path')

      function uriFromPath (_path) {
        var pathName = path.resolve(_path).replace(/\\/g, '/')

        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
          pathName = '/' + pathName
        }

        return encodeURI('file://' + pathName)
      }

      amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, '../../../node_modules/monaco-editor/dev'))
      })

      // workaround monaco-css not understanding the environment
      self.module = undefined

      // workaround monaco-typescript not understanding the environment
      self.process.browser = true

      amdRequire(['vs/editor/editor.main'], function () {
        thisEditor.monaco = this.monaco

        const editorContainer = document.getElementById('editor')
        thisEditor.editor = this.monaco.editor.create(editorContainer, {
          wordWrap: 'on'
        })

        function updateDimensions () {
          thisEditor.editor.layout()
        }

        window.addEventListener('resize', updateDimensions)
        editorContainer.addEventListener('resize', updateDimensions)

        thisEditor.editorModel = this.monaco.editor.createModel(thisEditor.content, 'markdown')
        thisEditor.editorModel.onDidChangeContent(e => {
          thisEditor.content = thisEditor.editorModel.getValue()
        })

        thisEditor.editor.onDidChangeCursorSelection(e => {
          thisEditor.selection = e.selection
        })

        thisEditor.editor.setModel(thisEditor.editorModel)
      })
    }

    loaderScript.setAttribute('src', '../node_modules/monaco-editor/dev/vs/loader.js')
    document.body.appendChild(loaderScript)
  }

  export default {
    name: 'editor',
    components: { MarkdownHeader, MarkdownImage, MarkdownLink, PostsMenuItem, Publish },
    data: function () {
      return {
        content: '',
        posts: [],
        currentPost: '',
        renaming: false,
        showPreview: true,
        selection: {},
        monaco: {},
        editor: {},
        editorModel: undefined
      }
    },
    computed: {
      blogPostsPath () {
        return path.join(this.$store.state.BlogCollection.currentBlogPath, 'content', 'posts')
      }
    },
    created: function () {
      startHugo(this.$store.state.BlogCollection.currentBlogPath)
      loadMonacoEditor(this)

      if (this.$route.query.posts !== undefined) {
        this.posts = this.$route.query.posts
        this.currentPost = this.$route.query.post
      } else {
        fs.readdir(this.blogPostsPath, (err, files) => {
          if (err) {
            alert('An error ocurred reading the posts' + err.message)
            console.log(err)
            return
          }

          this.posts = files.map(f => {
            return {
              title: path.basename(f, path.extname(f)),
              filepath: path.join(this.blogPostsPath, f)
            }
          })

          this.currentPost = this.posts[0]
        })
      }

      this.$store.commit(BLOG_OPENED, {
        title: path.basename(this.$store.state.BlogCollection.currentBlogPath),
        subtitle: '',
        path: this.$store.state.BlogCollection.currentBlogPath
      })
    },
    watch: {
      content: function (val, oldVal) {
        if (this.editorModel && this.editorModel.getValue() !== val) {
          this.editorModel.setValue(val)
        }

        if (this.renaming) {
          return
        }

        fs.writeFile(this.currentPost.filepath, val, (err) => {
          if (err) {
            alert('An error ocurred updating the file' + err.message)
            console.log(err)
            return
          }

          const that = this

          const makeFilenameMatchContentTitle = function (dataContext) {
            let title = dataContext.content.match(/title: "(.*)"/)[1]
            let filename = sanitize(title).replace(/ /g, '-') + '.md'
            let filepath = path.join(that.blogPostsPath, filename)

            if (dataContext.currentPost.filepath !== filepath) {
              fs.rename(dataContext.currentPost.filepath, filepath, (err) => {
                if (err) {
                  alert('An error ocurred renaming the file' + err.message)
                  console.log(err)
                  dataContext.renaming = false
                  return
                }

                dataContext.currentPost.filepath = filepath
                dataContext.currentPost.title = title

                makeFilenameMatchContentTitle(dataContext)
              })
            } else {
              dataContext.renaming = false
            }
          }

          this.renaming = true
          makeFilenameMatchContentTitle(this)
        })
      },
      currentPost: function (val, oldVal) {
        if (val === undefined) {
          return
        }

        fs.readFile(val.filepath, 'utf-8', (err, data) => {
          if (err) {
            alert('An error ocurred reading the file :' + err.message)
            return
          }

          if (this.editorModel) {
            this.editorModel.setValue(data)
          } else {
            this.content = data
          }
        })
      }
    },
    methods: {
      newPost: function (newPost) {
        this.posts.push(newPost)
        this.currentPost = newPost
      },
      openPost: function (post) {
        this.currentPost = post
      },
      toggleSplitscreen: function () {
        this.showPreview = !this.showPreview
        this.editor.layout()
      },
      popOutPreview: function () {
        this.showPreview = false

        shell.openExternal('http://localhost:1313/')
      },
      updateCaretPosition: function (newPosition) {
        this.editor.setPosition(newPosition)
      },
      focusEditor: function () {
        document.getElementById('editor').getElementsByClassName('inputarea')[0].focus()
      }
    }
  }
</script>

<style>
.fill-parent {
    position: relative;
    height: 100%;
    width: 100%;
}

.full-height {
    height:80vh;
}

.section {
    padding: 0;
}
</style>