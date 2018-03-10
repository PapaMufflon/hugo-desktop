<template>
    <section class="section">
      <div class="field">
        <label class="label">Give us the name of your new blog and the location where it should be stored.</label>
        <div class="control">
          <input class="input" type="text" placeholder="Blog title" v-model="blogName">
        </div>
      </div>

      <div class="field is-grouped">
        <p class="control is-expanded">
          <input class="input" type="folder" placeholder="Local destination folder" v-model="directory">
        </p>
        <div class="control">
          <a class="button is-info" v-on:click="chooseFolder">
            Select
          </a>
        </div>
      </div>

      <div class="field is-grouped is-grouped-right">
        <p class="control">
          <a class="button is-primary" v-on:click="createBlog">
            Create
          </a>
        </p>
      </div>
    </section>
</template>

<script>
  const ipcRenderer = require('electron').ipcRenderer
  const Store = require('electron-store')
  const store = new Store()

  export default {
    name: 'create',
    data: function () {
      return {
        blogName: '',
        directory: ''
      }
    },
    methods: {
      chooseFolder: function () {
        let that = this

        require('electron').ipcRenderer.on('directory', function (event, message) {
          that.directory = message[0]
        })

        ipcRenderer.send('selectDirectory')
      },
      createBlog: function () {
        const hugo = require('child_process').execFile
        const cwd = require('cwd')
        const path = require('path')
        const git = require('nodegit')
        const fs = require('fs')

        let that = this
        let blogPath = path.join(that.directory, that.blogName)

        hugo(path.join(cwd(), 'hugo.exe'), ['new', 'site', blogPath], function (err, data) {
          if (err) {
            console.error(err)
            return
          }

          console.log(data.toString())

          var defaultThemeSubmodule
          var defaultThemeRepo
          let relativeThemesFolder = path.join('themes', 'hugo-minimalist-theme')

          console.log('initiating repository...')

          git.Repository.init(blogPath, 0)
            .then(function (repo) {
              console.log('repository initiated, adding submodule...')

              return git.Submodule.addSetup(repo, 'https://github.com/digitalcraftsman/hugo-minimalist-theme.git', relativeThemesFolder, 0)
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function (_defaultThemeSubmodule) {
              console.log('submodule added, now initializing it...')
              defaultThemeSubmodule = _defaultThemeSubmodule

              return defaultThemeSubmodule.init(0)
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function () {
              console.log('submodule initiated, now opening it...')

              return defaultThemeSubmodule.open()
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function (_defaultThemeRepo) {
              console.log('opened it, now fetching history...')
              defaultThemeRepo = _defaultThemeRepo

              return defaultThemeRepo.fetch('origin', null, null)
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function () {
              console.log('history fetched, now getting origin/master...')

              return defaultThemeRepo.getReference('origin/master')
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function (reference) {
              console.log('got origin/master, now getting the head...')

              return reference.peel(git.Object.TYPE.COMMIT)
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function (commit) {
              console.log('got the head, now creating the master branch with it...')

              return defaultThemeRepo.createBranch('master', commit.id())
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function () {
              console.log('master branch created, now finalizing...')

              return defaultThemeSubmodule.addFinalize()
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function () {
              console.log('finalized, now checking out head...')

              return defaultThemeRepo.checkoutBranch('master')
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
            .then(function () {
              console.log('head checked out, now setting up the config')

              let themesFolder = path.join(blogPath, relativeThemesFolder)
              let sourceConfig = path.join(themesFolder, 'exampleSite', 'config.toml')
              let destinationConfig = path.join(blogPath, 'config.toml')

              fs.mkdirSync(path.join(blogPath, 'content', 'post'))

              fs.readFile(sourceConfig, 'utf8', function (err, data) {
                if (err) {
                  return console.log(err)
                }

                var result = data.replace(/# Remove[\s\S]*\.\."/g, '')

                fs.writeFile(destinationConfig, result, 'utf8', function (err) {
                  if (err) return console.log(err)

                  console.log('rewrote config, start hugo and go to the editor')

                  var recentBlogs = store.get('recent-blogs')

                  if (recentBlogs === undefined) {
                    recentBlogs = []
                  }

                  recentBlogs.push({
                    title: that.blogName,
                    subtitle: '',
                    path: blogPath
                  })

                  store.set('recent-blogs', recentBlogs)

                  that.$store.commit('CHANGE_BLOG_PATH', blogPath)
                  that.$router.push({path: '/editor'})
                })
              })
            })
            .catch(function (reasonForFailure) {
              console.log(reasonForFailure)
            })
        })
      }
    }
  }
</script>

<style>
</style>