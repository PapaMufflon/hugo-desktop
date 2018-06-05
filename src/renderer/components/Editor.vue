<template>
    <div>
        <div class="container">
            <nav class="navbar is-transparent">
                <div class="navbar-brand">
                    <navbar-go-back-button destination="content">
                    </navbar-go-back-button>

                    <a class="navbar-item" href="https://github.com/PapaMufflon/hugo-desktop">
                      hugo-desktop
                    </a>

                    <button @click="toggleMode">
                      Toggle
                    </button>
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
                    <webview class="fill-parent" :src="previewUrl"></webview>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import unified from 'unified'
  import parse from 'remark-parse'
  import Vue from 'vue'

  import NavbarGoBackButton from './Shared/NavbarGoBackButton'
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
        console.log(e)
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

  const Compiler = (tree, file) => {
    let result = ''
    let metadata = []
    let currentLine = 1

    visitor(tree)

    function visitChildren (node) {
      if (node.children) {
        node.children.forEach(x => visitor(x))
      }
    }

    function visitor (node) {
      switch (node.type) {
        case 'link':
          const textNode = node.children.find(x => x.type === 'text')

          metadata.push({
            type: 'decoration',
            start: {
              line: currentLine,
              column: textNode.position.start.column - 1
            },
            end: {
              line: currentLine + textNode.position.end.line - textNode.position.start.line,
              column: textNode.position.end.column - 1
            },
            url: node.url,
            text: textNode.value
          })

          currentLine += node.position.end.line - textNode.position.end.line
          visitChildren(node)
          break

        case 'text':
          result += node.value
          visitChildren(node)
          break

        case 'paragraph':
          visitChildren(node)
          result += '\r\n\r\n'
          currentLine += 2
          break

        case 'listItem':
          result += '- '
          visitChildren(node)
          break

        case 'heading':
          visitChildren(node)
          result += '\r\n'
          currentLine++
          break

        case 'image':
          metadata.push({
            type: 'widget',
            lineNumber: currentLine,
            url: node.url
          })
          result += '\r\n'
          currentLine++
          break

        default:
          visitChildren(node)
      }
    }

    file.metadata = metadata

    return result
  }

  function stringify (options) {
    this.Compiler = Compiler
  }

  export default {
    name: 'editor',
    components: { NavbarGoBackButton, MarkdownHeader, MarkdownImage, MarkdownLink, PostsMenuItem, Publish },
    data: function () {
      return {
        content: '',
        currentPost: '',
        renaming: false,
        showPreview: true,
        selection: {},
        monaco: {},
        editor: {},
        editorModel: undefined,
        isMarkdown: true
      }
    },
    computed: {
      posts () {
        return this.$store.getters.sortedPosts
      },
      previewUrl () {
        return 'http://localhost:1313/' + this.$store.state.ActiveBlog.blogData.urlPath
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

        if (this.renaming || !this.isMarkdown) {
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
      },
      toggleMode: function () {
        this.isMarkdown = !this.isMarkdown

        if (!this.isMarkdown) {
          console.log('now no markdown')
          stringify.Compiler = Compiler

          const stripFrontmatter = x => {
            const start = x.indexOf('---')
            const end = x.indexOf('---', start + 1)

            return x.substring(end + 3)
          }

          const markdown = stripFrontmatter(this.editorModel.getValue())
          const processor = unified()
            .use(parse)
            .use(stringify)

          processor.process(markdown, (err, file) => {
            console.log(err || file)
            this.editorModel.setValue(file.contents)

            let deltaDecorations = []

            file.metadata
              .filter(x => x.type === 'decoration')
              .forEach(x => {
                deltaDecorations.push({
                  range: new this.monaco.Range(
                    x.start.line,
                    x.start.column,
                    x.end.line,
                    x.end.column),
                  options: { inlineClassName: 'linkDecoration' }
                })
              })

            const ids = this.editor.deltaDecorations([], deltaDecorations)
            console.log(ids)

            const that = this

            file.metadata
              .filter(x => x.type === 'widget')
              .forEach(x => {
                that.editor.changeViewZones(function (changeAccessor) {
                  var domNode = document.createElement('div')
                  domNode.style.background = 'lightgreen'
                  changeAccessor.addZone({
                    afterLineNumber: x.lineNumber,
                    heightInLines: 3,
                    domNode: domNode
                  })
                })

                const contentWidget = {
                  domNode: null,
                  startLineNumber: x.lineNumber,
                  startColumn: 0,
                  index: 1,
                  getId: function () {
                    const id = this.startLineNumber + '-' + this.startColumn
                    console.log(id)
                    return id
                  },
                  getDomNode: function () {
                    if (!this.domNode) {
                      this.domNode = document.createElement('div')
                      this.domNode.innerHTML = `<div id="mount-point` + this.index + `"></div>`
                      this.domNode.style.background = 'grey'
                    }

                    return this.domNode
                  },
                  getPosition: function () {
                    return {
                      position: {
                        lineNumber: this.startLineNumber,
                        column: this.startColumn
                      },
                      preference: [that.monaco.editor.ContentWidgetPositionPreference.BELOW]
                    }
                  }
                }

                that.editor.addContentWidget(contentWidget)

                const Profile = Vue.extend({
                  template: `<div><input v-model="msg">
                <button v-on:click="notify">Dispatch Event</button>
                <img src="` + x.url + `"/></div>`,
                  data: function () {
                    return { msg: 'hello' }
                  },
                  methods: {
                    notify: function () {
                      if (this.msg.trim()) {
                        this.$emit('child-msg', this.msg)
                        this.msg = ''
                      }
                    }
                  }
                })

                const mountPoint = document.getElementById('mount-point' + 1)
                const mountedProfile = new Profile().$mount()
                mountPoint.appendChild(mountedProfile.$el)

                mountedProfile.$on('child-msg', function (msg) {
                  alert(msg)
                })
              })
          })
        } else {
          console.log('now markdown')
        }
      }
    }
  }
</script>

<style scoped>
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

<style>
.linkDecoration {
  color: red !important;
	cursor: pointer;
	text-decoration: underline;
	font-weight: bold;
	font-style: oblique;
}
</style>