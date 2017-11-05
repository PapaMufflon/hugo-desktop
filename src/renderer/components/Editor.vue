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
                            :content.sync="content"
                            :selection-start="selectionStart"
                            :selection-end="selectionEnd">
                        </markdown-header>

                        <markdown-link
                            :content.sync="content"
                            :selection-start="selectionStart"
                            :selection-end="selectionEnd"
                            @change-caret-position="updateCaretPosition"
                            @text-area-focus-wtf="textAreaFocusWtf">
                        </markdown-link>

                        <markdown-image
                            :content.sync="content"
                            :selection-start="selectionStart"
                            :selection-end="selectionEnd"
                            @change-caret-position="updateCaretPosition"
                            @text-area-focus-wtf="textAreaFocusWtf">
                        </markdown-image>
                    </div>

                    <div class="navbar-end">
                        <a class="navbar-item" @click="toggleSplitscreen">
                            <span class="icon" style="color: #333;">
                                <i class="fa fa-lg fa-columns"></i>
                            </span>
                        </a>
                        <a class="navbar-item" @click="popOutPreview">
                            <span class="icon" style="color: #333;">
                                <i class="fa fa-lg fa-external-link"></i>
                            </span>
                        </a>
                    </div>
                </div>
            </nav>
        </div>
        <div class="section main">
            <div class="columns is-gapless">
                <div :class="[{'is-half': showPreview}, 'column', 'full-height']">
                    <textarea
                        id="source"
                        class="fill-parent"
                        autofocus
                        v-model="content"
                        @keyup="setSelectionStartAndEnd"
                        @click="setSelectionStartAndEnd">
                    </textarea>
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

  const path = require('path')
  const fs = require('fs')
  const sanitize = require('sanitize-filename')
  const {shell} = require('electron')
  const Vue = require('vue')
  
  const alsnuffPath = path.join(require('cwd')(), 'alsnuff')
  const alsnuffPosts = path.join(alsnuffPath, 'content', 'posts')

  export default {
    name: 'editor',
    components: { MarkdownHeader, MarkdownImage, MarkdownLink, PostsMenuItem },
    data: function () {
      return {
        content: '',
        posts: [],
        currentPost: '',
        renaming: false,
        showPreview: true,
        selectionStart: 0,
        selectionEnd: 0
      }
    },
    created: function () {
      fs.readdir(alsnuffPosts, (err, files) => {
        if (err) {
          alert('An error ocurred reading the posts' + err.message)
          console.log(err)
          return
        }

        this.posts = files.map(f => {
          return {
            title: path.basename(f, path.extname(f)),
            filepath: path.join(alsnuffPosts, f)
          }
        })

        this.currentPost = this.posts[0]
      })
    },
    watch: {
      content: function (val, oldVal) {
        if (this.renaming) {
          return
        }

        fs.writeFile(this.currentPost.filepath, val, (err) => {
          if (err) {
            alert('An error ocurred updating the file' + err.message)
            console.log(err)
            return
          }

          const makeFilenameMatchContentTitle = function (dataContext) {
            let title = dataContext.content.match(/title: "(.*)"/)[1]
            let filename = sanitize(title).replace(/ /g, '-') + '.md'
            let filepath = path.join(alsnuffPosts, filename)

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
        fs.readFile(val.filepath, 'utf-8', (err, data) => {
          if (err) {
            alert('An error ocurred reading the file :' + err.message)
            return
          }

          this.content = data
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
      },
      popOutPreview: function () {
        this.showPreview = false

        shell.openExternal('http://localhost:1313/')
      },
      setSelectionStartAndEnd: function () {
        let sourceElement = document.getElementById('source')

        this.selectionStart = sourceElement.selectionStart
        this.selectionEnd = sourceElement.selectionEnd
      },
      updateCaretPosition: function (newVal) {
        let sourceElement = document.getElementById('source')

        function setCaretPosition () {
          if (sourceElement === document.activeElement) {
            sourceElement.selectionEnd = newVal
            console.log('set caret position')
          } else {
            console.log('waiting...')
            Vue.nextTick(setCaretPosition)
          }
        }

        setCaretPosition()
      },
      textAreaFocusWtf: function () {
        let sourceElement = document.getElementById('source')
        sourceElement.focus()
      }
    }
  }
</script>

<style>

</style>