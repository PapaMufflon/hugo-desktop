<template>
    <div>
        <div class="container">
            <nav class="navbar is-transparent">
                <div class="navbar-brand">
                    <a class="navbar-item" @click="goToContent">
                      <span class="icon">
                        <font-awesome-icon :icon="['fas', 'arrow-left']" />
                      </span>
                    </a>

                    <a class="navbar-item" href="https://github.com/PapaMufflon/hugo-desktop">
                      hugo-desktop
                    </a>
                </div>
                
                <div id="navMenu" class="navbar-menu">
                    <div class="navbar-start">
                        <posts-menu-item
                            :posts="posts"
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
  
  import { SET_AMD_REQUIRE, CHANGE_POST } from './../store/mutation-types'

  const path = require('path')
  const fs = require('fs')
  const sanitize = require('sanitize-filename')
  const {shell} = require('electron')

  function requireMonacoEditor (amdRequire, thisEditor) {
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

  function loadMonacoEditor (thisEditor) {
    if (thisEditor.$store.state.AmdRequire.amdRequire.config === undefined) {
      const nodeRequire = global.require
      const loaderScript = document.createElement('script')

      loaderScript.onload = () => {
        const amdRequire = global.require
        thisEditor.$store.commit(SET_AMD_REQUIRE, amdRequire)

        global.require = nodeRequire

        requireMonacoEditor(amdRequire, thisEditor)
      }

      loaderScript.setAttribute('src', '../node_modules/monaco-editor/dev/vs/loader.js')
      document.body.appendChild(loaderScript)
    } else {
      requireMonacoEditor(thisEditor.$store.state.AmdRequire.amdRequire, thisEditor)
    }
  }

  export default {
    name: 'editor',
    components: { MarkdownHeader, MarkdownImage, MarkdownLink, PostsMenuItem, Publish },
    data: function () {
      return {
        content: '',
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
      posts () {
        return this.$store.getters.sortedPosts
      }
    },
    created: function () {
      this.currentPost = this.$route.query.post
    },
    mounted: function () {
      loadMonacoEditor(this)
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

          const makeFilenameMatchContentTitle = function (dataContext, postsPath) {
            let title = dataContext.content.match(/title: "(.*)"/)[1]
            let filename = sanitize(title).replace(/ /g, '-') + '.md'
            let filepath = path.join(postsPath, filename)

            if (dataContext.currentPost.filepath !== filepath) {
              fs.rename(dataContext.currentPost.filepath, filepath, (err) => {
                if (err) {
                  alert('An error ocurred renaming the file' + err.message)
                  console.log(err)
                  dataContext.renaming = false
                  return
                }

                dataContext.$store.commit(CHANGE_POST, dataContext.currentPost, {
                  filepath: filepath,
                  title: title
                })

                makeFilenameMatchContentTitle(dataContext, postsPath)
              })
            } else {
              dataContext.renaming = false
            }
          }

          this.renaming = true
          makeFilenameMatchContentTitle(this, this.$store.getters.postsPath)
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
      openPost: function (post) {
        this.currentPost = post
      },
      goToContent: function () {
        this.$router.push({path: '/content'})
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